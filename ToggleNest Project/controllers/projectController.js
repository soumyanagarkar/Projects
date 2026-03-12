const Project = require('../models/Project');
const Membership = require('../models/Membership');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');
const Message = require('../models/Message');
const cloudinary = require('cloudinary').v2;
const { randomUUID } = require('crypto');

// Helper to generate a project key from name or provided key and ensure it fits format
const generateProjectKeyFromName = async (name) => {
  if (!name) return null;
  // Take uppercase letters from words, fall back to first letters
  const cleaned = name.replace(/[^A-Za-z0-9 ]+/g, ' ').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  let key = parts.map(p => p.charAt(0)).join('').toUpperCase();
  if (key.length < 2) key = cleaned.substring(0, 3).toUpperCase();
  key = key.substring(0, 10);

  // Ensure uniqueness by checking DB and appending numbers if needed
  let candidate = key;
  let suffix = 1;
  while (await Project.findOne({ projectKey: candidate })) {
    candidate = `${key}${suffix}`.substring(0, 10);
    suffix += 1;
    if (suffix > 9999) break;
  }
  return candidate;
};

// Helper to generate unique project code
const generateProjectCode = () => {
  return randomUUID().substring(0, 8).toUpperCase();
};

const normalizeLink = (link) => {
  if (typeof link !== 'string') return null;
  const trimmed = link.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const normalizeLinks = (links) => {
  if (!Array.isArray(links)) return [];
  return links.map(normalizeLink).filter(Boolean);
};

const normalizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) return [];
  return attachments.filter((item) => typeof item === 'string' && /^https?:\/\//i.test(item.trim()));
};

const getCloudinaryPublicIdFromUrl = (url) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  const cleanUrl = url.split('?')[0];
  const uploadSegment = '/upload/';
  const idx = cleanUrl.indexOf(uploadSegment);
  if (idx === -1) return null;

  let suffix = cleanUrl.slice(idx + uploadSegment.length);
  suffix = suffix.replace(/^v\d+\//, '');
  if (!suffix) return null;

  const lastDot = suffix.lastIndexOf('.');
  return lastDot > 0 ? suffix.slice(0, lastDot) : suffix;
};

const deleteFromCloudinaryByUrl = async (fileUrl) => {
  const publicId = getCloudinaryPublicIdFromUrl(fileUrl);
  if (!publicId) return;

  // Try all Cloudinary resource types so mixed uploads (images/raw/video) can be deleted.
  for (const resourceType of ['image', 'raw', 'video']) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      if (result?.result === 'ok' || result?.result === 'not found') break;
    } catch (cloudErr) {
      console.warn(`Cloudinary delete warning (${resourceType}):`, cloudErr.message);
    }
  }
};

// Create Project (Admin only)
exports.createProject = async (req, res) => {
  try {
    let { name, description, gitLink, attachments, relatedLinks, members, projectKey, projectType, template, visibility, defaultAssignee } = req.body;
    const manager = req.user._id;

    // Parse JSON if arrays are sent as strings (common with multipart/form-data)
    try { if (typeof members === 'string') members = JSON.parse(members); } catch (e) { members = []; }
    try { if (typeof relatedLinks === 'string') relatedLinks = JSON.parse(relatedLinks); } catch (e) { relatedLinks = []; }
    try { if (typeof attachments === 'string') attachments = JSON.parse(attachments); } catch (e) { attachments = []; }

    // Handle file uploads from Cloudinary
    const uploadedAttachments = req.files ? req.files.map(file => file.secure_url || file.path).filter(Boolean) : [];
    const sanitizedBodyAttachments = normalizeAttachments(Array.isArray(attachments) ? attachments : []);
    const finalAttachments = [...sanitizedBodyAttachments, ...uploadedAttachments];

    const projectCode = generateProjectCode();

    // Generate or validate projectKey
    let finalProjectKey = projectKey && String(projectKey).trim().toUpperCase() || null;
    if (!finalProjectKey) finalProjectKey = await generateProjectKeyFromName(name);

    // If still null, fallback to generated projectCode substring
    if (!finalProjectKey) finalProjectKey = projectCode.substring(0, 6);

    const project = await Project.create({
      name,
      description,
      gitLink,
      attachments: finalAttachments,
      relatedLinks: normalizeLinks(relatedLinks),
      projectCode,
      projectKey: finalProjectKey,
      projectType: projectType || 'software',
      template: template || 'basic-kanban',
      visibility: visibility || 'private',
      defaultAssignee: defaultAssignee || null,
      manager,
      managerName: req.user.name,
      members: [manager] // start with creator
    });

    // Create membership for creator with Owner role
    await Membership.create({
      userId: manager,
      projectId: project._id,
      role: 'Admin'
    });

    // If creator provided member emails (array), add them as members
    if (Array.isArray(members) && members.length > 0) {
      const User = require('../models/User');
      for (const mem of members) {
        try {
          // mem may be an email or userId; prefer email lookup
          let userObj = null;
          if (typeof mem === 'string' && mem.includes('@')) {
            userObj = await User.findOne({ email: mem.toLowerCase().trim() });
          } else {
            userObj = await User.findById(mem).catch(() => null);
          }

          if (!userObj) continue;

          const uid = userObj._id;

          // Skip if already member
          const exists = await Membership.findOne({ userId: uid, projectId: project._id });
          if (exists) continue;

          // Add to project's members array
          project.members.push(uid);

          // Create membership with default role
          await Membership.create({ userId: uid, projectId: project._id, role: 'Member' });

          // Send a lightweight notification
          await Notification.create({
            userId: uid,
            type: 'ADDED_TO_PROJECT',
            message: `You were added to project \"${project.name}\"`,
            linkedProjectId: project._id
          });
        } catch (err) {
          // continue on per-member errors
          console.warn('Error adding member during project creation:', err.message);
        }
      }

      // Save project after adding members
      await project.save();
    }

    // Log activity
    await ActivityLog.create({
      projectId: project._id,
      userId: manager,
      userName: req.user.name,
      action: 'Project created',
      entityType: 'project',
      entityId: project._id
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's projects
exports.getUserProjects = async (req, res) => {
  try {
    // 1. Get projects from memberships
    const memberships = await Membership.find({ userId: req.user._id })
      .populate({
        path: 'projectId',
        populate: [
          { path: 'members', select: 'name' },
          { path: 'manager', select: 'name' }
        ]
      });

    const projectIdsFromMemberships = memberships
      .filter(m => m.projectId)
      .map(m => m.projectId._id.toString());

    // 2. Get projects where user is manager or in members array but might lack membership (legacy)
    const legacyProjects = await Project.find({
      $or: [
        { manager: req.user._id },
        { members: req.user._id }
      ],
      _id: { $nin: projectIdsFromMemberships }
    }).populate('members', 'name').populate('manager', 'name');

    const projectsFromMemberships = memberships
      .filter(m => m.projectId)
      .map(m => ({
        ...m.projectId.toObject(),
        userRole: m.role
      }));

    const standaloneProjects = legacyProjects.map(p => ({
      ...p.toObject(),
      userRole: (p.manager?._id || p.manager)?.toString() === req.user._id.toString() ? 'Admin' : 'Member'
    }));

    const allProjects = [...projectsFromMemberships, ...standaloneProjects];

    // Fetch all members from Membership table for these projects to ensure we have everyone
    // for the dashbord charts, also considering legacy members array
    const projectsWithAllMembers = await Promise.all(allProjects.map(async (p) => {
      // 1. Get from Membership table
      const memberships = await Membership.find({ projectId: p._id }).populate('userId', 'name email');
      const mList = memberships.map(m => ({
        _id: m.userId?._id,
        name: m.userId?.name,
        email: m.userId?.email,
        role: m.role
      }));

      // 2. Add manager if not already in list
      const managerId = p.manager?._id || p.manager;
      if (managerId && !mList.some(m => m._id?.toString() === managerId.toString())) {
        mList.push({
          _id: p.manager?._id || p.manager,
          name: p.manager?.name || "Manager",
          role: 'Admin'
        });
      }

      return {
        ...p,
        members: mList
      };
    }));

    res.json(projectsWithAllMembers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Join project with code
exports.joinWithCode = async (req, res) => {
  try {
    const { code } = req.body;
    const project = await Project.findOne({ projectCode: code });

    if (!project) {
      return res.status(404).json({ message: 'Invalid project code' });
    }

    // Check if already member
    const existingMembership = await Membership.findOne({
      userId: req.user._id,
      projectId: project._id
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Already a member of this project' });
    }

    // Create membership
    const membership = await Membership.create({
      userId: req.user._id,
      projectId: project._id,
      role: project.defaultRole
    });

    // Log activity
    await ActivityLog.create({
      projectId: project._id,
      userId: req.user._id,
      userName: req.user.name,
      action: `Joined project via code`,
      entityType: 'member',
      entityId: membership._id
    });

    res.json({ message: 'Joined project successfully', project, role: membership.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single project details
exports.getProjectDetails = async (req, res) => {
  try {
    const projectId = req.params.id;
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const project = await Project.findById(projectId).populate('manager', 'name email').populate('members', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check membership
    let membership = await Membership.findOne({
      userId: req.user._id,
      projectId
    });

    if (!membership) {
      // Auto-repair for managers/creators who lack a membership record (legacy projects)
      if (project.manager && project.manager._id.toString() === req.user._id.toString()) {
        membership = await Membership.create({
          userId: req.user._id,
          projectId,
          role: 'Admin'
        });
      } else if (project.members.some(m => m._id.toString() === req.user._id.toString())) {
        // Also auto-repair for people in the members array
        membership = await Membership.create({
          userId: req.user._id,
          projectId,
          role: 'Member'
        });
      }

      if (!membership) {
        return res.status(403).json({ message: 'Not a member of this project' });
      }
    }

    res.json({ ...project.toObject(), userRole: membership.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update Project (Admin only)
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    let { name, description, gitLink, relatedLinks, status, priority, progress } = req.body;

    // Check permissions
    const membership = await Membership.findOne({
      userId: req.user._id,
      projectId
    });

    if (!membership || !['Admin', 'Manager', 'Owner'].includes(membership.role)) {
      return res.status(403).json({ message: 'Insufficient permissions. Only Admins or Managers can update project info.' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const uploadedAttachments = req.files.map(file => file.secure_url || file.path).filter(Boolean);
      project.attachments.push(...uploadedAttachments);
    }

    // Update fields if provided
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (gitLink !== undefined) project.gitLink = gitLink;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (progress !== undefined) project.progress = Number(progress);

    if (relatedLinks) {
      try {
        const parsedLinks = typeof relatedLinks === 'string' ? JSON.parse(relatedLinks) : relatedLinks;
        project.relatedLinks = normalizeLinks(parsedLinks);
      } catch (e) {
        console.error("Error parsing relatedLinks:", e);
      }
    }

    await project.save();

    // Log activity
    await ActivityLog.create({
      projectId: project._id,
      userId: req.user._id,
      userName: req.user.name,
      action: 'Updated project details',
      entityType: 'project',
      entityId: project._id
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove Attachment (Admin only)
exports.removeAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl } = req.body;

    // Check permissions
    const membership = await Membership.findOne({
      userId: req.user._id,
      projectId: id
    });

    if (!membership || !['Admin', 'Manager', 'Owner'].includes(membership.role)) {
      return res.status(403).json({ message: 'Insufficient permissions. Only Admins or Managers can remove attachments.' });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await deleteFromCloudinaryByUrl(fileUrl);

    project.attachments = project.attachments.filter(url => url !== fileUrl);
    await project.save();

    res.json({ message: 'Attachment removed successfully', attachments: project.attachments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Project (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Check permissions
    const membership = await Membership.findOne({
      userId: req.user._id,
      projectId
    });

    if (!membership || !['Admin', 'Manager', 'Owner'].includes(membership.role)) {
      return res.status(403).json({ message: 'Insufficient permissions. Only Admin can delete project.' });
    }

    // Delete all related data
    const project = await Project.findById(projectId);
    if (project?.attachments?.length) {
      for (const fileUrl of project.attachments) {
        await deleteFromCloudinaryByUrl(fileUrl);
      }
    }

    await Project.findByIdAndDelete(projectId);
    await Membership.deleteMany({ projectId });
    await Task.deleteMany({ projectId });
    await ActivityLog.deleteMany({ projectId });
    await Message.deleteMany({ projectId });
    await Notification.deleteMany({ linkedProjectId: projectId });

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
