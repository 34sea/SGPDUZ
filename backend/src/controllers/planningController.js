const pool = require('../config/db');

// ==========================================
// 1. PLANOS ANALÍTICOS (ANALYTICAL PLANS)
// ==========================================

// exports.getAnalyticalPlans = async (req, res) => {
//   try {
//     const { subject_id, academic_year_id } = req.query;
//     let query = `
//       SELECT 
//         ap.id, 
//         ap.subject_id, 
//         s.name AS subject_name, 
//         s.code AS subject_code,
//         ap.academic_year_id, 
//         ay.year AS academic_year, 
//         ay.semester,
//         ap.created_by, 
//         u.name AS creator_name,
//         ap.created_at
//       FROM analytical_plans ap
//       INNER JOIN subjects s ON ap.subject_id = s.id
//       INNER JOIN academic_years ay ON ap.academic_year_id = ay.id
//       INNER JOIN users u ON ap.created_by = u.id
//       WHERE 1=1
//     `;
//     const params = [];

//     if (subject_id) {
//       query += ' AND ap.subject_id = ?';
//       params.push(subject_id);
//     }
//     if (academic_year_id) {
//       query += ' AND ap.academic_year_id = ?';
//       params.push(academic_year_id);
//     }

//     query += ' ORDER BY ap.id DESC';

//     const [rows] = await pool.query(query, params);
//     return res.status(200).json({ success: true, data: rows });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

exports.getAnalyticalPlans = async (req, res) => {
  try {
    const { subject_id, academic_year_id } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role_name; 

    let query = `
      SELECT DISTINCT
        ap.id, 
        ap.subject_id, 
        s.name AS subject_name, 
        s.code AS subject_code,
        ap.academic_year_id, 
        ay.year AS academic_year, 
        ay.semester,
        ap.created_by, 
        u.name AS creator_name,
        ap.created_at
      FROM analytical_plans ap
      INNER JOIN subjects s ON ap.subject_id = s.id
      INNER JOIN academic_years ay ON ap.academic_year_id = ay.id
      INNER JOIN users u ON ap.created_by = u.id
      LEFT JOIN class_subject_teachers cst ON cst.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];


    if (userRole === 'DOCENTE') {
      query += ` AND cst.teacher_id = ?`;
      params.push(userId);
    }

    if (subject_id) {
      query += ' AND ap.subject_id = ?';
      params.push(subject_id);
    }
    if (academic_year_id) {
      query += ' AND ap.academic_year_id = ?';
      params.push(academic_year_id);
    }

    query += ' ORDER BY ap.id DESC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnalyticalPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const [plans] = await pool.query(`
      SELECT 
        ap.id, 
        ap.subject_id, 
        s.name AS subject_name, 
        s.code AS subject_code,
        ap.academic_year_id, 
        ay.year AS academic_year, 
        ay.semester,
        ap.created_by, 
        u.name AS creator_name,
        ap.created_at
      FROM analytical_plans ap
      INNER JOIN subjects s ON ap.subject_id = s.id
      INNER JOIN academic_years ay ON ap.academic_year_id = ay.id
      INNER JOIN users u ON ap.created_by = u.id
      WHERE ap.id = ?
    `, [id]);

    if (plans.length === 0) {
      return res.status(404).json({ success: false, message: 'Plano analítico não encontrado.' });
    }

    const [topicUnits] = await pool.query(`
      SELECT * FROM topic_units 
      WHERE analytical_plan_id = ? 
      ORDER BY sequence_order ASC
    `, [id]);

    const [dosifications] = await pool.query(`
      SELECT 
        wd.id, 
        wd.analytical_plan_id, 
        wd.topic_unit_id, 
        tu.title AS topic_title,
        wd.week_number, 
        wd.is_evaluation_week, 
        wd.is_confirmed_by_teacher, 
        wd.custom_notes
      FROM weekly_dosifications wd
      INNER JOIN topic_units tu ON wd.topic_unit_id = tu.id
      WHERE wd.analytical_plan_id = ?
      ORDER BY wd.week_number ASC, tu.sequence_order ASC
    `, [id]);

    return res.status(200).json({
      success: true,
      data: {
        ...plans[0],
        topic_units: topicUnits,
        weekly_dosifications: dosifications
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAnalyticalPlan = async (req, res) => {
  try {
    const { subject_id, academic_year_id } = req.body;
    const created_by = req.user.id; // Extraído do token JWT pelo authMiddleware

    if (!subject_id || !academic_year_id) {
      return res.status(400).json({ success: false, message: 'IDs da disciplina e do ano lectivo são obrigatórios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO analytical_plans (subject_id, academic_year_id, created_by) VALUES (?, ?, ?)',
      [subject_id, academic_year_id, created_by]
    );

    return res.status(201).json({
      success: true,
      message: 'Plano analítico criado com sucesso.',
      data: {
        id: result.insertId,
        subject_id,
        academic_year_id,
        created_by
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAnalyticalPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id, academic_year_id } = req.body;

    const [result] = await pool.query(
      `UPDATE analytical_plans 
       SET subject_id = COALESCE(?, subject_id), 
           academic_year_id = COALESCE(?, academic_year_id) 
       WHERE id = ?`,
      [subject_id, academic_year_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Plano analítico não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Plano analítico atualizado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAnalyticalPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM analytical_plans WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Plano analítico não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Plano analítico eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. UNIDADES TEMÁTICAS / TÓPICOS (TOPIC UNITS)
// ==========================================

exports.getTopicUnitsByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM topic_units WHERE analytical_plan_id = ? ORDER BY sequence_order ASC',
      [planId]
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTopicUnit = async (req, res) => {
  try {
    const { analytical_plan_id, title, description, planned_hours, lesson_type, sequence_order } = req.body;

    const validLessonTypes = ['TEORICA', 'PRATICA', 'LABORATORIAL', 'VISITA_ESTUDO'];

    if (!analytical_plan_id || !title || planned_hours === undefined || !lesson_type || sequence_order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Plano analítico, título, horas previstas, tipo de aula e ordem são obrigatórios.'
      });
    }

    if (!validLessonTypes.includes(lesson_type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de aula inválido. Valores permitidos: ${validLessonTypes.join(', ')}`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO topic_units 
       (analytical_plan_id, title, description, planned_hours, lesson_type, sequence_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [analytical_plan_id, title, description || null, planned_hours, lesson_type, sequence_order]
    );

    return res.status(201).json({
      success: true,
      message: 'Unidade temática criada com sucesso.',
      data: {
        id: result.insertId,
        analytical_plan_id,
        title,
        description,
        planned_hours,
        lesson_type,
        sequence_order
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTopicUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, planned_hours, lesson_type, sequence_order } = req.body;

    if (lesson_type) {
      const validLessonTypes = ['TEORICA', 'PRATICA', 'LABORATORIAL', 'VISITA_ESTUDO'];
      if (!validLessonTypes.includes(lesson_type)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de aula inválido. Valores permitidos: ${validLessonTypes.join(', ')}`
        });
      }
    }

    const [result] = await pool.query(
      `UPDATE topic_units 
       SET title = COALESCE(?, title), 
           description = COALESCE(?, description), 
           planned_hours = COALESCE(?, planned_hours), 
           lesson_type = COALESCE(?, lesson_type), 
           sequence_order = COALESCE(?, sequence_order) 
       WHERE id = ?`,
      [title, description, planned_hours, lesson_type, sequence_order, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Unidade temática não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Unidade temática atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteTopicUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM topic_units WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Unidade temática não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Unidade temática eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 3. DOSIFICAÇÃO SEMANAL (WEEKLY DOSIFICATIONS)
// ==========================================

exports.getDosificationsByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        wd.id, 
        wd.analytical_plan_id, 
        wd.topic_unit_id, 
        tu.title AS topic_title, 
        tu.lesson_type,
        wd.week_number, 
        wd.is_evaluation_week, 
        wd.is_confirmed_by_teacher, 
        wd.custom_notes
      FROM weekly_dosifications wd
      INNER JOIN topic_units tu ON wd.topic_unit_id = tu.id
      WHERE wd.analytical_plan_id = ?
      ORDER BY wd.week_number ASC, tu.sequence_order ASC
    `, [planId]);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createWeeklyDosification = async (req, res) => {
  try {
    const {
      analytical_plan_id,
      topic_unit_id,
      week_number,
      is_evaluation_week,
      is_confirmed_by_teacher,
      custom_notes
    } = req.body;

    if (!analytical_plan_id || !topic_unit_id || week_number === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Plano analítico, unidade temática e número da semana são obrigatórios.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO weekly_dosifications 
       (analytical_plan_id, topic_unit_id, week_number, is_evaluation_week, is_confirmed_by_teacher, custom_notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        analytical_plan_id,
        topic_unit_id,
        week_number,
        is_evaluation_week ? 1 : 0,
        is_confirmed_by_teacher ? 1 : 0,
        custom_notes || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Dosificação semanal registada com sucesso.',
      data: {
        id: result.insertId,
        analytical_plan_id,
        topic_unit_id,
        week_number,
        is_evaluation_week: !!is_evaluation_week,
        is_confirmed_by_teacher: !!is_confirmed_by_teacher,
        custom_notes: custom_notes || null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateWeeklyDosification = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      topic_unit_id,
      week_number,
      is_evaluation_week,
      is_confirmed_by_teacher,
      custom_notes
    } = req.body;

    const [result] = await pool.query(
      `UPDATE weekly_dosifications 
       SET topic_unit_id = COALESCE(?, topic_unit_id), 
           week_number = COALESCE(?, week_number), 
           is_evaluation_week = COALESCE(?, is_evaluation_week), 
           is_confirmed_by_teacher = COALESCE(?, is_confirmed_by_teacher), 
           custom_notes = COALESCE(?, custom_notes) 
       WHERE id = ?`,
      [
        topic_unit_id,
        week_number,
        is_evaluation_week !== undefined ? (is_evaluation_week ? 1 : 0) : null,
        is_confirmed_by_teacher !== undefined ? (is_confirmed_by_teacher ? 1 : 0) : null,
        custom_notes,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Dosificação semanal não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Dosificação semanal atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.confirmDosificationByTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE weekly_dosifications SET is_confirmed_by_teacher = TRUE WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Dosificação semanal não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Dosificação confirmada pelo docente com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteWeeklyDosification = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM weekly_dosifications WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Dosificação semanal não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Dosificação semanal eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateWeeklyDosifications = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { analytical_plan_id } = req.body;

    if (!analytical_plan_id) {
      return res.status(400).json({ success: false, message: 'ID do plano analítico é obrigatório.' });
    }

    const [topics] = await connection.query(
      'SELECT id, planned_hours FROM topic_units WHERE analytical_plan_id = ? ORDER BY sequence_order ASC',
      [analytical_plan_id]
    );

    if (topics.length === 0) {
      return res.status(400).json({ success: false, message: 'Adicione unidades temáticas antes de gerar a dosificação.' });
    }

    await connection.query('DELETE FROM weekly_dosifications WHERE analytical_plan_id = ?', [analytical_plan_id]);

    let currentWeek = 1;
    for (const topic of topics) {
      await connection.query(
        `INSERT INTO weekly_dosifications (analytical_plan_id, topic_unit_id, week_number, is_evaluation_week, is_confirmed_by_teacher)
         VALUES (?, ?, ?, FALSE, FALSE)`,
        [analytical_plan_id, topic.id, currentWeek]
      );
      currentWeek++;
      if (currentWeek > 15) currentWeek = 1; 
    }

    await connection.commit();
    return res.status(200).json({ success: true, message: 'Dosificação semanal gerada automaticamente com sucesso.' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};