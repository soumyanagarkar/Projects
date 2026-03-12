const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, taskController.createTask);
router.get('/:projectId', protect, taskController.getTasksByProject);
router.put('/:taskId', protect, taskController.updateTask);
router.delete('/:taskId', protect, taskController.deleteTask);

module.exports = router;
