const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, 
    title: { type: String, required: true },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['Todo', 'In Progress', 'Done'], 
        default: 'Todo' 
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Medium' 
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    labels: [String], // Array of label strings
    subtasks: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }],
    blockers: [String], // Array of blocker descriptions
    tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);