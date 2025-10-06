const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');

const institutionController = require('../controllers/config/institutionController');
const levelController = require('../controllers/config/levelController');
const gradeController = require('../controllers/config/gradeController');
const sectionController = require('../controllers/config/sectionController');

const router = express.Router();

router.get('/institution', protect, authorize('Administrador', 'Secretaria'), institutionController.getInstitution);
router.post('/institution', protect, authorize('Administrador', 'Secretaria'), institutionController.saveInstitution);

router.get('/levels', protect, authorize('Administrador'), levelController.getAllLevels);
router.post('/levels', protect, authorize('Administrador'), levelController.createLevel);
router.put('/levels/:id', protect, authorize('Administrador'), levelController.updateLevel);
router.delete('/levels/:id', protect, authorize('Administrador'), levelController.deleteLevel);

router.get('/grades', protect, authorize('Administrador'), gradeController.getAllGrades);
router.get('/grades/level/:levelId', protect, authorize('Administrador'), gradeController.getGradesByLevel);
router.post('/grades', protect, authorize('Administrador'), gradeController.createGrade);
router.put('/grades/:id', protect, authorize('Administrador'), gradeController.updateGrade);
router.delete('/grades/:id', protect, authorize('Administrador'), gradeController.deleteGrade);

router.get('/sections', protect, authorize('Administrador'), sectionController.getAllSections);
router.get('/sections/grade/:gradeId', protect, authorize('Administrador'), sectionController.getSectionsByGrade);
router.post('/sections', protect, authorize('Administrador'), sectionController.createSection);
router.put('/sections/:id', protect, authorize('Administrador'), sectionController.updateSection);
router.delete('/sections/:id', protect, authorize('Administrador'), sectionController.deleteSection);

module.exports = router;