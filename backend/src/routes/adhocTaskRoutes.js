const express = require('express');
const router = express.Router();
const adhocTaskController = require('../controllers/adhocTaskController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer'); 

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Actividades Ad-hoc
 *   description: Atribuição, acompanhamento e entrega de tarefas ad-hoc entre Chefes e Docentes
 */

// ==========================================
// TAREFAS AD-HOC
// ==========================================

/**
 * @swagger
 * /api/adhoc-tasks:
 *   get:
 *     summary: Listar tarefas ad-hoc com filtros opcionais
 *     tags: [Actividades Ad-hoc]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assigned_by
 *         schema:
 *           type: integer
 *         description: Filtrar pelo ID de quem atribuiu a tarefa
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: integer
 *         description: Filtrar pelo ID do docente responsável
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDENTE, ENTREGUE, VERIFICADA, ATRASADA]
 *         description: Filtrar pelo estado da tarefa
 *     responses:
 *       200:
 *         description: Lista de tarefas ad-hoc obtida com sucesso
 *   post:
 *     summary: Criar/Atribuir nova tarefa ad-hoc
 *     tags: [Actividades Ad-hoc]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - assigned_to
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Submissão do Relatório de Autoavaliação"
 *               description:
 *                 type: string
 *                 example: "Por favor enviar o relatório devidamente assinado."
 *               assigned_to:
 *                 type: integer
 *                 example: 5
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-05-15 23:59:00"
 *     responses:
 *       201:
 *         description: Tarefa ad-hoc criada com sucesso
 */
router.route('/')
  .get(adhocTaskController.getTasks)
  .post(adhocTaskController.createTask);

/**
 * @swagger
 * /api/adhoc-tasks/{id}:
 *   get:
 *     summary: Obter detalhes de uma tarefa ad-hoc e histórico de submissões
 *     tags: [Actividades Ad-hoc]
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
 *         description: Detalhes da tarefa e suas submissões
 *       404:
 *         description: Tarefa não encontrada
 *   put:
 *     summary: Atualizar dados de uma tarefa ad-hoc
 *     tags: [Actividades Ad-hoc]
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
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [PENDENTE, ENTREGUE, VERIFICADA, ATRASADA]
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *   delete:
 *     summary: Eliminar uma tarefa ad-hoc e apagar ficheiros associados
 *     tags: [Actividades Ad-hoc]
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
 *         description: Tarefa eliminada com sucesso
 */
router.route('/:id')
  .get(adhocTaskController.getTaskById)
  .put(adhocTaskController.updateTask)
  .delete(adhocTaskController.deleteTask);

// ==========================================
// SUBMISSÕES DE TAREFAS
// ==========================================

/**
 * @swagger
 * /api/adhoc-tasks/submissions:
 *   post:
 *     summary: Submeter comprovativo ou resposta de uma tarefa
 *     tags: [Actividades Ad-hoc]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *             properties:
 *               task_id:
 *                 type: integer
 *                 example: 1
 *               notes:
 *                 type: string
 *                 example: "Segue em anexo o documento assinado."
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Ficheiro de comprovativo (PDF, imagem ou documento)
 *     responses:
 *       201:
 *         description: Submissão gravada com sucesso
 */
router.post('/submissions', upload.single('file'), adhocTaskController.submitTaskProof);

/**
 * @swagger
 * /api/adhoc-tasks/submissions/{submission_id}/review:
 *   put:
 *     summary: Avaliar/Verificar submissão (Aprovar ou Rejeitar)
 *     tags: [Actividades Ad-hoc]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submission_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_approved
 *             properties:
 *               is_approved:
 *                 type: boolean
 *                 example: true
 *               feedback:
 *                 type: string
 *                 example: "Documento verificado e em conformidade."
 *     responses:
 *       200:
 *         description: Submissão avaliada com sucesso
 */
router.put('/submissions/:submission_id/review', adhocTaskController.reviewSubmission);

module.exports = router;