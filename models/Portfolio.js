const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    targetRole: {
        type: String,
        required: [true, 'Target role is required'],
        trim: true
    },
    bio: {
        type: String,
        default: ''
    },
    contact: {
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' }
    },
    skills: [
        {
            category: { type: String, default: '' },
            items: { type: String, default: '' }
        }
    ],
    projects: [
        {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            tags: { type: String, default: '' },
            githubLink: { type: String, default: '' },
            liveLink: { type: String, default: '' }
        }
    ],
    experience: [
        {
            role: { type: String, default: '' },
            company: { type: String, default: '' },
            duration: { type: String, default: '' },
            description: { type: String, default: '' }
        }
    ],
    theme: {
        type: String,
        default: 'indigo'
    },
    font: {
        type: String,
        default: 'Inter'
    },
    template: {
        type: String,
        default: 'glassmorphic'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt on save
PortfolioSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
