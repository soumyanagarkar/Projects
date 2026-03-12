const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['Active', 'In Progress', 'Planning', 'Complete', 'On Hold'],
        default: 'Planning'
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    deadline: { type: String },
    progress: { type: Number, default: 0 },
    projectCode: { type: String, unique: true }, // Auto-generated unique code for joining
    projectKey: { type: String, unique: true, sparse: true }, // Human-readable project key (e.g., PROJ)
    gitLink: { type: String },
    attachments: [{ type: String }], // Array of file URLs or paths
    relatedLinks: [{ type: String }], // Array of related links (docs, designs, etc.)
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs
    defaultRole: { type: String, enum: ['Member', 'Viewer'], default: 'Member' }, // Default role for joins
    // FIX: Reference the User model
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managerName: { type: String } // Optional: Store name for easy display
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);