const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const userRoutes = require('./routes/userRoutes');
const academicRoutes = require('./routes/academicRoutes'); 
const planningRoutes = require('./routes/planningRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const adhocTaskRoutes = require('./routes/adhocTaskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes); 
app.use('/api', planningRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/adhocTask', adhocTaskRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 API SGPDUZ operacional.',
    docs: 'Aceda a /api-docs para ver a documentação Swagger.'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada.' });
});

module.exports = app;