const pool = require('../config/db');

exports.getPermissions = async (req, res) => {
  try {
    const [permissions] = await pool.query('SELECT * FROM permissions ORDER BY id ASC');
    return res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'O nome da permissão é obrigatório.' });
    }

    const formattedName = name.toUpperCase().trim();
    const [result] = await pool.query('INSERT INTO permissions (name) VALUES (?)', [formattedName]);

    return res.status(201).json({
      success: true,
      message: 'Permissão criada com sucesso.',
      data: { id: result.insertId, name: formattedName }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Esta permissão já existe.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM permissions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Permissão não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Permissão eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};