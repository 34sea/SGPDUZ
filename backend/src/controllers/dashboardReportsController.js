const pool = require('../config/db');

exports.getDashboardAndReportsData = async (req, res) => {
  try {
    const { period = '2026-1' } = req.query;

    // 1. Contagens Globais de TODAS as Tabelas do Sistema
    const [userCount] = await pool.query(`SELECT COUNT(*) as total FROM users`);
    const [deptCount] = await pool.query(`SELECT COUNT(*) as total FROM departments`);
    const [courseCount] = await pool.query(`SELECT COUNT(*) as total FROM courses`);
    const [classCount] = await pool.query(`SELECT COUNT(*) as total FROM classes`);
    const [subjectCount] = await pool.query(`SELECT COUNT(*) as total FROM subjects`);
    const [lessonCount] = await pool.query(`SELECT COUNT(*) as total FROM lessons`);
    const [assessmentCount] = await pool.query(`SELECT COUNT(*) as total FROM assessments`);
    const [pautaCount] = await pool.query(`SELECT COUNT(*) as total FROM final_grade_sheets`);
    const [taskCount] = await pool.query(`SELECT COUNT(*) as total FROM adhoc_tasks`);

    // 2. Estatísticas Detalhadas e Cumprimento
    const [lessonStats] = await pool.query(`
      SELECT 
        COUNT(l.id) as total_realized,
        SUM(CASE WHEN l.status IN ('CONFIRMADA', 'CONFIRMADA_COM_RESSALVA') THEN 1 ELSE 0 END) as total_confirmed,
        SUM(CASE WHEN l.status = 'EM_DISPUTA' THEN 1 ELSE 0 END) as total_disputed,
        SUM(CASE WHEN l.is_cancelled = 1 THEN 1 ELSE 0 END) as total_cancelled
      FROM lessons l
    `);

    const [assessmentStats] = await pool.query(`
      SELECT 
        COUNT(a.id) as total_eval_total,
        SUM(CASE WHEN a.status = 'DENTRO_DO_PRAZO' THEN 1 ELSE 0 END) as total_eval_on_time,
        SUM(CASE WHEN a.status = 'FORA_DO_PRAZO' THEN 1 ELSE 0 END) as total_eval_late
      FROM assessments a
    `);

    const [taskStats] = await pool.query(`
      SELECT 
        COUNT(id) as total_activities_total,
        SUM(CASE WHEN status IN ('ENTREGUE', 'VERIFICADA') THEN 1 ELSE 0 END) as total_activities_completed,
        SUM(CASE WHEN status = 'ATRASADA' THEN 1 ELSE 0 END) as total_activities_delayed
      FROM adhoc_tasks
    `);

    const summary = {
      total_users: userCount[0]?.total || 0,
      total_departments: deptCount[0]?.total || 0,
      total_courses: courseCount[0]?.total || 0,
      total_classes: classCount[0]?.total || 0,
      total_subjects: subjectCount[0]?.total || 0,
      total_lessons: lessonCount[0]?.total || 0,
      total_assessments: assessmentCount[0]?.total || 0,
      total_pautas: pautaCount[0]?.total || 0,
      total_tasks: taskCount[0]?.total || 0,
      
      total_realized: lessonStats[0]?.total_realized || 0,
      total_confirmed: lessonStats[0]?.total_confirmed || 0,
      total_disputed: lessonStats[0]?.total_disputed || 0,
      total_cancelled: lessonStats[0]?.total_cancelled || 0,
      
      total_eval_on_time: assessmentStats[0]?.total_eval_on_time || 0,
      total_eval_late: assessmentStats[0]?.total_eval_late || 0,
      
      total_activities_completed: taskStats[0]?.total_activities_completed || 0,
      total_activities_delayed: taskStats[0]?.total_activities_delayed || 0
    };

    // 3. Desempenho Detalhado por Docente
    const [teachersData] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, 
        COUNT(DISTINCT cst.id) as assigned_subjects,
        COUNT(DISTINCT l.id) as realized_lessons,
        COALESCE(SUM(CASE WHEN l.status = 'CONFIRMADA' THEN 1 ELSE 0 END), 0) as confirmed_lessons,
        ROUND(COALESCE((SUM(CASE WHEN l.status = 'CONFIRMADA' THEN 1 ELSE 0 END) / NULLIF(COUNT(l.id), 0)) * 100, 0), 1) as performance_rate
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN class_subject_teachers cst ON cst.teacher_id = u.id
      LEFT JOIN lessons l ON l.class_subject_teacher_id = cst.id
      WHERE r.name = 'DOCENTE'
      GROUP BY u.id, u.name, u.email
      ORDER BY performance_rate DESC
    `);

    // 4. Unidades Curriculares com Departamentos e Cursos
    const [courseUnitsData] = await pool.query(`
      SELECT s.id, s.name, s.code, u.name as teacher, c.name as course_name, d.name as department_name,
             COUNT(l.id) as realized_lessons
      FROM subjects s
      INNER JOIN courses c ON s.course_id = c.id
      INNER JOIN departments d ON c.department_id = d.id
      LEFT JOIN class_subject_teachers cst ON cst.subject_id = s.id
      LEFT JOIN users u ON cst.teacher_id = u.id
      LEFT JOIN lessons l ON l.class_subject_teacher_id = cst.id
      GROUP BY s.id, s.name, s.code, u.name, c.name, d.name
    `);

    // 5. Departamentos e Cursos para Visão Geral
    const [departmentsData] = await pool.query(`
      SELECT d.id, d.name, COUNT(c.id) as courses_count
      FROM departments d
      LEFT JOIN courses c ON c.department_id = d.id
      GROUP BY d.id, d.name
    `);

    return res.status(200).json({
      success: true,
      data: {
        period,
        summary,
        teachers: teachersData,
        courseUnits: courseUnitsData,
        departments: departmentsData
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};