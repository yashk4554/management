// Simple hardcoded admin (for demo)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const cache = new NodeCache({ stdTTL: 60 }); // 1 min cache

const logEvent = (event, detail) => {
  const logPath = path.join(__dirname, '../log.txt');
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ADMIN_${event} - ${detail}\n`;
  fs.appendFileSync(logPath, log);
};

// Helper: log admin activity
async function logAdmin(action, adminId, details) {
  await ActivityLog.create({ action: `ADMIN_${action}`, userId: adminId, details });
}

// Middleware: admin only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
};

exports.login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Provide id and role for admin JWT
    const token = jwt.sign({ id: 'admin', role: 'admin', admin: true }, process.env.JWT_SECRET, { expiresIn: '2h' });
    logEvent('LOGIN', email);
    return res.json({ token });
  }
  return res.status(401).json({ msg: 'Invalid admin credentials' });
};

// GET /api/admin/stats
exports.stats = async (req, res) => {
  const cacheKey = 'admin_stats';
  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));
  try {
    const total = await Complaint.countDocuments();
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const departmentStats = await Complaint.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const data = { total, statusCounts, departmentStats };
    cache.set(cacheKey, data);
    await logAdmin('VIEW_STATS', req.user.id, 'Viewed stats');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/reports
exports.reports = async (req, res) => {
  const cacheKey = 'admin_reports';
  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));
  try {
    // Complaints by department
    const byDept = await Complaint.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    // Most active users
    const activeUsers = await Complaint.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { count: 1, name: '$user.name', email: '$user.email' } }
    ]);
    // Complaints trend (last 30 days)
    const trend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    // Response time analysis (Resolved only)
    const responseTimes = await Complaint.aggregate([
      { $match: { status: 'Resolved' } },
      { $project: { diff: { $subtract: ['$updatedAt', '$createdAt'] } } }
    ]);
    const avgResponse = responseTimes.length ? Math.round(responseTimes.reduce((a, b) => a + b.diff, 0) / responseTimes.length / 1000 / 60 / 60) : 0;
    const data = { byDept, activeUsers, trend, avgResponseHours: avgResponse };
    cache.set(cacheKey, data);
    await logAdmin('VIEW_REPORTS', req.user.id, 'Viewed reports');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const { department, status } = req.query;
    let filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    // Show all complaints, including user info
    const complaints = await Complaint.find(filter).populate({ path: 'userId', select: 'name email role' });
    logEvent('VIEW_COMPLAINTS', JSON.stringify(filter));
    res.json(complaints);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateComplaintStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });
    complaint.status = status;
    await complaint.save();
    logEvent('UPDATE_STATUS', `id:${complaint._id} status:${status}`);
    res.json(complaint);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });
    logEvent('DELETE_COMPLAINT', `id:${req.params.id}`);
    res.json({ msg: 'Complaint deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// GET /api/admin/activities
exports.activities = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const logs = await ActivityLog.find()
      .sort('-timestamp')
      .skip((page-1)*limit)
      .limit(Number(limit))
      .populate('userId', 'name email role');
    const total = await ActivityLog.countDocuments();
    await logAdmin('VIEW_ACTIVITIES', req.user.id, `Page ${page}`);
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/users
exports.users = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    await logAdmin('VIEW_USERS', req.user.id, 'Viewed users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
