const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());

// Expor a pasta de uploads estaticamente (para visualizar as imagens salvas)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', roleRoutes);
app.use('/api', permissionRoutes);
app.use('/api', userRoutes);

module.exports = app;