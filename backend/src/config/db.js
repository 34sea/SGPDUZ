const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'SGPDUZ@12345',
  database: process.env.DB_NAME || 'SGPDUZ',
   waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(connection => {
    console.log('Conexão com a base de dados SGPDUZ estabelecida com sucesso.');
    connection.release();
  })
  .catch(err => {
    console.error('Erro ao conectar à base de dados SGPDUZ:', err.message);
  });

module.exports = pool;