const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
