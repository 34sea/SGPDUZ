const pool = require('../config/db');

// ==========================================
// LESSONS (Registo e Gestão de Aulas)
// ==========================================

// exports.getLessons = async (req, res) => {
//   try {
//     const { class_subject_teacher_id, status, start_date, end_date } = req.query;

//     let query = `
//       SELECT 
//         l.*,
//         cst.class_id,
//         cst.subject_id,
//         cst.teacher_id,
//         tu.title AS topic_unit_title,
//         u.name AS teacher_name
//       FROM lessons l
//       INNER JOIN class_subject_teachers cst ON l.class_subject_teacher_id = cst.id
//       LEFT JOIN topic_units tu ON l.topic_unit_id = tu.id
//       INNER JOIN users u ON cst.teacher_id = u.id
//       WHERE 1=1
//     `;
//     const params = [];

//     if (class_subject_teacher_id) {
//       query += ` AND l.class_subject_teacher_id = ?`;
//       params.push(class_subject_teacher_id);
//     }

//     if (status) {
//       query += ` AND l.status = ?`;
//       params.push(status);
//     }

//     if (start_date && end_date) {
//       query += ` AND l.lesson_date BETWEEN ? AND ?`;
//       params.push(start_date, end_date);
//     }

//     query += ` ORDER BY l.lesson_date DESC, l.id DESC`;

//     const [rows] = await pool.query(query, params);
//     return res.status(200).json({ success: true, data: rows });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

// No getLessons (dentro de lessonController_3.js):
exports.getLessons = async (req, res) => {
  try {
    const { class_subject_teacher_id, status, start_date, end_date } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role_name;

    let query = `
      SELECT 
        l.*,
        cst.class_id,
        cl.name AS class_name,
        cst.subject_id,
        s.name AS subject_name,
        cst.teacher_id,
        tu.title AS topic_unit_title,
        u.name AS teacher_name
      FROM lessons l
      INNER JOIN class_subject_teachers cst ON l.class_subject_teacher_id = cst.id
      INNER JOIN classes cl ON cst.class_id = cl.id
      INNER JOIN subjects s ON cst.subject_id = s.id
      LEFT JOIN topic_units tu ON l.topic_unit_id = tu.id
      INNER JOIN users u ON cst.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Se for DOCENTE, restringe estritamente às aulas das disciplinas dele
    if (userRole === 'DOCENTE') {
      query += ` AND cst.teacher_id = ?`;
      params.push(userId);
    }

    if (class_subject_teacher_id) {
      query += ` AND l.class_subject_teacher_id = ?`;
      params.push(class_subject_teacher_id);
    }

    if (status) {
      query += ` AND l.status = ?`;
      params.push(status);
    }

    if (start_date && end_date) {
      query += ` AND l.lesson_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    query += ` ORDER BY l.lesson_date DESC, l.id DESC`;

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTeacherAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT 
        cst.id AS class_subject_teacher_id,
        cst.class_id,
        cl.name AS class_name,
        cst.subject_id,
        s.name AS subject_name,
        s.code AS subject_code
      FROM class_subject_teachers cst
      INNER JOIN classes cl ON cst.class_id = cl.id
      INNER JOIN subjects s ON cst.subject_id = s.id
      WHERE cst.teacher_id = ?
    `, [userId]);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const [lessons] = await pool.query(`
      SELECT 
        l.*,
        cst.class_id,
        cst.subject_id,
        cst.teacher_id,
        tu.title AS topic_unit_title,
        u.name AS teacher_name
      FROM lessons l
      INNER JOIN class_subject_teachers cst ON l.class_subject_teacher_id = cst.id
      LEFT JOIN topic_units tu ON l.topic_unit_id = tu.id
      INNER JOIN users u ON cst.teacher_id = u.id
      WHERE l.id = ?
    `, [id]);

    if (lessons.length === 0) {
      return res.status(404).json({ success: false, message: 'Aula não encontrada.' });
    }

    const lesson = lessons[0];

    // Procura o histórico de validações/confirmações da aula
    const [confirmations] = await pool.query(`
      SELECT 
        lc.*,
        u.name AS representative_name,
        u.email AS representative_email
      FROM lesson_confirmations lc
      INNER JOIN users u ON lc.user_id = u.id
      WHERE lc.lesson_id = ?
      ORDER BY lc.created_at DESC
    `, [id]);

    return res.status(200).json({
      success: true,
      data: {
        ...lesson,
        confirmations
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const {
      class_subject_teacher_id,
      topic_unit_id,
      lesson_date,
      content_taught,
      is_cancelled,
      cancellation_reason
    } = req.body;

    if (!class_subject_teacher_id || !lesson_date) {
      return res.status(400).json({
        success: false,
        message: 'class_subject_teacher_id e lesson_date são obrigatórios.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO lessons 
        (class_subject_teacher_id, topic_unit_id, lesson_date, content_taught, is_cancelled, cancellation_reason, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'REGISTADA')`,
      [
        class_subject_teacher_id,
        topic_unit_id || null,
        lesson_date,
        content_taught || null,
        is_cancelled || false,
        cancellation_reason || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Aula sumariada/registada com sucesso.',
      data: { id: result.insertId }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      topic_unit_id,
      lesson_date,
      status,
      is_cancelled,
      cancellation_reason,
      content_taught
    } = req.body;

    const validStatuses = [
      'REGISTADA',
      'CONFIRMADA',
      'CONFIRMADA_COM_RESSALVA',
      'EM_DISPUTA',
      'RESOLVIDA',
      'PENDENTE_PROLONGADA'
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Valores aceites: ${validStatuses.join(', ')}`
      });
    }

    const [result] = await pool.query(
      `UPDATE lessons SET 
        topic_unit_id = COALESCE(?, topic_unit_id),
        lesson_date = COALESCE(?, lesson_date),
        status = COALESCE(?, status),
        is_cancelled = COALESCE(?, is_cancelled),
        cancellation_reason = COALESCE(?, cancellation_reason),
        content_taught = COALESCE(?, content_taught)
       WHERE id = ?`,
      [topic_unit_id, lesson_date, status, is_cancelled, cancellation_reason, content_taught, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Aula não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Dados da aula atualizados com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM lessons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Aula não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Registo de aula eliminado.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// LESSON CONFIRMATIONS (Validação pelos Representantes)
// ==========================================

exports.confirmLesson = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { lesson_id, status_given, remarks } = req.body;
    const user_id = req.user.id; // ID do Chefe/Subchefe vindo do JWT

    if (!lesson_id || !status_given) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'lesson_id e status_given são obrigatórios.'
      });
    }

    const validStatusGiven = ['CONFIRMADA', 'RESSALVA', 'EM_DISPUTA'];
    if (!validStatusGiven.includes(status_given)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `status_given inválido. Valores aceites: ${validStatusGiven.join(', ')}`
      });
    }

    // 1. Inserir histórico no lesson_confirmations
    const [confirmResult] = await connection.query(
      `INSERT INTO lesson_confirmations (lesson_id, user_id, status_given, remarks) 
       VALUES (?, ?, ?, ?)`,
      [lesson_id, user_id, status_given, remarks || null]
    );

    // 2. Mapear o status_given para o status correspondente da tabela lessons
    let targetLessonStatus = 'CONFIRMADA';
    if (status_given === 'RESSALVA') {
      targetLessonStatus = 'CONFIRMADA_COM_RESSALVA';
    } else if (status_given === 'EM_DISPUTA') {
      targetLessonStatus = 'EM_DISPUTA';
    }

    // 3. Atualizar o estado da aula na tabela lessons
    const [updateResult] = await connection.query(
      `UPDATE lessons SET status = ? WHERE id = ?`,
      [targetLessonStatus, lesson_id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Aula especificada não existe.' });
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Confirmação/Validação registada com sucesso.',
      data: {
        confirmation_id: confirmResult.insertId,
        new_lesson_status: targetLessonStatus
      }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

exports.getConfirmationsByLesson = async (req, res) => {
  try {
    const { lesson_id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        lc.*,
        u.name AS representative_name,
        u.email AS representative_email
      FROM lesson_confirmations lc
      INNER JOIN users u ON lc.user_id = u.id
      WHERE lc.lesson_id = ?
      ORDER BY lc.created_at DESC
    `, [lesson_id]);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};