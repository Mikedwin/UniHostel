const express = require('express');
const router = express.Router();
const applicationController = require('../controller/application.controller');
const { auth, checkRole } = require('../middleware/auth');

// Student Application Management
router.post('/', auth, checkRole('student'), applicationController.createApplication);
router.get('/student', auth, checkRole('student'), applicationController.getStudentApplications);
router.delete('/:id', auth, checkRole('student'), applicationController.deleteApplication);

// Manager Application Management
router.get('/manager', auth, checkRole('manager'), applicationController.getManagerApplications);
router.patch('/:id/status', auth, checkRole('manager'), applicationController.updateApplicationStatus);

// Shared / Stats / Operations
router.get('/hostel/:hostelId/stats', applicationController.getHostelStats);
router.patch('/:id/recalculate', auth, applicationController.recalculateApplication);
router.patch('/:id/archive', auth, applicationController.archiveApplication);
router.delete('/:id/permanent', auth, applicationController.permanentDeleteApplication);

module.exports = router;
