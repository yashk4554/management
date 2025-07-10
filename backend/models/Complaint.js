const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
  description: { type: String, required: true, minlength: 10, maxlength: 1000 },
  department: { type: String, required: true, trim: true, index: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

complaintSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

complaintSchema.index({ department: 1, status: 1 });

// Example schema method
complaintSchema.methods.isResolved = function () {
  return this.status === 'Resolved';
};

module.exports = mongoose.model('Complaint', complaintSchema);
