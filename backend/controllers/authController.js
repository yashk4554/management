const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

// Log activity
async function logActivity(action, userId, details) {
  await ActivityLog.create({ action, userId, details });
}

const logEvent = (event, email) => {
  const logPath = path.join(__dirname, '../log.txt');
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ${event} - ${email}\n`;
  fs.appendFileSync(logPath, log);
};


const { body } = require('express-validator');
exports.validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.log({ action: 'REGISTER_FAIL', details: JSON.stringify(errors.array()), ip: req.ip });
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      logger.log({ action: 'REGISTER_FAIL', userName: name, details: 'User exists', ip: req.ip });
      return res.status(400).json({ error: 'User already exists' });
    }
    user = new User({ name, email, password });
    await user.save();
    await logActivity('REGISTER', user._id, 'User registered');
    logger.log({ userId: user._id, userName: user.name, action: 'REGISTER', details: 'User registered', ip: req.ip });
    const token = generateToken({ id: user._id, role: user.role });
    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    logger.log({ action: 'REGISTER_ERROR', details: err.message, ip: req.ip });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.log({ action: 'LOGIN_FAIL', details: JSON.stringify(errors.array()), ip: req.ip });
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.log({ action: 'LOGIN_FAIL', details: 'No user', ip: req.ip });
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.log({ userId: user._id, userName: user.name, action: 'LOGIN_FAIL', details: 'Wrong password', ip: req.ip });
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    await logActivity('LOGIN', user._id, 'User logged in');
    logger.log({ userId: user._id, userName: user.name, action: 'LOGIN', details: 'User logged in', ip: req.ip });
    const token = generateToken({ id: user._id, role: user.role });
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    logger.log({ action: 'LOGIN_ERROR', details: err.message, ip: req.ip });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
