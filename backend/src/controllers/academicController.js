const pool = require('../config/db');

// ==========================================
// 1. DEPARTAMENTOS
// ==========================================

exports.getDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        d.id, 
        d.name, 
        d.head_user_id, 
        u.name AS head_user_name,
        u.email AS head_user_email
      FROM departments d
      LEFT JOIN users u ON d.head_user_id = u.id
      ORDER BY d.name ASC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        d.id, 
        d.name, 
        d.head_user_id, 
        u.name AS head_user_name
      FROM departments d
      LEFT JOIN users u ON d.head_user_id = u.id
      WHERE d.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Departamento não encontrado.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, head_user_id } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome do departamento é obrigatório.' });
    }

    const [result] = await pool.query(
      'INSERT INTO departments (name, head_user_id) VALUES (?, ?)',
      [name, head_user_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Departamento criado com sucesso.',
      data: { id: result.insertId, name, head_user_id: head_user_id || null }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Já existe um departamento com este nome.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, head_user_id } = req.body;

    const [result] = await pool.query(
      'UPDATE departments SET name = COALESCE(?, name), head_user_id = ? WHERE id = ?',
      [name, head_user_id !== undefined ? head_user_id : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Departamento não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Departamento atualizado com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Já existe um departamento com este nome.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Departamento não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Departamento eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. CURSOS
// ==========================================

exports.getCourses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.code, 
        c.department_id, 
        d.name AS department_name, 
        c.head_user_id, 
        u.name AS head_user_name
      FROM courses c
      INNER JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.head_user_id = u.id
      ORDER BY c.name ASC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.code, 
        c.department_id, 
        d.name AS department_name, 
        c.head_user_id, 
        u.name AS head_user_name
      FROM courses c
      INNER JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.head_user_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name, code, department_id, head_user_id } = req.body;

    if (!name || !code || !department_id) {
      return res.status(400).json({ success: false, message: 'Nome, código e ID do departamento são obrigatórios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO courses (name, code, department_id, head_user_id) VALUES (?, ?, ?, ?)',
      [name, code.toUpperCase(), department_id, head_user_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso.',
      data: { id: result.insertId, name, code: code.toUpperCase(), department_id, head_user_id: head_user_id || null }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Já existe um curso com este código.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, department_id, head_user_id } = req.body;

    const [result] = await pool.query(
      `UPDATE courses 
       SET name = COALESCE(?, name), 
           code = COALESCE(?, code), 
           department_id = COALESCE(?, department_id), 
           head_user_id = ? 
       WHERE id = ?`,
      [name, code ? code.toUpperCase() : null, department_id, head_user_id !== undefined ? head_user_id : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Curso atualizado com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Já existe um curso com este código.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Curso eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 3. ANOS LECTIVOS
// ==========================================

exports.getAcademicYears = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM academic_years ORDER BY year DESC, semester ASC');
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAcademicYearById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM academic_years WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ano lectivo não encontrado.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAcademicYear = async (req, res) => {
  try {
    const { year, semester, start_date, end_date, is_active } = req.body;

    if (!year || !semester || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Ano, semestre, data de início e término são obrigatórios.' });
    }

    if (is_active) {
      await pool.query('UPDATE academic_years SET is_active = FALSE');
    }

    const [result] = await pool.query(
      'INSERT INTO academic_years (year, semester, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)',
      [year, semester, start_date, end_date, is_active ? 1 : 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Ano lectivo criado com sucesso.',
      data: { id: result.insertId, year, semester, start_date, end_date, is_active: !!is_active }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Este ano e semestre já foram registados.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, semester, start_date, end_date, is_active } = req.body;

    if (is_active) {
      await pool.query('UPDATE academic_years SET is_active = FALSE');
    }

    const [result] = await pool.query(
      `UPDATE academic_years 
       SET year = COALESCE(?, year), 
           semester = COALESCE(?, semester), 
           start_date = COALESCE(?, start_date), 
           end_date = COALESCE(?, end_date), 
           is_active = COALESCE(?, is_active) 
       WHERE id = ?`,
      [year, semester, start_date, end_date, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ano lectivo não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Ano lectivo atualizado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM academic_years WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ano lectivo não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Ano lectivo eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 4. DISCIPLINAS (SUBJECTS)
// ==========================================

exports.getSubjects = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id, 
        s.code, 
        s.name, 
        s.course_id, 
        c.name AS course_name,
        c.code AS course_code
      FROM subjects s
      INNER JOIN courses c ON s.course_id = c.id
      ORDER BY s.name ASC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        s.id, 
        s.code, 
        s.name, 
        s.course_id, 
        c.name AS course_name
      FROM subjects s
      INNER JOIN courses c ON s.course_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Disciplina não encontrada.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { code, name, course_id } = req.body;

    if (!code || !name || !course_id) {
      return res.status(400).json({ success: false, message: 'Código, nome e ID do curso são obrigatórios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO subjects (code, name, course_id) VALUES (?, ?, ?)',
      [code.toUpperCase(), name, course_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Disciplina criada com sucesso.',
      data: { id: result.insertId, code: code.toUpperCase(), name, course_id }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Já existe uma disciplina com este código.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, course_id } = req.body;

    const [result] = await pool.query(
      `UPDATE subjects 
       SET code = COALESCE(?, code), 
           name = COALESCE(?, name), 
           course_id = COALESCE(?, course_id) 
       WHERE id = ?`,
      [code ? code.toUpperCase() : null, name, course_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Disciplina não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Disciplina atualizada com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Já existe uma disciplina com este código.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM subjects WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Disciplina não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Disciplina eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 5. TURMAS (CLASSES)
// ==========================================

exports.getClasses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        cl.id, 
        cl.name, 
        cl.course_id, 
        c.name AS course_name, 
        cl.academic_year_id, 
        ay.year AS academic_year, 
        ay.semester, 
        cl.class_chief_id, 
        u1.name AS class_chief_name, 
        cl.sub_chief_id, 
        u2.name AS sub_chief_name
      FROM classes cl
      INNER JOIN courses c ON cl.course_id = c.id
      INNER JOIN academic_years ay ON cl.academic_year_id = ay.id
      LEFT JOIN users u1 ON cl.class_chief_id = u1.id
      LEFT JOIN users u2 ON cl.sub_chief_id = u2.id
      ORDER BY cl.id DESC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        cl.id, 
        cl.name, 
        cl.course_id, 
        c.name AS course_name, 
        cl.academic_year_id, 
        ay.year AS academic_year, 
        ay.semester, 
        cl.class_chief_id, 
        u1.name AS class_chief_name, 
        cl.sub_chief_id, 
        u2.name AS sub_chief_name
      FROM classes cl
      INNER JOIN courses c ON cl.course_id = c.id
      INNER JOIN academic_years ay ON cl.academic_year_id = ay.id
      LEFT JOIN users u1 ON cl.class_chief_id = u1.id
      LEFT JOIN users u2 ON cl.sub_chief_id = u2.id
      WHERE cl.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada.' });
    }

    // Buscar os docentes atribuídos às disciplinas desta turma
    const [teachers] = await pool.query(`
      SELECT 
        cst.id AS assignment_id, 
        cst.subject_id, 
        s.name AS subject_name, 
        s.code AS subject_code, 
        cst.teacher_id, 
        u.name AS teacher_name, 
        u.email AS teacher_email
      FROM class_subject_teachers cst
      INNER JOIN subjects s ON cst.subject_id = s.id
      INNER JOIN users u ON cst.teacher_id = u.id
      WHERE cst.class_id = ?
    `, [id]);

    return res.status(200).json({
      success: true,
      data: {
        ...rows[0],
        subject_teachers: teachers
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { name, course_id, academic_year_id, class_chief_id, sub_chief_id } = req.body;

    if (!name || !course_id || !academic_year_id) {
      return res.status(400).json({ success: false, message: 'Nome, ID do curso e ID do ano lectivo são obrigatórios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO classes (name, course_id, academic_year_id, class_chief_id, sub_chief_id) VALUES (?, ?, ?, ?, ?)',
      [name, course_id, academic_year_id, class_chief_id || null, sub_chief_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Turma criada com sucesso.',
      data: { id: result.insertId, name, course_id, academic_year_id, class_chief_id, sub_chief_id }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, course_id, academic_year_id, class_chief_id, sub_chief_id } = req.body;

    const [result] = await pool.query(
      `UPDATE classes 
       SET name = COALESCE(?, name), 
           course_id = COALESCE(?, course_id), 
           academic_year_id = COALESCE(?, academic_year_id), 
           class_chief_id = ?, 
           sub_chief_id = ? 
       WHERE id = ?`,
      [
        name, 
        course_id, 
        academic_year_id, 
        class_chief_id !== undefined ? class_chief_id : null, 
        sub_chief_id !== undefined ? sub_chief_id : null, 
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Turma atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Turma eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 6. ATRIBUIÇÃO DE DOCENTES À TURMA / DISCIPLINA
// ==========================================

exports.getClassSubjectTeachers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        cst.id, 
        cst.class_id, 
        cl.name AS class_name, 
        cst.subject_id, 
        s.name AS subject_name, 
        s.code AS subject_code, 
        cst.teacher_id, 
        u.name AS teacher_name,
        u.email AS teacher_email
      FROM class_subject_teachers cst
      INNER JOIN classes cl ON cst.class_id = cl.id
      INNER JOIN subjects s ON cst.subject_id = s.id
      INNER JOIN users u ON cst.teacher_id = u.id
      ORDER BY cl.name ASC, s.name ASC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.assignTeacherToClassSubject = async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id } = req.body;

    if (!class_id || !subject_id || !teacher_id) {
      return res.status(400).json({ success: false, message: 'IDs da turma, disciplina e docente são obrigatórios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO class_subject_teachers (class_id, subject_id, teacher_id) VALUES (?, ?, ?)',
      [class_id, subject_id, teacher_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Docente atribuído com sucesso à disciplina na turma.',
      data: { id: result.insertId, class_id, subject_id, teacher_id }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Este docente já está atribuído a esta disciplina e turma.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeTeacherFromClassSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM class_subject_teachers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Atribuição não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Atribuição removida com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 7. FERIADOS E EXCEÇÕES DE CALENDÁRIO
// ==========================================

exports.getHolidays = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM holidays ORDER BY date ASC');
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const { date, description } = req.body;

    if (!date || !description) {
      return res.status(400).json({ success: false, message: 'Data e descrição são obrigatórias.' });
    }

    const [result] = await pool.query(
      'INSERT INTO holidays (date, description) VALUES (?, ?)',
      [date, description]
    );

    return res.status(201).json({
      success: true,
      message: 'Feriado/exceção registado com sucesso.',
      data: { id: result.insertId, date, description }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Já existe um feriado registado nesta data.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description } = req.body;

    const [result] = await pool.query(
      'UPDATE holidays SET date = COALESCE(?, date), description = COALESCE(?, description) WHERE id = ?',
      [date, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Feriado não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Feriado atualizado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM holidays WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Feriado não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Feriado eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};