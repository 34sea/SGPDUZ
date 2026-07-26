const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Gestão de Permissões do Sistema SGPD
 */

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Listar todas as permissões
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permissões retornada com sucesso
 *   post:
 *     summary: Criar uma nova permissão
 *     tags: [Permissions]
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
 *                 example: "MANAGE_USERS"
 *     responses:
 *       201:
 *         description: Permissão criada com sucesso
 */
router.route('/permissions')
  .get(permissionController.getPermissions)
  .post(permissionController.createPermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Eliminar uma permissão por ID
 *     tags: [Permissions]
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
 *         description: Permissão eliminada
 *       404:
 *         description: Permissão não encontrada
 */
router.route('/permissions/:id')
  .delete(permissionController.deletePermission);

module.exports = router;