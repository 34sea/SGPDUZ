const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestão de Roles (Perfis) e Atribuição de Permissões
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Listar todos os roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *   post:
 *     summary: Criar um novo role
 *     tags: [Roles]
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
 *                 example: "DOCENTE"
 *     responses:
 *       201:
 *         description: Role criado
 */
router.route('/')
  .get(roleController.getRoles)
  .post(roleController.createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obter detalhes do role com suas permissões
 *     tags: [Roles]
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
 *         description: Detalhes do role
 *   put:
 *     summary: Atualizar nome do role
 *     tags: [Roles]
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
 *                 example: "CHEFE_DEPARTAMENTO"
 *     responses:
 *       200:
 *         description: Role atualizado
 *   delete:
 *     summary: Eliminar um role
 *     tags: [Roles]
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
 *         description: Role eliminado
 */
router.route('/:id')
  .get(roleController.getRoleById)
  .put(roleController.updateRole)
  .delete(roleController.deleteRole);

/**
 * @swagger
 * /api/roles/{roleId}/permissions:
 *   post:
 *     summary: Associar uma permissão a um role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
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
 *               - permission_id
 *             properties:
 *               permission_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Permissão associada
 *   put:
 *     summary: Sincronizar (substituir todas) permissões de um role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
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
 *               - permission_ids
 *             properties:
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Permissões sincronizadas
 */
router.route('/:roleId/permissions')
  .post(roleController.assignPermission)
  .put(roleController.syncPermissions);

/**
 * @swagger
 * /api/roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     summary: Remover uma permissão específica de um role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permissão removida do role
 */
router.route('/:roleId/permissions/:permissionId')
  .delete(roleController.removePermission);

module.exports = router;