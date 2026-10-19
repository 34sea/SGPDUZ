const pool = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Configurações do administrador (pode ser sobrescrita por variáveis de ambiente).
 * Em produção defina ADMIN_EMAIL e ADMIN_PASSWORD nas variáveis de ambiente.
 */
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador do Sistema';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sgpduz.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * Cria o utilizador administrador apenas se ainda não existir no banco.
 * É idempotente: executa quantas vezes for necessário, cria apenas uma vez.
 */
async function seedAdmin() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Garante que a role ADMIN existe (criada pelo init.sql)
    const [roles] = await connection.query(
      "SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1"
    );
    if (roles.length === 0) {
      console.warn(
        '⚠️  Seed admin: role "ADMIN" não encontrada. Execute o init.sql antes de iniciar o backend.'
      );
      return;
    }
    const roleId = roles[0].id;

    // Verifica se já existe um administrador com esse e-mail (cria uma vez só)
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      console.log(`ℹ️  Seed admin: administrador já existe (${ADMIN_EMAIL}). Ignorado.`);
      return;
    }

    // Hasheia a senha igual ao padrão do userController
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await connection.query(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [ADMIN_NAME, ADMIN_EMAIL, hashedPassword, roleId]
    );

    console.log('✅ Seed admin: administrador criado com sucesso!');
    console.log(`   Nome: ${ADMIN_NAME}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha: ${ADMIN_PASSWORD}`);
    console.log('   ⚠️  Altere a senha após o primeiro acesso.');
  } catch (err) {
    console.error('❌ Seed admin: erro ao criar administrador:', err.message);
    throw err;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { seedAdmin, ADMIN_EMAIL, ADMIN_PASSWORD };
