const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middlewares/authMiddleware');
router.use(authMiddleware);
// Importe o seu authMiddleware se pretender proteger a rota
// const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/indicators', reportsController.getIndicators);
router.get('/teacher-compliance', reportsController.getTeacherCompliance);
router.get('/subject-compliance', reportsController.getSubjectCompliance);
router.get('/compare-semesters', reportsController.compareSemesters);
router.post('/generate-report', reportsController.generateReport);

module.exports = router;