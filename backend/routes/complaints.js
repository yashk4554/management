const express = require('express');
// const { check } = require('express-validator');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const auth = require('../middleware/auth');

// All routes protected by JWT
router.use(auth);

// @route   POST /api/complaints
// @desc    Create complaint
// @access  Private
// Remove duplicate route definitions and handlers

// @route   GET /api/complaints
// @desc    List complaints (with filters, pagination, search)
// @access  Private
router.get('/', complaintController.list);

// @route   PUT /api/complaints/:id
// @desc    Update complaint
// @access  Private
// For user update (not admin bulk/status update)
// User update (not admin bulk/status update)
router.put(
  '/:id',
  complaintController.validateComplaint,
  async (req, res) => {
    // Only allow user to update their own complaint (not status)
    try {
      const complaint = await require('../models/Complaint').findById(req.params.id);
      if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
      if (complaint.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });
      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.department) updates.department = req.body.department;
      updates.updatedAt = Date.now();
      const updated = await complaint.set(updates).save();
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Admin-only update (status, etc.)
router.put(
  '/admin/:id',
  complaintController.update
);

// @route   DELETE /api/complaints/:id
// @desc    Delete complaint
// @access  Private
router.delete('/:id', complaintController.remove);



module.exports = router;
