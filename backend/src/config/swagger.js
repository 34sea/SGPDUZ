const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SGPDUZ - Sistema de Gestão Académica e Pedagógica',
      version: '1.0.0',
      description: 'Documentação da API de Acesso, Roles, Permissões e Utilizadores do SGPDUZ',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor Local / Container Docker',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;