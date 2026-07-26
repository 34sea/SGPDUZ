const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Função auxiliar para identificar a subpasta com base no MIME Type (alinhada com o Multer)
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
// ASSESSMENTS (Avaliações / Testes / Trabalhos)
// ==========================================

exports.getAssessments = async (req, res) => {
  try {
    const { class_subject_teacher_id, status } = req.query;

    let query = `
      SELECT 
        a.*,
        cst.class_id,
        cst.subject_id,
        cst.teacher_id,
        s.name AS subject_name,
        u.name AS teacher_name
      FROM assessments a
      INNER JOIN class_subject_teachers cst ON a.class_subject_teacher_id = cst.id
      INNER JOIN subjects s ON cst.subject_id = s.id
      INNER JOIN users u ON cst.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (class_subject_teacher_id) {
      query += ` AND a.class_subject_teacher_id = ?`;
      params.push(class_subject_teacher_id);
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.assessment_date DESC, a.id DESC`;

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        a.*,
        cst.class_id,
        cst.subject_id,
        cst.teacher_id,
        s.name AS subject_name,
        u.name AS teacher_name
      FROM assessments a
      INNER JOIN class_subject_teachers cst ON a.class_subject_teacher_id = cst.id
      INNER JOIN subjects s ON cst.subject_id = s.id
      INNER JOIN users u ON cst.teacher_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Avaliação não encontrada.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAssessment = async (req, res) => {
  try {
    const {
      class_subject_teacher_id,
      title,
      assessment_date,
      deadline_date,
      results_published_date
    } = req.body;

    if (!class_subject_teacher_id || !title || !assessment_date || !deadline_date) {
      return res.status(400).json({
        success: false,
        message: 'class_subject_teacher_id, title, assessment_date e deadline_date são obrigatórios.'
      });
    }

    // Calcula automaticamente o status inicial com base na publicação de notas
    let status = 'PENDENTE';
    if (results_published_date) {
      const pubDate = new Date(results_published_date);
      const deadDate = new Date(deadline_date);
      status = pubDate <= deadDate ? 'DENTRO_DO_PRAZO' : 'FORA_DO_PRAZO';
    }

    const [result] = await pool.query(
      `INSERT INTO assessments 
        (class_subject_teacher_id, title, assessment_date, results_published_date, deadline_date, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        class_subject_teacher_id,
        title,
        assessment_date,
        results_published_date || null,
        deadline_date,
        status
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Avaliação registada com sucesso.',
      data: { id: result.insertId, status }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      assessment_date,
      results_published_date,
      deadline_date,
      status
    } = req.body;

    let computedStatus = status;
    if (!computedStatus && results_published_date && deadline_date) {
      const pubDate = new Date(results_published_date);
      const deadDate = new Date(deadline_date);
      computedStatus = pubDate <= deadDate ? 'DENTRO_DO_PRAZO' : 'FORA_DO_PRAZO';
    }

    const [result] = await pool.query(
      `UPDATE assessments SET 
        title = COALESCE(?, title),
        assessment_date = COALESCE(?, assessment_date),
        results_published_date = COALESCE(?, results_published_date),
        deadline_date = COALESCE(?, deadline_date),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [
        title,
        assessment_date,
        results_published_date,
        deadline_date,
        computedStatus,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Avaliação não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Avaliação atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM assessments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Avaliação não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Avaliação eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// FINAL GRADE SHEETS (Pautas Finais)
// ==========================================

exports.getFinalGradeSheets = async (req, res) => {
  try {
    const { class_subject_teacher_id, epoch } = req.query;

    let query = `
      SELECT 
        fgs.*,
        cst.class_id,
        cst.subject_id,
        cst.teacher_id,
        s.name AS subject_name,
        u.name AS uploader_name,
        u.email AS uploader_email
      FROM final_grade_sheets fgs
      INNER JOIN class_subject_teachers cst ON fgs.class_subject_teacher_id = cst.id
      INNER JOIN subjects s ON cst.subject_id = s.id
      INNER JOIN users u ON fgs.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (class_subject_teacher_id) {
      query += ` AND fgs.class_subject_teacher_id = ?`;
      params.push(class_subject_teacher_id);
    }

    if (epoch) {
      query += ` AND fgs.epoch = ?`;
      params.push(epoch);
    }

    query += ` ORDER BY fgs.uploaded_at DESC`;

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFinalGradeSheetById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        fgs.*,
        cst.class_id,
        cst.subject_id,
        cst.teacher_id,
        s.name AS subject_name,
        u.name AS uploader_name
      FROM final_grade_sheets fgs
      INNER JOIN class_subject_teachers cst ON fgs.class_subject_teacher_id = cst.id
      INNER JOIN subjects s ON cst.subject_id = s.id
      INNER JOIN users u ON fgs.uploaded_by = u.id
      WHERE fgs.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pauta final não encontrada.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createFinalGradeSheet = async (req, res) => {
  try {
    const { class_subject_teacher_id, epoch } = req.body;
    const uploaded_by = req.user.id;

    // 1. Verifica se o ficheiro foi processado pelo Multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'O ficheiro da pauta é obrigatório. Por favor faça o upload do documento.'
      });
    }

    // 2. Validação dos campos obrigatórios do body
    if (!class_subject_teacher_id || !epoch) {
      return res.status(400).json({
        success: false,
        message: 'class_subject_teacher_id e epoch são obrigatórios.'
      });
    }

    const validEpochs = ['NORMAL', 'RECURSO', 'ESPECIAL'];
    if (!validEpochs.includes(epoch)) {
      return res.status(400).json({
        success: false,
        message: `Época inválida. Valores aceites: ${validEpochs.join(', ')}`
      });
    }

    // 3. Monta o caminho relativo com base no ficheiro salvo pelo Multer
    const subfolder = getSubfolderByMimeType(req.file.mimetype);
    const file_url = `/uploads/${subfolder}/${req.file.filename}`;

    // 4. Grava no banco de dados
    const [result] = await pool.query(
      `INSERT INTO final_grade_sheets (class_subject_teacher_id, epoch, file_url, uploaded_by) 
       VALUES (?, ?, ?, ?)`,
      [class_subject_teacher_id, epoch, file_url, uploaded_by]
    );

    return res.status(201).json({
      success: true,
      message: 'Pauta final submetida com sucesso.',
      data: {
        id: result.insertId,
        file_url
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFinalGradeSheet = async (req, res) => {
  try {
    const { id } = req.params;

    // Procura o ficheiro na base de dados para eliminar o ficheiro físico do sistema
    const [rows] = await pool.query('SELECT file_url FROM final_grade_sheets WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pauta final não encontrada.' });
    }

    const fileUrl = rows[0].file_url;

    // Apaga o registo do banco de dados
    await pool.query('DELETE FROM final_grade_sheets WHERE id = ?', [id]);

    // Elimina o ficheiro físico da pasta de uploads
    if (fileUrl) {
      const filePath = path.resolve(__dirname, '..', '..', fileUrl.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(200).json({ success: true, message: 'Pauta final eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};