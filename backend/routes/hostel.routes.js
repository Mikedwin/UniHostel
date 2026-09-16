const express = require('express');
const router = express.Router();
const hostelController = require('../controller/hostel.controller');
const { auth, checkRole } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const { validateImageUpload, hostelUpload } = require('../middleware/imageValidation');
const { parseHostelPayload } = require('../middleware/hostelPayload');
const { searchLimiter } = require('../config/security');

// Public listing with caching and rate limit
router.get('/', searchLimiter, cacheMiddleware(300), hostelController.getAllHostels);

// Manager specific listing queries
router.get('/my-listings', auth, checkRole('manager'), hostelController.getMyListings);
router.get('/my-trash', auth, checkRole('manager'), hostelController.getMyTrash);
router.patch('/:id/restore', auth, checkRole('manager'), hostelController.restoreHostel);

// Single hostel detail
router.get('/:id', hostelController.getHostelById);

// Manager CRUD
router.post('/', auth, checkRole('manager'), hostelUpload, parseHostelPayload, validateImageUpload, hostelController.createHostel);
router.put('/:id', auth, checkRole('manager'), hostelUpload, parseHostelPayload, validateImageUpload, hostelController.updateHostel);
router.delete('/:id', auth, checkRole('manager'), hostelController.deleteHostel);

module.exports = router;
