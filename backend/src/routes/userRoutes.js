const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de Utilizadores e Autenticação
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Autenticação de Utilizador (Login)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@unizambeze.ac.mz"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login com sucesso e retorno do token JWT
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', userController.login); // Rota pública (/api/users/login)

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registo Público de Novo Utilizador (Auto-Registo)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Novo Utilizador"
 *               email:
 *                 type: string
 *                 example: "novo.user@unizambeze.ac.mz"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 *       400:
 *         description: Dados inválidos ou e-mail já registado
 */
router.post('/register', userController.register); // Rota pública (/api/users/register)

// --- A PARTIR DAQUI TODAS AS ROTAS EXIGEM TOKEN JWT ---
router.use(authMiddleware);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos os utilizadores
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de utilizadores
 *   post:
 *     summary: Criar novo utilizador
 *     tags: [Users]
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Prof. Dr. João Silva"
 *               email:
 *                 type: string
 *                 example: "joao.silva@unizambeze.ac.mz"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *               role_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Utilizador criado
 */
router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obter detalhes do utilizador e suas permissões
 *     tags: [Users]
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
 *         description: Detalhes do utilizador
 *   put:
 *     summary: Atualizar dados do utilizador
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Utilizador atualizado
 *   delete:
 *     summary: Eliminar utilizador
 *     tags: [Users]
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
 *         description: Utilizador eliminado
 */
router.route('/:id')
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;