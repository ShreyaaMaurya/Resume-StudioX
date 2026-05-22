const express = require('express');
const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// @route   POST /api/contact
// @desc    Contact form submission
// @access  Public
router.post('/contact', async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email' });
        }

        if (subject.trim().length < 5) {
            return res.status(400).json({ error: 'Subject must be at least 5 characters' });
        }

        if (message.trim().length < 10) {
            return res.status(400).json({ error: 'Message must be at least 10 characters' });
        }

        // In production, send email using nodemailer
        // For now, just log and acknowledge
        console.log(`[CONTACT FORM] Name: ${name}, Email: ${email}, Subject: ${subject}`);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully. We will get back to you soon.',
            submission: {
                name,
                email,
                subject,
                submittedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/stats
// @desc    Get server statistics
// @access  Public
router.get('/stats', async (req, res, next) => {
    try {
        const User = require('../models/User');
        const Resume = require('../models/Resume');
        const CoverLetter = require('../models/CoverLetter');

        const userCount = await User.countDocuments();
        const resumeCount = await Resume.countDocuments();
        const coverLetterCount = await CoverLetter.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                totalUsers: userCount,
                totalResumes: resumeCount,
                totalCoverLetters: coverLetterCount,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/version
// @desc    Get API version
// @access  Public
router.get('/version', (req, res) => {
    res.status(200).json({
        success: true,
        version: '1.0.0',
        name: 'ResumeBuilder API',
        description: 'Comprehensive Resume and Cover Letter Builder API',
        endpoints: {
            auth: [
                'POST /api/auth/register',
                'POST /api/auth/login',
                'POST /api/auth/refresh',
                'POST /api/auth/logout',
                'POST /api/auth/forgot-password',
                'POST /api/auth/reset-password/:token',
                'GET /api/auth/me',
                'PUT /api/auth/update-profile',
                'POST /api/auth/change-password'
            ],
            resume: [
                'POST /api/resume',
                'GET /api/resume',
                'GET /api/resume/:id',
                'PUT /api/resume/:id',
                'DELETE /api/resume/:id',
                'PUT /api/resume/:id/auto-save',
                'PUT /api/resume/:id/publish',
                'POST /api/resume/generate-ai'
            ],
            coverLetter: [
                'POST /api/cover-letter',
                'GET /api/cover-letter',
                'GET /api/cover-letter/:id',
                'PUT /api/cover-letter/:id',
                'DELETE /api/cover-letter/:id',
                'PUT /api/cover-letter/:id/link-resume/:resumeId'
            ],
            utility: [
                'GET /api/health',
                'POST /api/contact',
                'GET /api/stats',
                'GET /api/version'
            ]
        }
    });
});

module.exports = router;
