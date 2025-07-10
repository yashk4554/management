const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Admin login
router.post('/login', [
  check('email', 'Email is required').isEmail(),
  check('password', 'Password is required').not().isEmpty()
], adminController.login);

// All routes below require admin auth
router.use(auth, adminController.adminOnly);

// View all complaints (with filters)
router.get('/complaints', adminController.getAllComplaints);

// Update complaint status
router.put('/complaints/:id/status', [
  check('status', 'Status is required').not().isEmpty()
], adminController.updateComplaintStatus);

// Delete complaint
router.delete('/complaints/:id', adminController.deleteComplaint);

// Get stats
router.get('/stats', adminController.stats);

// Get reports
router.get('/reports', adminController.reports);

// Get activities
router.get('/activities', adminController.activities);

// Get users
router.get('/users', adminController.users);

module.exports = router;
