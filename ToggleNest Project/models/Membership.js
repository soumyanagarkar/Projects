const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  role: {
    type: String,
    enum: ['Admin', 'Member', 'Viewer', 'Contributor', 'SDE'],
    default: 'Member'
  },
  joinedAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique user per project
membershipSchema.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.models.Membership || mongoose.model('Membership', membershipSchema);