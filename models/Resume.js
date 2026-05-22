const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
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
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    contactLine: {
        type: String,
        default: ''
    },
    templateFramework: {
        type: String,
        enum: [
            'tmpl-walton',
            'tmpl-walton-nophoto',
            'tmpl-classic',
            'tmpl-tech',
            'tmpl-ats-clean',
            'tmpl-ats-executive',
            'tmpl-ats-modern',
            'tmpl-ats-compact'
        ],
        default: 'tmpl-walton'
    },
    blocksData: [
        {
            blockType: {
                type: String,
                enum: ['summary', 'experience', 'skills', 'education', 'certification', 'project', 'award'],
                required: true
            },
            val1: { type: String, default: '' },
            val2: { type: String, default: '' },
            bullets: { type: String, default: '' }
        }
    ],
    isPublished: {
        type: Boolean,
        default: false
    },
    autoSaveData: {
        type: Object,
        default: null
    },
    lastAutoSave: {
        type: Date,
        default: null
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
ResumeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Resume', ResumeSchema);