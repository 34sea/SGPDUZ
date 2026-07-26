const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas as rotas do módulo de planeamento com JWT
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   - name: Analytical Plans
 *     description: Gestão de Planos Analíticos por Disciplina e Ano Lectivo
 *   - name: Topic Units
 *     description: Gestão de Unidades Temáticas / Tópicos de Aulas
 *   - name: Weekly Dosifications
 *     description: Gestão de Dosificação e Distribuição Semanal das Aulas
 */

/**
 * @swagger
 * /api/analytical-plans:
 *   get:
 *     summary: Listar todos os planos analíticos
 *     tags: [Analytical Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: integer
 *         description: Filtrar por disciplina
 *       - in: query
 *         name: academic_year_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ano lectivo
 *     responses:
 *       200:
 *         description: Lista de planos analíticos com detalhes de disciplina, ano e criador
 *   post:
 *     summary: Criar novo plano analítico
 *     tags: [Analytical Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject_id
 *               - academic_year_id
 *             properties:
 *               subject_id:
 *                 type: integer
 *                 example: 1
 *               academic_year_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Plano analítico criado com sucesso
 */
router.route('/analytical-plans')
  .get(planningController.getAnalyticalPlans)
  .post(planningController.createAnalyticalPlan);

/**
 * @swagger
 * /api/analytical-plans/{id}:
 *   get:
 *     summary: Obter detalhes completos do plano analítico (com tópicos e dosificações)
 *     tags: [Analytical Plans]
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
 *         description: Detalhes completos do plano analítico
 *   put:
 *     summary: Atualizar plano analítico
 *     tags: [Analytical Plans]
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
 *               subject_id:
 *                 type: integer
 *               academic_year_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Plano analítico atualizado
 *   delete:
 *     summary: Eliminar plano analítico
 *     tags: [Analytical Plans]
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
 *         description: Plano analítico eliminado
 */
router.route('/analytical-plans/:id')
  .get(planningController.getAnalyticalPlanById)
  .put(planningController.updateAnalyticalPlan)
  .delete(planningController.deleteAnalyticalPlan);

/**
 * @swagger
 * /api/analytical-plans/{planId}/topic-units:
 *   get:
 *     summary: Listar unidades temáticas de um plano analítico
 *     tags: [Topic Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de tópicos ordenada pela ordem de sequência
 */
router.get('/analytical-plans/:planId/topic-units', planningController.getTopicUnitsByPlan);

/**
 * @swagger
 * /api/topic-units:
 *   post:
 *     summary: Criar nova unidade temática
 *     tags: [Topic Units]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - analytical_plan_id
 *               - title
 *               - planned_hours
 *               - lesson_type
 *               - sequence_order
 *             properties:
 *               analytical_plan_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "Introdução à Modelação de Dados"
 *               description:
 *                 type: string
 *                 example: "Conceitos de MER, DER e normalização"
 *               planned_hours:
 *                 type: integer
 *                 example: 4
 *               lesson_type:
 *                 type: string
 *                 enum: ["TEORICA", "PRATICA", "LABORATORIAL", "VISITA_ESTUDO"]
 *                 example: "TEORICA"
 *               sequence_order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Unidade temática criada
 */
router.post('/topic-units', planningController.createTopicUnit);

/**
 * @swagger
 * /api/topic-units/{id}:
 *   put:
 *     summary: Atualizar unidade temática
 *     tags: [Topic Units]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               planned_hours:
 *                 type: integer
 *               lesson_type:
 *                 type: string
 *                 enum: ["TEORICA", "PRATICA", "LABORATORIAL", "VISITA_ESTUDO"]
 *               sequence_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Unidade temática atualizada
 *   delete:
 *     summary: Eliminar unidade temática
 *     tags: [Topic Units]
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
 *         description: Unidade temática eliminada
 */
router.route('/topic-units/:id')
  .put(planningController.updateTopicUnit)
  .delete(planningController.deleteTopicUnit);

/**
 * @swagger
 * /api/analytical-plans/{planId}/dosifications:
 *   get:
 *     summary: Listar dosificações semanais de um plano analítico
 *     tags: [Weekly Dosifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de semanas e tópicos associados
 */
router.get('/analytical-plans/:planId/dosifications', planningController.getDosificationsByPlan);

/**
 * @swagger
 * /api/weekly-dosifications:
 *   post:
 *     summary: Criar entrada de dosificação semanal
 *     tags: [Weekly Dosifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - analytical_plan_id
 *               - topic_unit_id
 *               - week_number
 *             properties:
 *               analytical_plan_id:
 *                 type: integer
 *                 example: 1
 *               topic_unit_id:
 *                 type: integer
 *                 example: 2
 *               week_number:
 *                 type: integer
 *                 example: 3
 *               is_evaluation_week:
 *                 type: boolean
 *                 example: false
 *               is_confirmed_by_teacher:
 *                 type: boolean
 *                 example: false
 *               custom_notes:
 *                 type: string
 *                 example: "Aula prática realizada em laboratório de informática."
 *     responses:
 *       201:
 *         description: Dosificação criada
 */
router.post('/weekly-dosifications', planningController.createWeeklyDosification);

/**
 * @swagger
 * /api/weekly-dosifications/{id}:
 *   put:
 *     summary: Atualizar dosificação semanal
 *     tags: [Weekly Dosifications]
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
 *               week_number:
 *                 type: integer
 *               is_evaluation_week:
 *                 type: boolean
 *               is_confirmed_by_teacher:
 *                 type: boolean
 *               custom_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dosificação atualizada
 *   delete:
 *     summary: Eliminar dosificação semanal
 *     tags: [Weekly Dosifications]
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
 *         description: Dosificação eliminada
 */
router.route('/weekly-dosifications/:id')
  .put(planningController.updateWeeklyDosification)
  .delete(planningController.deleteWeeklyDosification);

/**
 * @swagger
 * /api/weekly-dosifications/{id}/confirm:
 *   patch:
 *     summary: Confirmar o cumprimento/planeamento semanal pelo docente
 *     tags: [Weekly Dosifications]
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
 *         description: Dosificação confirmada pelo docente
 */
router.patch('/weekly-dosifications/:id/confirm', planningController.confirmDosificationByTeacher);

module.exports = router;