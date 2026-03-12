const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createProject,
  getUserProjects,
  joinWithCode,
  deleteProject,
  getProjectDetails,
  updateProject,
  removeAttachment
} = require('../controllers/projectController');

// GET user's projects
router.get('/', protect, getUserProjects);

// POST create new project
router.post('/', protect, upload.array('attachments'), createProject);

// POST join with code
router.post('/join', protect, joinWithCode);

// GET project details
router.get('/:id', protect, getProjectDetails);

// PUT update project details
router.put('/:id', protect, upload.array('attachments'), updateProject);

// PATCH remove attachment
router.patch('/:id/attachments/remove', protect, removeAttachment);

// DELETE project
router.delete('/:id', protect, deleteProject);

module.exports = router;