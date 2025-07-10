const Complaint = require('../models/Complaint');
const ActivityLog = require('../models/ActivityLog');
const { body, validationResult, query } = require('express-validator');
const logger = require('../utils/logger');

// Log activity
async function logActivity(action, userId, details) {
  await ActivityLog.create({ action, userId, details });
}

exports.validateComplaint = [
  body('title').isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('department').notEmpty().withMessage('Department is required'),
];

// GET /api/complaints (user: own, admin: all, with filters, search, pagination)
exports.list = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const { page = 1, limit = 10, status, department, search, sort = '-createdAt', from, to } = req.query;
    const filter = {};
    if (!isAdmin) filter.userId = req.user.id;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const complaints = await Complaint.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Complaint.countDocuments(filter);
    res.json({ complaints, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/complaints/:id
exports.get = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (req.user.role !== 'admin' && complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/complaints
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.log({ userId: req.user.id, action: 'COMPLAINT_CREATE_FAIL', details: JSON.stringify(errors.array()), ip: req.ip });
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const complaint = new Complaint({ ...req.body, userId: req.user.id });
    await complaint.save();
    await logActivity('COMPLAINT_CREATE', req.user.id, `Complaint ${complaint._id}`);
    logger.log({ userId: req.user.id, action: 'COMPLAINT_CREATE', details: `Complaint ${complaint._id}`, ip: req.ip });
    res.status(201).json(complaint);
  } catch (err) {
    logger.log({ userId: req.user.id, action: 'COMPLAINT_CREATE_ERROR', details: err.message, ip: req.ip });
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/complaints/:id (admin only)
exports.update = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { status } = req.body;
  if (!['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    await logActivity('COMPLAINT_UPDATE', req.user.id, `Complaint ${complaint._id} status: ${status}`);
    logger.log({ userId: req.user.id, action: 'COMPLAINT_UPDATE', details: `Complaint ${complaint._id} status: ${status}`, ip: req.ip });
    res.json(complaint);
  } catch (err) {
    logger.log({ userId: req.user.id, action: 'COMPLAINT_UPDATE_ERROR', details: err.message, ip: req.ip });
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/complaints/:id (admin only)
exports.remove = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    await logActivity('COMPLAINT_DELETE', req.user.id, `Complaint ${complaint._id}`);
    logger.log({ userId: req.user.id, action: 'COMPLAINT_DELETE', details: `Complaint ${complaint._id}`, ip: req.ip });
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    logger.log({ userId: req.user.id, action: 'COMPLAINT_DELETE_ERROR', details: err.message, ip: req.ip });
    res.status(500).json({ error: 'Server error' });
  }
};
