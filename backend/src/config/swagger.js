const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SGPD (Sistema de Gestão Pedagógica Digital) ',
      version: '1.0.0',
      description: 'O projecto consiste no desenvolvimento de uma aplicação web para digitalizar e automatizar os instrumentos de gestão pedagógica do Departamento de Engenharia Informática da Faculdade de Ciências e Tecnologia da Universidade Zambeze. O sistema permitirá gerir o Plano Analítico das unidades curriculares, controlar as aulas leccionadas e as avaliações, digitalizar e arquivar pautas finais, gerir actividades atribuídas aos docentes e gerar relatórios semestrais e anuais. A solução pretende reduzir processos manuais, melhorar o cumprimento das normas pedagógicas e disponibilizar informação consolidada para apoiar a coordenação e a tomada de decisões no departamento.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor Local (Docker)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;