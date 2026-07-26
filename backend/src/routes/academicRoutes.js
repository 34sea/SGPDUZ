const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas as rotas de estrutura académica com Token JWT
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   - name: Departments
 *     description: Gestão de Departamentos da Instituição
 *   - name: Courses
 *     description: Gestão de Cursos Académicos
 *   - name: Academic Years
 *     description: Gestão de Anos Lectivos e Semestres
 *   - name: Subjects
 *     description: Gestão de Disciplinas
 *   - name: Classes
 *     description: Gestão de Turmas
 *   - name: Teacher Assignment
 *     description: Atribuição de Docentes a Disciplinas e Turmas
 *   - name: Holidays
 *     description: Feriados e Exceções de Calendário
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Listar todos os departamentos
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de departamentos com o responsável (head_user)
 *   post:
 *     summary: Criar novo departamento
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Departamento de Engenharia e Tecnologia"
 *               head_user_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Departamento criado
 */
router.route('/departments')
  .get(academicController.getDepartments)
  .post(academicController.createDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Obter detalhes do departamento
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do departamento
 *   put:
 *     summary: Atualizar departamento
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               head_user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Departamento atualizado
 *   delete:
 *     summary: Eliminar departamento
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Departamento eliminado
 */
router.route('/departments/:id')
  .get(academicController.getDepartmentById)
  .put(academicController.updateDepartment)
  .delete(academicController.deleteDepartment);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Listar todos os cursos
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos com o departamento e diretor de curso
 *   post:
 *     summary: Criar novo curso
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - department_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Engenharia Informática"
 *               code:
 *                 type: string
 *                 example: "LEI"
 *               department_id:
 *                 type: integer
 *                 example: 1
 *               head_user_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Curso criado
 */
router.route('/courses')
  .get(academicController.getCourses)
  .post(academicController.createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Obter detalhes do curso
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do curso
 *   put:
 *     summary: Atualizar curso
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               department_id:
 *                 type: integer
 *               head_user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Curso atualizado
 *   delete:
 *     summary: Eliminar curso
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Curso eliminado
 */
router.route('/courses/:id')
  .get(academicController.getCourseById)
  .put(academicController.updateCourse)
  .delete(academicController.deleteCourse);

/**
 * @swagger
 * /api/academic-years:
 *   get:
 *     summary: Listar anos lectivos
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de anos lectivos e semestres
 *   post:
 *     summary: Criar ano lectivo/semestre
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - semester
 *               - start_date
 *               - end_date
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 2026
 *               semester:
 *                 type: string
 *                 enum: ["1", "2"]
 *                 example: "1"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-15"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-30"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Ano lectivo criado
 */
router.route('/academic-years')
  .get(academicController.getAcademicYears)
  .post(academicController.createAcademicYear);

/**
 * @swagger
 * /api/academic-years/{id}:
 *   get:
 *     summary: Obter ano lectivo por ID
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do ano lectivo
 *   put:
 *     summary: Atualizar ano lectivo
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ano lectivo atualizado
 *   delete:
 *     summary: Eliminar ano lectivo
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ano lectivo eliminado
 */
router.route('/academic-years/:id')
  .get(academicController.getAcademicYearById)
  .put(academicController.updateAcademicYear)
  .delete(academicController.deleteAcademicYear);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Listar todas as disciplinas
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de disciplinas
 *   post:
 *     summary: Criar nova disciplina
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - course_id
 *             properties:
 *               code:
 *                 type: string
 *                 example: "INF301"
 *               name:
 *                 type: string
 *                 example: "Engenharia de Software I"
 *               course_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Disciplina criada
 */
router.route('/subjects')
  .get(academicController.getSubjects)
  .post(academicController.createSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Obter disciplina por ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes da disciplina
 *   put:
 *     summary: Atualizar disciplina
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disciplina atualizada
 *   delete:
 *     summary: Eliminar disciplina
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disciplina eliminada
 */
router.route('/subjects/:id')
  .get(academicController.getSubjectById)
  .put(academicController.updateSubject)
  .delete(academicController.deleteSubject);

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Listar todas as turmas
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de turmas com chefes de turma
 *   post:
 *     summary: Criar nova turma
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - course_id
 *               - academic_year_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Informática 3º Ano 2026"
 *               course_id:
 *                 type: integer
 *                 example: 1
 *               academic_year_id:
 *                 type: integer
 *                 example: 1
 *               class_chief_id:
 *                 type: integer
 *                 example: 10
 *               sub_chief_id:
 *                 type: integer
 *                 example: 11
 *     responses:
 *       201:
 *         description: Turma criada
 */
router.route('/classes')
  .get(academicController.getClasses)
  .post(academicController.createClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Obter detalhes da turma com disciplinas e docentes atribuídos
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes completos da turma
 *   put:
 *     summary: Atualizar turma
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turma atualizada
 *   delete:
 *     summary: Eliminar turma
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turma eliminada
 */
router.route('/classes/:id')
  .get(academicController.getClassById)
  .put(academicController.updateClass)
  .delete(academicController.deleteClass);

/**
 * @swagger
 * /api/class-subject-teachers:
 *   get:
 *     summary: Listar todas as atribuições de docentes a disciplinas/turmas
 *     tags: [Teacher Assignment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de docentes por turma e disciplina
 *   post:
 *     summary: Atribuir um docente a uma disciplina de uma turma
 *     tags: [Teacher Assignment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - class_id
 *               - subject_id
 *               - teacher_id
 *             properties:
 *               class_id:
 *                 type: integer
 *                 example: 1
 *               subject_id:
 *                 type: integer
 *                 example: 2
 *               teacher_id:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Docente atribuído com sucesso
 */
router.route('/class-subject-teachers')
  .get(academicController.getClassSubjectTeachers)
  .post(academicController.assignTeacherToClassSubject);

/**
 * @swagger
 * /api/class-subject-teachers/{id}:
 *   delete:
 *     summary: Remover atribuição de docente a uma disciplina/turma por ID
 *     tags: [Teacher Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atribuição removida com sucesso
 */
router.route('/class-subject-teachers/:id')
  .delete(academicController.removeTeacherFromClassSubject);

/**
 * @swagger
 * /api/holidays:
 *   get:
 *     summary: Listar feriados e exceções de calendário
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de feriados
 *   post:
 *     summary: Criar novo feriado
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - description
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-25"
 *               description:
 *                 type: string
 *                 example: "Dia da Independência Nacional"
 *     responses:
 *       201:
 *         description: Feriado registado
 */
router.route('/holidays')
  .get(academicController.getHolidays)
  .post(academicController.createHoliday);

/**
 * @swagger
 * /api/holidays/{id}:
 *   put:
 *     summary: Atualizar feriado
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feriado atualizado
 *   delete:
 *     summary: Eliminar feriado
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feriado eliminado
 */
router.route('/holidays/:id')
  .put(academicController.updateHoliday)
  .delete(academicController.deleteHoliday);

module.exports = router;