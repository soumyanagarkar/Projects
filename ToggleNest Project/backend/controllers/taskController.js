const Task = require('../models/Task');
const Project = require('../models/Project');
const Membership = require('../models/Membership');

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { projectId, title, description, status, priority, assignee, dueDate, labels, subtasks, blockers, tags } = req.body;

        if (!projectId || !title) {
            return res.status(400).json({ message: 'Project ID and Title are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check permissions: Admin or Member only
        const membership = await Membership.findOne({
            userId: req.user._id,
            projectId,
            role: { $in: ['Admin', 'Member'] }
        });

        if (!membership) {
            return res.status(403).json({ message: 'Insufficient permissions. Viewers cannot create tasks.' });
        }

        const newTask = new Task({
            projectId,
            title,
            description,
            status: status || 'Todo',
            priority: priority || 'Medium',
            assignee,
            dueDate,
            labels,
            subtasks,
            blockers,
            tags
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all tasks for a project
exports.getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ projectId }).populate('assignee', 'name email avatar');
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions: Admin or Member
        const membership = await Membership.findOne({
            userId: req.user._id,
            projectId: task.projectId,
            role: { $in: ['Admin', 'Member'] }
        });

        if (!membership) {
            return res.status(403).json({ message: 'Insufficient permissions.' });
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });

        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions: Admin only
        const membership = await Membership.findOne({
            userId: req.user._id,
            projectId: task.projectId,
            role: 'Admin'
        });

        if (!membership) {
            return res.status(403).json({ message: 'Insufficient permissions. Only Admin can delete tasks.' });
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
