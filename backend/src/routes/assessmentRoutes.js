const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer'); 

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Avaliações e Pautas Finais
 *   description: Gestão do calendário de testes, prazos de publicação e carregamento de pautas finais
 */

// ==========================================
// ASSESSMENTS
// ==========================================

/**
 * @swagger
 * /api/assessments:
 *   get:
 *     summary: Listar avaliações com filtros opcionais
 *     tags: [Avaliações e Pautas Finais]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_subject_teacher_id
 *         schema:
 *           type: integer
 *         description: Filtrar por atribuição docente
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DENTRO_DO_PRAZO, FORA_DO_PRAZO, PENDENTE]
 *         description: Filtrar pelo cumprimento do prazo
 *     responses:
 *       200:
 *         description: Lista de avaliações
 *   post:
 *     summary: Registar nova avaliação
 *     tags: [Avaliações e Pautas Finais]
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
 *               - title
 *               - assessment_date
 *               - deadline_date
 *             properties:
 *               class_subject_teacher_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "Teste 1 - Redes de Comunicação"
 *               assessment_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-10"
 *               deadline_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-24"
 *               results_published_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-20"
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 */
router.route('/')
  .get(assessmentController.getAssessments)
  .post(assessmentController.createAssessment);

/**
 * @swagger
 * /api/assessments/{id}:
 *   get:
 *     summary: Obter detalhes de uma avaliação
 *     tags: [Avaliações e Pautas Finais]
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
 *         description: Detalhes da avaliação
 *       404:
 *         description: Avaliação não encontrada
 *   put:
 *     summary: Atualizar datas ou estado de uma avaliação
 *     tags: [Avaliações e Pautas Finais]
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
 *               assessment_date:
 *                 type: string
 *                 format: date
 *               results_published_date:
 *                 type: string
 *                 format: date
 *               deadline_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [DENTRO_DO_PRAZO, FORA_DO_PRAZO, PENDENTE]
 *     responses:
 *       200:
 *         description: Avaliação atualizada
 *   delete:
 *     summary: Eliminar avaliação
 *     tags: [Avaliações e Pautas Finais]
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
 *         description: Avaliação eliminada
 */
router.route('/:id')
  .get(assessmentController.getAssessmentById)
  .put(assessmentController.updateAssessment)
  .delete(assessmentController.deleteAssessment);

// ==========================================
// FINAL GRADE SHEETS
// ==========================================

/**
 * @swagger
 * /api/assessments/grade-sheets/all:
 *   get:
 *     summary: Listar todas as pautas finais
 *     tags: [Avaliações e Pautas Finais]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_subject_teacher_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: epoch
 *         schema:
 *           type: string
 *           enum: [NORMAL, RECURSO, ESPECIAL]
 *     responses:
 *       200:
 *         description: Lista de pautas finais
 *   post:
 *     summary: Submeter nova pauta final (upload de ficheiro)
 *     tags: [Avaliações e Pautas Finais]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - class_subject_teacher_id
 *               - epoch
 *               - file
 *             properties:
 *               class_subject_teacher_id:
 *                 type: integer
 *                 example: 1
 *               epoch:
 *                 type: string
 *                 enum: [NORMAL, RECURSO, ESPECIAL]
 *                 example: "NORMAL"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Ficheiro da pauta (PDF, Excel ou Imagem)
 *     responses:
 *       201:
 *         description: Pauta final submetida com sucesso
 *       400:
 *         description: Ficheiro em falta ou dados inválidos
 */
router.get('/grade-sheets/all', assessmentController.getFinalGradeSheets);
router.post('/grade-sheets/all', upload.single('file'), assessmentController.createFinalGradeSheet);

/**
 * @swagger
 * /api/assessments/grade-sheets/{id}:
 *   get:
 *     summary: Obter detalhes de uma pauta final específica
 *     tags: [Avaliações e Pautas Finais]
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
 *         description: Detalhes da pauta final
 *       404:
 *         description: Pauta final não encontrada
 *   delete:
 *     summary: Eliminar registo de pauta final e o seu ficheiro
 *     tags: [Avaliações e Pautas Finais]
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
 *         description: Pauta final eliminada com sucesso
 */
router.route('/grade-sheets/:id')
  .get(assessmentController.getFinalGradeSheetById)
  .delete(assessmentController.deleteFinalGradeSheet);

module.exports = router;