const Membership = require('../models/Membership');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// Get project members
exports.getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user is member
    let userMembership = await Membership.findOne({
      userId: req.user._id,
      projectId
    });

    if (!userMembership) {
      // Check if user is the manager in the Project model (legacy support)
      const project = await Project.findById(projectId);
      if (project && project.manager && project.manager.toString() === req.user._id.toString()) {
        // Auto-create membership to fix legacy data
        userMembership = await Membership.create({
          userId: req.user._id,
          projectId,
          role: 'Admin'
        });
      } else if (project && project.members && project.members.includes(req.user._id)) {
        userMembership = await Membership.create({
          userId: req.user._id,
          projectId,
          role: 'Member'
        });
      }

      if (!userMembership) {
        return res.status(403).json({ message: 'Not a member of this project' });
      }
    }

    const memberships = await Membership.find({ projectId })
      .populate('userId', 'name email')
      .sort({ joinedAt: 1 });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const members = memberships
      .filter(m => m.userId) // Ensure user exists
      .map(m => {
        const memberId = String(m.userId._id || m.userId);
        const managerId = String(project.manager?._id || project.manager || '');

        return {
          _id: m._id,
          userId: memberId,
          name: m.userId.name,
          email: m.userId.email,
          role: m.role,
          joinedAt: m.joinedAt,
          isManager: managerId !== '' && memberId === managerId
        };
      });

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add member (Manager/Admin/Owner only)
exports.addMember = async (req, res) => {
  try {
    const { projectId, userId, role = 'Member' } = req.body;

    // Check permissions
    const userMembership = await Membership.findOne({
      userId: req.user._id,
      projectId,
      role: 'Admin'
    });

    if (!userMembership) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Check if already member
    const existingMembership = await Membership.findOne({
      userId,
      projectId
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Create membership
    const membership = await Membership.create({
      userId,
      projectId,
      role
    });

    // Update project members array
    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { members: userId }
    });

    // Notify the added user
    const project = await Project.findById(projectId);
    await Notification.create({
      userId,
      type: 'PROJECT',
      message: `You have been added to project "${project.name}" with role ${role}`,
      linkedProjectId: projectId
    });

    // Activity log
    const addedUser = await User.findById(userId);
    await ActivityLog.create({
      projectId,
      userId: req.user._id,
      userName: req.user.name,
      action: `Added ${addedUser.name} as ${role}`,
      entityType: 'member',
      entityId: membership._id
    });

    res.json({ message: 'Member added successfully', membership });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove member (Manager/Admin/Owner only)
exports.removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.body;

    if (userId === req.user._id.toString()) {
      const adminCount = await Membership.countDocuments({
        projectId,
        role: 'Admin'
      });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin' });
      }
    }

    // Check permissions
    const userMembership = await Membership.findOne({
      userId: req.user._id,
      projectId,
      role: 'Admin'
    });

    if (!userMembership) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Cannot remove users with higher or equal role
    const targetMembership = await Membership.findOne({
      userId,
      projectId
    });

    if (!targetMembership) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Protect the project manager (creator) from removal
    const project = await Project.findById(projectId);
    if (project && project.manager && project.manager.toString() === userId) {
      return res.status(403).json({ message: 'Cannot remove the project manager/creator' });
    }

    const roleHierarchy = { 'Viewer': 1, 'Member': 2, 'Contributor': 2, 'SDE': 2, 'Admin': 3 };
    const targetRank = roleHierarchy[targetMembership.role] || 2;
    const userRank = roleHierarchy[userMembership.role] || 2;

    if (targetRank > userRank) {
      return res.status(403).json({ message: 'Cannot remove users with a higher role' });
    }

    // Remove membership
    await Membership.findByIdAndDelete(targetMembership._id);

    // Update project members array
    await Project.findByIdAndUpdate(projectId, {
      $pull: { members: userId }
    });

    // Activity log
    const removedUser = await User.findById(userId);
    await ActivityLog.create({
      projectId,
      userId: req.user._id,
      userName: req.user.name,
      action: `Removed ${removedUser.name} from project`,
      entityType: 'member',
      entityId: targetMembership._id
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change member role (Admin/Owner only)
exports.changeRole = async (req, res) => {
  try {
    const { projectId, userId, newRole } = req.body;

    // Check permissions
    const userMembership = await Membership.findOne({
      userId: req.user._id,
      projectId,
      role: 'Admin'
    });

    if (!userMembership) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Cannot change your own role if you're the last admin
    if (userId === req.user._id.toString() && userMembership.role === 'Admin') {
      const adminCount = await Membership.countDocuments({
        projectId,
        role: 'Admin'
      });
      if (adminCount <= 1 && newRole !== 'Admin') {
        return res.status(400).json({ message: 'Cannot change role of the last admin' });
      }
    }

    // Update role
    const updatedMembership = await Membership.findOneAndUpdate(
      { userId, projectId },
      { role: newRole },
      { new: true }
    );

    if (!updatedMembership) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Activity log
    const changedUser = await User.findById(userId);
    await ActivityLog.create({
      projectId,
      userId: req.user._id,
      userName: req.user.name,
      action: `Changed ${changedUser.name}'s role to ${newRole}`,
      entityType: 'role',
      entityId: updatedMembership._id
    });

    res.json({ message: 'Role updated successfully', membership: updatedMembership });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search users (for adding members)
exports.searchUsers = async (req, res) => {
  try {
    const { query, projectId } = req.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Get existing members
    const existingMembers = await Membership.find({ projectId }).select('userId');
    const memberIds = existingMembers.map(m => m.userId);

    // Search users not in project
    const users = await User.find({
      _id: { $nin: memberIds },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email').limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};