const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getProjectMembers,
  addMember,
  removeMember,
  changeRole,
  searchUsers
} = require('../controllers/memberController');

// GET project members
router.get('/:projectId', protect, getProjectMembers);

// POST add member
router.post('/add', protect, addMember);

// POST remove member
router.post('/remove', protect, removeMember);

// POST change role
router.post('/change-role', protect, changeRole);

// GET search users
router.get('/search/users', protect, searchUsers);

module.exports = router;