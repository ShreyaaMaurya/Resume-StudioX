const mongoose = require('mongoose');

const CoverLetterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        default: null
    },
    recipientName: {
        type: String,
        required: [true, 'Recipient name is required'],
        trim: true
    },
    recipientTitle: {
        type: String,
        default: '',
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    companyAddress: {
        type: String,
        default: '',
        trim: true
    },
    jobTitle: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    jobId: {
        type: String,
        default: '',
        trim: true
    },
    opening: {
        type: String,
        required: [true, 'Opening paragraph is required']
    },
    body: {
        type: String,
        required: [true, 'Body content is required']
    },
    closing: {
        type: String,
        required: [true, 'Closing paragraph is required']
    },
    signature: {
        type: String,
        default: ''
    },
    template: {
        type: String,
        enum: ['professional', 'creative', 'minimalist'],
        default: 'professional'
    },
    status: {
        type: String,
        enum: ['draft', 'final'],
        default: 'draft'
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

module.exports = mongoose.model('CoverLetter', CoverLetterSchema);
