const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getDashboardAndReportsData = async (req, res) => {
  try {
    const { period = '2026-1', teacherId, comparisonPeriod } = req.query;


    const [summaryRows] = await pool.query(`
      SELECT 
        SUM(planned_classes) as total_planned,
        SUM(realized_classes) as total_realized,
        SUM(confirmed_classes) as total_confirmed,
        SUM(evaluations_on_time) as total_eval_on_time,
        SUM(evaluations_total) as total_eval_total,
        SUM(pautas_delivered) as total_pautas_delivered,
        SUM(pautas_total) as total_pautas_total,
        SUM(activities_completed) as total_activities_completed,
        SUM(activities_total) as total_activities_total
      FROM academic_indicators_summary
      WHERE period_code = ?
    `, [period]);

    // 2. Indicadores por Docente
    let teacherQuery = `
      u.id, u.name, u.email, 
      COALESCE(SUM(ai.planned_classes), 0) as planned,
      COALESCE(SUM(ai.realized_classes), 0) as realized,
      COALESCE(SUM(ai.confirmed_classes), 0) as confirmed,
      COALESCE(SUM(ai.evaluations_on_time), 0) as evaluations_on_time,
      COALESCE(SUM(ai.evaluations_total), 0) as evaluations,
      COALESCE(SUM(ai.activities_completed), 0) as activities_completed,
      COALESCE(SUM(ai.activities_total), 0) as activities,
      COALESCE(AVG(ai.compliance_rate), 0) as compliance
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    LEFT JOIN academic_indicators_summary ai ON ai.teacher_id = u.id AND ai.period_code = ?
    WHERE r.name = 'DOCENTE'
    `;
    
    let queryParams = [period];
    if (teacherId) {
      teacherQuery += ` AND u.id = ?`;
      queryParams.push(teacherId);
    }
    teacherQuery += ` GROUP BY u.id, u.name, u.email`;

    const [teachersData] = await pool.query(`SELECT ${teacherQuery}`, queryParams);

    // 3. Indicadores por Unidade Curricular
    const [courseUnitsData] = await pool.query(`
      SELECT cu.id, cu.name, cu.code, u.name as teacher,
             cu.planned_classes as planned, cu.realized_classes as realized,
             cu.evaluations_count as evaluations, cu.grades_count as grades,
             cu.activities_count as activities, cu.compliance_rate as compliance
      FROM course_units cu
      INNER JOIN users u ON cu.teacher_id = u.id
      WHERE cu.period_code = ?
    `, [period]);

    // 4. Dados para Comparação de Semestres (se aplicável)
    let comparisonData = null;
    if (comparisonPeriod) {
      const [compRows] = await pool.query(`
        SELECT period_code, 
               AVG(compliance_rate) as avg_compliance,
               AVG(realized_classes_rate) as avg_realized,
               AVG(evaluations_on_time_rate) as avg_eval_on_time,
               AVG(pautas_rate) as avg_pautas,
               AVG(activities_rate) as avg_activities
        FROM academic_indicators_summary
        WHERE period_code IN (?, ?)
        GROUP BY period_code
      `, [period, comparisonPeriod]);
      comparisonData = compRows;
    }

    return res.status(200).json({
      success: true,
      data: {
        period,
        summary: summaryRows[0] || {},
        teachers: teachersData,
        courseUnits: courseUnitsData,
        comparison: comparisonData
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};