const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Aulas e Validações
 *   description: Registo do Mapa Semanal de Aulas e Validação pelos Representantes de Turma
 */

// ==========================================
// LESSONS
// ==========================================

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Listar aulas com filtros opcionais
 *     tags: [Aulas e Validações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_subject_teacher_id
 *         schema:
 *           type: integer
 *         description: Filtrar por vínculo docente-disciplina-turma
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REGISTADA, CONFIRMADA, CONFIRMADA_COM_RESSALVA, EM_DISPUTA, RESOLVIDA, PENDENTE_PROLONGADA]
 *         description: Filtrar por estado de validação
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (AAAA-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (AAAA-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de aulas encontradas
 *   post:
 *     summary: Sumariar / Registar uma nova aula
 *     tags: [Aulas e Validações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - class_subject_teacher_id
 *               - lesson_date
 *             properties:
 *               class_subject_teacher_id:
 *                 type: integer
 *                 example: 1
 *               topic_unit_id:
 *                 type: integer
 *                 example: 2
 *               lesson_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-15"
 *               content_taught:
 *                 type: string
 *                 example: "Introdução ao modelo OSI e camada física"
 *               is_cancelled:
 *                 type: boolean
 *                 example: false
 *               cancellation_reason:
 *                 type: string
 *                 example: null
 *     responses:
 *       201:
 *         description: Aula registada com sucesso
 */
router.route('/')
  .get(lessonController.getLessons)
  .post(lessonController.createLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Obter detalhes da aula e respetivo histórico de validação
 *     tags: [Aulas e Validações]
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
 *         description: Detalhes da aula
 *       404:
 *         description: Aula não encontrada
 *   put:
 *     summary: Atualizar dados de uma aula sumariada
 *     tags: [Aulas e Validações]
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
 *               topic_unit_id:
 *                 type: integer
 *               lesson_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [REGISTADA, CONFIRMADA, CONFIRMADA_COM_RESSALVA, EM_DISPUTA, RESOLVIDA, PENDENTE_PROLONGADA]
 *               is_cancelled:
 *                 type: boolean
 *               cancellation_reason:
 *                 type: string
 *               content_taught:
 *                 type: string
 *     responses:
 *       200:
 *         description: Aula atualizada
 *   delete:
 *     summary: Eliminar registo de aula
 *     tags: [Aulas e Validações]
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
 *         description: Aula eliminada
 */
router.route('/:id')
  .get(lessonController.getLessonById)
  .put(lessonController.updateLesson)
  .delete(lessonController.deleteLesson);

// ==========================================
// LESSON CONFIRMATIONS
// ==========================================

/**
 * @swagger
 * /api/lessons/confirmations:
 *   post:
 *     summary: Validar/Confirmar uma aula (Chefe ou Subchefe de Turma)
 *     tags: [Aulas e Validações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lesson_id
 *               - status_given
 *             properties:
 *               lesson_id:
 *                 type: integer
 *                 example: 10
 *               status_given:
 *                 type: string
 *                 enum: [CONFIRMADA, RESSALVA, EM_DISPUTA]
 *                 example: "CONFIRMADA"
 *               remarks:
 *                 type: string
 *                 example: "Aula dada dentro do horário previsto."
 *     responses:
 *       201:
 *         description: Confirmação registada e estado da aula atualizado
 */
router.route('/confirmations')
  .post(lessonController.confirmLesson);

/**
 * @swagger
 * /api/lessons/confirmations/{lesson_id}:
 *   get:
 *     summary: Listar confirmações/validações de uma aula específica
 *     tags: [Aulas e Validações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lesson_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico de confirmações da aula
 */
router.route('/confirmations/:lesson_id')
  .get(lessonController.getConfirmationsByLesson);

module.exports = router;