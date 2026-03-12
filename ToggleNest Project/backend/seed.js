const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Membership = require('./models/Membership');
const Message = require('./models/Message');
const ActivityLog = require('./models/ActivityLog');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected for seeding...");

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Membership.deleteMany({});
        await Message.deleteMany({});
        await ActivityLog.deleteMany({});

        // Create sample users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = await User.create([
            { name: 'Alice Johnson', email: 'alice@example.com', password: hashedPassword, role: 'Admin', title: 'Product Manager' },
            { name: 'Bob Smith', email: 'bob@example.com', password: hashedPassword, role: 'Member', title: 'Frontend Developer' },
            { name: 'Charlie Brown', email: 'charlie@example.com', password: hashedPassword, role: 'Member', title: 'Backend Developer' },
            { name: 'Diana Prince', email: 'diana@example.com', password: hashedPassword, role: 'Viewer', title: 'QA Analyst' },
            { name: 'Eve Wilson', email: 'eve@example.com', password: hashedPassword, role: 'Viewer', title: 'UI/UX Designer' }
        ]);

        console.log('Created users:', users.length);

        // Create sample projects
        const projects = await Project.create([
            {
                name: 'ToggleNest Web App',
                description: 'Main project for building the ToggleNest platform',
                status: 'Active',
                priority: 'High',
                deadline: '2026-03-01',
                progress: 65,
                projectCode: 'TN2025',
                gitLink: 'https://github.com/example/togglenest',
                attachments: [],
                manager: users[0]._id,
                managerName: users[0].name,
                members: [users[0]._id, users[1]._id, users[2]._id],
                defaultRole: 'Contributor'
            },
            {
                name: 'Mobile App Development',
                description: 'React Native mobile application',
                status: 'Planning',
                priority: 'Medium',
                deadline: '2026-06-01',
                progress: 20,
                projectCode: 'MOBILE2025',
                gitLink: 'https://github.com/example/mobile-app',
                attachments: [],
                manager: users[1]._id,
                managerName: users[1].name,
                members: [users[1]._id, users[3]._id],
                defaultRole: 'Contributor'
            }
        ]);

        console.log('Created projects:', projects.length);

        // Create memberships
        const memberships = [
            // Project 1 memberships
            { userId: users[0]._id, projectId: projects[0]._id, role: 'Owner' },
            { userId: users[1]._id, projectId: projects[0]._id, role: 'Admin' },
            { userId: users[2]._id, projectId: projects[0]._id, role: 'SDE' },
            { userId: users[3]._id, projectId: projects[0]._id, role: 'Contributor' },

            // Project 2 memberships
            { userId: users[1]._id, projectId: projects[1]._id, role: 'Owner' },
            { userId: users[3]._id, projectId: projects[1]._id, role: 'SDE' },
            { userId: users[4]._id, projectId: projects[1]._id, role: 'Viewer' }
        ];

        await Membership.create(memberships);
        console.log('Created memberships:', memberships.length);

        // Create sample tasks for first project
        const tasks = await Task.create([
            {
                projectId: projects[0]._id,
                title: 'Setup project structure',
                description: 'Initialize MERN stack with proper folder structure',
                status: 'Done',
                priority: 'High',
                assignee: users[2]._id,
                dueDate: new Date('2025-02-01'),
                labels: ['setup', 'backend'],
                subtasks: [
                    { title: 'Create backend folder', completed: true },
                    { title: 'Setup Express server', completed: true },
                    { title: 'Configure MongoDB', completed: true }
                ],
                blockers: []
            },
            {
                projectId: projects[0]._id,
                title: 'Implement authentication',
                description: 'JWT-based login and registration system',
                status: 'Done',
                priority: 'High',
                assignee: users[2]._id,
                dueDate: new Date('2025-02-15'),
                labels: ['auth', 'security'],
                subtasks: [
                    { title: 'Create User model', completed: true },
                    { title: 'Implement register endpoint', completed: true },
                    { title: 'Implement login endpoint', completed: true }
                ],
                blockers: []
            },
            {
                projectId: projects[0]._id,
                title: 'Build Kanban board',
                description: 'Drag and drop Kanban board with real-time updates',
                status: 'In Progress',
                priority: 'High',
                assignee: users[3]._id,
                dueDate: new Date('2025-03-01'),
                labels: ['frontend', 'kanban'],
                subtasks: [
                    { title: 'Create board component', completed: true },
                    { title: 'Implement drag and drop', completed: false },
                    { title: 'Add real-time sync', completed: false }
                ],
                blockers: ['Waiting for backend API completion']
            },
            {
                projectId: projects[0]._id,
                title: 'Design dashboard',
                description: 'Create responsive dashboard with charts',
                status: 'Todo',
                priority: 'Medium',
                assignee: users[0]._id,
                dueDate: new Date('2025-03-15'),
                labels: ['frontend', 'ui'],
                subtasks: [
                    { title: 'Create chart components', completed: false },
                    { title: 'Implement project cards', completed: false },
                    { title: 'Add responsive layout', completed: false }
                ],
                blockers: []
            },
            {
                projectId: projects[0]._id,
                title: 'Setup chat system',
                description: 'Real-time chat with mentions and reactions',
                status: 'Todo',
                priority: 'Medium',
                assignee: users[1]._id,
                dueDate: new Date('2025-04-01'),
                labels: ['chat', 'realtime'],
                subtasks: [
                    { title: 'Create Message model', completed: false },
                    { title: 'Implement Socket.io events', completed: false },
                    { title: 'Add mention functionality', completed: false }
                ],
                blockers: []
            }
        ]);

        console.log('Created tasks:', tasks.length);

        // Create sample messages
        const messages = await Message.create([
            {
                projectId: projects[0]._id,
                sender: users[0]._id,
                message: 'Welcome to the ToggleNest project! Let\'s build something amazing.',
                mentions: [],
                reactions: []
            },
            {
                projectId: projects[0]._id,
                sender: users[2]._id,
                message: 'Thanks! I\'ve completed the initial setup. Ready for the next tasks.',
                mentions: [users[0]._id],
                reactions: []
            },
            {
                projectId: projects[0]._id,
                sender: users[1]._id,
                message: 'Great work @Charlie! The authentication system looks solid.',
                mentions: [users[2]._id],
                reactions: []
            }
        ]);

        console.log('Created messages:', messages.length);

        // Create sample activity logs
        const activities = await ActivityLog.create([
            {
                projectId: projects[0]._id,
                userId: users[0]._id,
                userName: users[0].name,
                action: 'Project created',
                entityType: 'project',
                entityId: projects[0]._id
            },
            {
                projectId: projects[0]._id,
                userId: users[2]._id,
                userName: users[2].name,
                action: 'Created task "Setup project structure"',
                entityType: 'task',
                entityId: tasks[0]._id
            },
            {
                projectId: projects[0]._id,
                userId: users[2]._id,
                userName: users[2].name,
                action: 'Updated task "Setup project structure": status from Todo to Done',
                entityType: 'task',
                entityId: tasks[0]._id,
                details: { old: { status: 'Todo' }, new: { status: 'Done' } }
            },
            {
                projectId: projects[0]._id,
                userId: users[0]._id,
                userName: users[0].name,
                action: 'Added Bob Smith as Admin',
                entityType: 'member',
                entityId: memberships[1]._id
            }
        ]);

        console.log('Created activity logs:', activities.length);

        console.log("✅ Database seeded successfully!");
        console.log("\nSample login credentials:");
        console.log("Email: alice@example.com, Password: password123 (Owner)");
        console.log("Email: bob@example.com, Password: password123 (Admin)");
        console.log("Email: charlie@example.com, Password: password123 (SDE)");
        console.log("Email: diana@example.com, Password: password123 (Contributor)");
        console.log("Email: eve@example.com, Password: password123 (Viewer)");

        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();