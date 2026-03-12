require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const protect = require('./middleware/authMiddleware');

// MODELS
const Project = require('./models/Project');
const Task = require('./models/Task');
const User = require("./models/User");
const Message = require("./models/Message");
const Notification = require("./models/Notification");
const ActivityLog = require('./models/ActivityLog');
const Membership = require('./models/Membership');

const app = express();
const server = http.createServer(app);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "https://tn-final-git-main-somas-projects-a6559bbc.vercel.app"
];

const envAllowedOrigins = String(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow Vercel preview/prod subdomains if needed.
  if (/^https:\/\/.*\.vercel\.app$/i.test(origin)) return true;
  return false;
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("CORS blocked by Socket.IO"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  },
});

const path = require("path");

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error("CORS blocked by Express"));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Disabled: using Cloudinary only

// --- SOCKET.IO ---
io.on("connection", (socket) => {
  console.log(`🟢 User Connected: ${socket.id}`);

  // 1. Join Project Rooms
  socket.on("join_room", ({ roomName, userId }) => {
    socket.join(roomName);
    console.log(`User ${userId} joined project room: ${roomName}`);
  });

  // 2. Chat Logic
  socket.on("send_message", async ({ projectId, senderId, message }) => {
    if (!message || !projectId) return;

    try {
      const newMessage = new Message({
        projectId,
        sender: senderId,
        message
      });
      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name');

      io.to(projectId).emit("receive_message", {
        senderId,
        senderName: populatedMessage.sender.name,
        message,
        time: newMessage.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (err) {
      console.error('Chat save error:', err);
    }
  });

  // 3. Activity Log Logic (Persistent & Real-time)
  socket.on("task_activity", async (data) => {
    try {
      if (!data.projectId || !data.action) return;

      const newActivity = new ActivityLog({
        projectId: data.projectId,
        userId: data.userId,
        userName: String(data.userName || "Unknown User"),
        action: String(data.action),
        entityType: data.entityType || 'task',
        entityId: data.entityId,
        details: data.details
      });

      const savedActivity = await newActivity.save();

      // Note: your roomName for activities IS the projectId
      io.to(data.projectId).emit("receive_activity", savedActivity);
    } catch (err) {
      console.error("Activity Save Error:", err);
    }
  });

  // 4. Private Notifications
  socket.on("identify", (userId) => {
    socket.join(String(userId));
    console.log(`User ${userId} joined private notification room`);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User Disconnected: ${socket.id}`);
  });
});

// Activity log
const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activity', protect, activityRoutes);
// --- NOTIFICATION API ---

// Get notifications for logged-in user
app.get("/api/notifications", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('linkedProjectId', 'name')
      .populate('linkedInviteId');

    res.json(notifications || []);
  } catch (err) {
    console.error("Notification Fetch Error:", err);
    res.status(500).json([]);
  }
});

// Mark one as read
app.patch("/api/notifications/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(400).json({ message: "Error updating notification" });
  }
});

// Mark all as read
app.patch("/api/notifications/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});

// --- CHAT API ---
app.use("/api/chat", require("./routes/chatRoutes"));

// --- AUTH ROUTES ---
app.use("/api/auth", require("./routes/authRoutes"));

// --- PROJECT ROUTES ---
app.use("/api/projects", require("./routes/projectRoutes"));

// --- MEMBER ROUTES ---
app.use("/api/members", require("./routes/memberRoutes"));
app.get('/api/users', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    console.log("Users found in DB:", users.length); // Debugging line
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// --- PROJECT ROUTES ---
// Moved to routes/projectRoutes.js

// --- TASK ROUTES (Protected by 'protect') ---

app.get('/api/tasks/:projectId', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    // Check membership
    let membership = await Membership.findOne({
      userId: req.user._id,
      projectId: req.params.projectId
    });

    if (!membership) {
      const project = await Project.findById(req.params.projectId);
      const isManager = project?.manager?.toString() === currentUserId;
      const isLegacyMember = Array.isArray(project?.members) && project.members.some((memberId) => memberId?.toString() === currentUserId);

      if (project && (isManager || isLegacyMember)) {
        // Auto-fix: Create the missing membership
        membership = await Membership.create({
          userId: req.user._id,
          projectId: req.params.projectId,
          role: isManager ? 'Admin' : 'Member'
        });
      }
    }

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignee', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

app.post('/api/tasks', protect, async (req, res) => {
  try {
    const { title, description, status, priority, assignee, dueDate, projectId, labels, subtasks, blockers } = req.body;

    const globalRole = String(req.user?.role || '').trim().toLowerCase();
    if (globalRole === 'viewer') {
      return res.status(403).json({ message: 'Viewers cannot create tasks' });
    }

    // Check permissions
    const membership = await Membership.findOne({
      userId: req.user._id,
      projectId
    });
    if (!membership || !['Owner', 'Admin', 'Manager', 'SDE', 'Member'].includes(membership.role)) {
      return res.status(403).json({ message: 'Insufficient permissions to create tasks' });
    }

    // 1. Create the task
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      projectId,
      labels: labels || [],
      subtasks: subtasks || [],
      blockers: blockers || []
    });
    const savedTask = await newTask.save();

    // 2. Notification Logic 
    if (assignee && mongoose.Types.ObjectId.isValid(assignee)) {
      const notification = await Notification.create({
        userId: assignee,
        type: "TASK",
        message: `Task: "${title}" has been assigned to you.`,
        linkedProjectId: projectId
      });

      // Real-time emit
      io.to(String(assignee)).emit("new_notification", notification);
    }

    // 3. Activity log
    const activity = new ActivityLog({
      projectId,
      userId: req.user._id,
      userName: req.user.name,
      action: `Created task "${title}"`,
      entityType: 'task',
      entityId: savedTask._id
    });
    const savedActivity = await activity.save();

    // Emit to room
    io.to(projectId).emit("receive_activity", savedActivity);

    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Task Creation Error:", err);
    res.status(400).json({ message: "Error creating task" });
  }
});

app.patch('/api/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    const membership = await Membership.findOne({
      userId: req.user._id,
      projectId: task.projectId
    });
    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    const canEdit = ['Owner', 'Admin', 'Manager', 'SDE'].includes(membership.role) ||
      (membership.role === 'Contributor' && task.assignee?.toString() === req.user._id.toString());

    if (!canEdit) {
      return res.status(403).json({ message: 'Insufficient permissions to edit this task' });
    }

    const oldTask = { ...task.toObject() };
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Activity log for changes
    const changes = [];
    if (oldTask.status !== updatedTask.status) changes.push(`status from ${oldTask.status} to ${updatedTask.status}`);
    if (oldTask.assignee?.toString() !== updatedTask.assignee?.toString()) changes.push('assignee changed');
    if (oldTask.priority !== updatedTask.priority) changes.push(`priority from ${oldTask.priority} to ${updatedTask.priority}`);

    if (changes.length > 0) {
      const activity = new ActivityLog({
        projectId: task.projectId,
        userId: req.user._id,
        userName: req.user.name,
        action: `Updated task "${updatedTask.title}"`,
        entityType: 'task',
        entityId: updatedTask._id,
        details: { old: oldTask, new: updatedTask, changes }
      });
      const savedActivity = await activity.save();
      io.to(task.projectId).emit("receive_activity", savedActivity);
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: "Error updating task" });
  }
});

app.delete('/api/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    const membership = await Membership.findOne({
      userId: req.user._id,
      projectId: task.projectId
    });
    if (!membership || !['Owner', 'Admin', 'Manager', 'SDE'].includes(membership.role)) {
      return res.status(403).json({ message: 'Insufficient permissions to delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Activity log
    const activity = new ActivityLog({
      projectId: task.projectId,
      userId: req.user._id,
      userName: req.user.name,
      action: `Deleted task "${task.title}"`,
      entityType: 'task',
      entityId: req.params.id
    });
    const savedActivity = await activity.save();
    io.to(task.projectId).emit("receive_activity", savedActivity);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task" });
  }
});


// --- DATABASE & SERVER START ---
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB error:", err.message));
