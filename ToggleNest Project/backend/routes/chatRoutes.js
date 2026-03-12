const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");

const authMiddleware = require("../middleware/authMiddleware");
const Membership = require("../models/Membership");

router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    // optional: check if user is member of project to view chats?
    // Assuming Viewers can view chats.
    const membership = await Membership.findOne({ userId: req.user._id, projectId: req.params.projectId });
    if (!membership) return res.status(403).json({ message: "Not a member" });

    const messages = await Message.find({ projectId: req.params.projectId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

router.post("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const { projectId } = req.params;

    // Check permissions: Admin or Member only (Viewer cannot chat)
    const membership = await Membership.findOne({
      userId: req.user._id,
      projectId,
      role: { $in: ['Admin', 'Member'] }
    });

    if (!membership) {
      return res.status(403).json({ message: "Insufficient permissions to chat (Viewers cannot chat)" });
    }

    const chat = await Message.create({
      projectId: projectId,
      sender: req.user._id,
      message,
    });

    // Populate sender details for immediate frontend display if needed, 
    // or just return chat. Frontend usually needs name.
    await chat.populate("sender", "name");

    res.status(201).json(chat);
  } catch (err) {
    console.error("POST CHAT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;