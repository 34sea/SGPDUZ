const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e palavra-passe são obrigatórios.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    delete user.password;

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET || 'secret_key_sgpd_2026',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login efetuado com sucesso.',
      token,
      data: user
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role_id, 
        r.name as role_name, 
        u.created_at 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id DESC
    `);

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role_id, 
        r.name as role_name, 
        u.created_at 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    const user = users[0];
    let permissions = [];

    if (user.role_id) {
      const [perms] = await pool.query(`
        SELECT p.id, p.name 
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `, [user.role_id]);
      permissions = perms;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        permissions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nome, email e palavra-passe são obrigatórios.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Utilizador criado com sucesso.',
      data: {
        id: result.insertId,
        name,
        email,
        role_id: role_id || null
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Este e-mail já está registado.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role_id } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role_id !== undefined) {
      updates.push('role_id = ?');
      values.push(role_id);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Forneça pelo menos um campo para atualizar.' });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Utilizador atualizado com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Este e-mail já está em uso.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Utilizador eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};