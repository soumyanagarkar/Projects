const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ['task', 'project', 'member', 'invite', 'role', 'chat'], default: 'task' },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed }, // Additional details like old/new values
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);