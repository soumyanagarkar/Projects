const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['INVITE', 'PROJECT', 'TASK'], required: true },
  message: { type: String, required: true },
  linkedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  linkedInviteId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectInvite' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);