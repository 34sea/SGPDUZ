const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Função auxiliar para determinar a subpasta do ficheiro pelo MIME Type
const getSubfolderByMimeType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype === 'application/pdf') return 'pdf';
  if (
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'excel';
  }
  return 'others';
};

// ==========================================
// TAREFAS AD-HOC (adhoc_tasks)
// ==========================================

// Listar tarefas com filtros (atribuídas por, atribuídas a, estado)
exports.getTasks = async (req, res) => {
  try {
    const { assigned_by, assigned_to, status } = req.query;

    let query = `
      SELECT 
        t.*,
        u_by.name AS assigned_by_name,
        u_by.email AS assigned_by_email,
        u_to.name AS assigned_to_name,
        u_to.email AS assigned_to_email
      FROM adhoc_tasks t
      INNER JOIN users u_by ON t.assigned_by = u_by.id
      INNER JOIN users u_to ON t.assigned_to = u_to.id
      WHERE 1=1
    `;
    const params = [];

    if (assigned_by) {
      query += ` AND t.assigned_by = ?`;
      params.push(assigned_by);
    }

    if (assigned_to) {
      query += ` AND t.assigned_to = ?`;
      params.push(assigned_to);
    }

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY t.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Obter detalhes de uma tarefa com histórico de submissões
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tasks] = await pool.query(`
      SELECT 
        t.*,
        u_by.name AS assigned_by_name,
        u_to.name AS assigned_to_name
      FROM adhoc_tasks t
      INNER JOIN users u_by ON t.assigned_by = u_by.id
      INNER JOIN users u_to ON t.assigned_to = u_to.id
      WHERE t.id = ?
    `, [id]);

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarefa ad-hoc não encontrada.' });
    }

    // Carregar histórico de submissões da tarefa
    const [submissions] = await pool.query(
      `SELECT * FROM task_submissions WHERE task_id = ? ORDER BY submitted_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...tasks[0],
        submissions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Criar nova tarefa (Atribuída por Chefe de Curso / Departamento)
exports.createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, deadline } = req.body;
    const assigned_by = req.user.id; // ID extraído do token JWT

    if (!title || !assigned_to || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'title, assigned_to e deadline são obrigatórios.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO adhoc_tasks (title, description, assigned_by, assigned_to, deadline, status) 
       VALUES (?, ?, ?, ?, ?, 'PENDENTE')`,
      [title, description || null, assigned_by, assigned_to, deadline]
    );

    return res.status(201).json({
      success: true,
      message: 'Tarefa ad-hoc atribuída com sucesso.',
      data: { id: result.insertId }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Atualizar tarefa (Título, Descrição, Deadline ou Estado)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status } = req.body;

    const [result] = await pool.query(
      `UPDATE adhoc_tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        deadline = COALESCE(?, deadline),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [title, description, deadline, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Tarefa ad-hoc não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Tarefa ad-hoc atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar tarefa (Remove também em cascata no BD e limpa os ficheiros associados no disco)
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar submissões antes de eliminar para remover os ficheiros do disco
    const [submissions] = await pool.query(
      `SELECT proof_file_url FROM task_submissions WHERE task_id = ? AND proof_file_url IS NOT NULL`,
      [id]
    );

    const [result] = await pool.query('DELETE FROM adhoc_tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Tarefa ad-hoc não encontrada.' });
    }

    // Limpar ficheiros associados
    submissions.forEach((sub) => {
      if (sub.proof_file_url) {
        const filePath = path.resolve(__dirname, '..', '..', sub.proof_file_url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    return res.status(200).json({ success: true, message: 'Tarefa ad-hoc e submissões associadas eliminadas.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// SUBMISSÕES DE TAREFAS (task_submissions)
// ==========================================

// Submeter resposta/comprovativo da tarefa (Realizado pelo Docente)
exports.submitTaskProof = async (req, res) => {
  try {
    const { task_id, notes } = req.body;

    if (!task_id) {
      return res.status(400).json({ success: false, message: 'O campo task_id é obrigatório.' });
    }

    // Verifica se a tarefa existe
    const [tasks] = await pool.query('SELECT * FROM adhoc_tasks WHERE id = ?', [task_id]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarefa não encontrada.' });
    }

    const task = tasks[0];
    let proof_file_url = null;

    if (req.file) {
      const subfolder = getSubfolderByMimeType(req.file.mimetype);
      proof_file_url = `/uploads/${subfolder}/${req.file.filename}`;
    }

    // Registar submissão
    const [result] = await pool.query(
      `INSERT INTO task_submissions (task_id, proof_file_url, notes) 
       VALUES (?, ?, ?)`,
      [task_id, proof_file_url, notes || null]
    );

    // Atualizar estado da tarefa: se foi submetida após a deadline passa para atrasada ou entregue
    const now = new Date();
    const deadlineDate = new Date(task.deadline);
    const newStatus = now > deadlineDate ? 'ATRASADA' : 'ENTREGUE';

    await pool.query('UPDATE adhoc_tasks SET status = ? WHERE id = ?', [newStatus, task_id]);

    return res.status(201).json({
      success: true,
      message: 'Comprovativo/Submissão registada com sucesso.',
      data: {
        submission_id: result.insertId,
        proof_file_url,
        task_status: newStatus
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Avaliar/Verificar submissão (Aprovar ou Rejeitar pelo Chefe)
exports.reviewSubmission = async (req, res) => {
  try {
    const { submission_id } = req.params;
    const { is_approved, feedback } = req.body;

    if (typeof is_approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'O campo is_approved deve ser um booleano (true/false).'
      });
    }

    const [submissions] = await pool.query('SELECT * FROM task_submissions WHERE id = ?', [submission_id]);
    if (submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'Submissão não encontrada.' });
    }

    const submission = submissions[0];

    // Atualiza a submissão
    await pool.query(
      `UPDATE task_submissions SET 
        is_approved = ?, 
        feedback = ? 
       WHERE id = ?`,
      [is_approved, feedback || null, submission_id]
    );

    // Se aprovada, define o estado da tarefa para VERIFICADA
    if (is_approved) {
      await pool.query('UPDATE adhoc_tasks SET status = "VERIFICADA" WHERE id = ?', [submission.task_id]);
    }

    return res.status(200).json({
      success: true,
      message: is_approved ? 'Submissão aprovada e tarefa verificada.' : 'Submissão avaliada com observações/feedback.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};