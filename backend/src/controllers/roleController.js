const pool = require('../config/db');

exports.getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    return res.status(200).json({ success: true, data: roles });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [roles] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);

    if (roles.length === 0) {
      return res.status(404).json({ success: false, message: 'Role não encontrado.' });
    }

    const [permissions] = await pool.query(
      `SELECT p.id, p.name 
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...roles[0],
        permissions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome do role é obrigatório.' });
    }

    const formattedName = name.toUpperCase().trim();
    const [result] = await pool.query('INSERT INTO roles (name) VALUES (?)', [formattedName]);

    return res.status(201).json({
      success: true,
      message: 'Role criado com sucesso.',
      data: { id: result.insertId, name: formattedName }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Este role já existe.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome é obrigatório.' });
    }

    const formattedName = name.toUpperCase().trim();
    const [result] = await pool.query('UPDATE roles SET name = ? WHERE id = ?', [formattedName, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Role não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Role atualizado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM roles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Role não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Role eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.assignPermission = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permission_id } = req.body;

    if (!permission_id) {
      return res.status(400).json({ success: false, message: 'ID da permissão é obrigatório.' });
    }

    await pool.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [roleId, permission_id]
    );

    return res.status(201).json({ success: true, message: 'Permissão associada ao role com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'O role já possui esta permissão.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.removePermission = async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [roleId, permissionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Associação não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Permissão removida do role com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.syncPermissions = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { roleId } = req.params;
    const { permission_ids } = req.body;

    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({ success: false, message: 'permission_ids deve ser uma lista de IDs.' });
    }

    await connection.beginTransaction();

    await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

    if (permission_ids.length > 0) {
      const values = permission_ids.map(pId => [roleId, pId]);
      await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [values]);
    }

    await connection.commit();
    return res.status(200).json({ success: true, message: 'Permissões do role sincronizadas com sucesso.' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};