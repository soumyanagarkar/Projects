const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

router.get('/', async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ message: "Project ID is required" });
        }

        const logs = await ActivityLog.find({ projectId })
            .sort({ createdAt: -1 })
            .limit(50); // Increased limit

        res.json(logs);
    } catch (err) {
        console.error("Activity Log Error:", err);
        res.status(500).json([]);
    }
});

module.exports = router;