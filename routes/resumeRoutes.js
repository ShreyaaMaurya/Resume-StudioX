const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { protect } = require('../middleware/auth');
const { validateResumeData } = require('../middleware/validation');
const { simulateAIExtension, generateATSKeywords, checkATSScore } = require('../middleware/aiEngine');

// @route   POST /api/resume/generate-ai
// @desc    Generate resume content using AI
// @access  Private
router.post('/generate-ai', protect, simulateAIExtension, (req, res) => {
    res.status(200).json({
        success: true, // Allow client to mount fallback data successfully
        usedRealProvider: req.aiUsedRealProvider || false,
        hasConfiguredProvider: req.aiHasConfiguredProvider || false,
        aiProviderUsed: req.aiProviderUsed || null,
        aiProviderKeySource: req.aiProviderKeySource || null,
        aiProviderFailureCode: req.aiProviderFailureCode || null,
        aiProviderFailureReason: req.aiProviderFailureReason || null,
        data: req.aiGeneratedPayload
    });
});

// @route   POST /api/resume/ats-keywords
// @desc    Suggest high-value keywords for ATS optimization
// @access  Private
router.post('/ats-keywords', protect, generateATSKeywords);

// @route   POST /api/resume/check-ats
// @desc    Analyze resume data and calculate dynamic ATS scan compatibility
// @access  Private
router.post('/check-ats', protect, checkATSScore);

// @route   POST /api/resume
// @desc    Create a new resume
// @access  Private
router.post('/', protect, async (req, res, next) => {
    try {
        const validation = validateResumeData(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.errors.join(', ') });
        }

        const resume = new Resume({
            userId: req.user.id,
            ...req.body
        });

        const savedResume = await resume.save();
        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            resume: savedResume
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/resume
// @desc    Get all resumes for current user
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resumes.length,
            resumes
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/resume/:id
// @desc    Get a single resume by ID
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to access this resume' });
        }

        res.status(200).json({
            success: true,
            resume
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/resume/:id
// @desc    Update a resume
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        let resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this resume' });
        }

        const validation = validateResumeData(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.errors.join(', ') });
        }

        resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Resume updated successfully',
            resume
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/resume/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this resume' });
        }

        await Resume.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/resume/:id/auto-save
// @desc    Auto-save resume data
// @access  Private
router.put('/:id/auto-save', protect, async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this resume' });
        }

        resume.autoSaveData = req.body;
        resume.lastAutoSave = Date.now();
        await resume.save();

        res.status(200).json({
            success: true,
            message: 'Resume auto-saved successfully',
            lastAutoSave: resume.lastAutoSave
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/resume/:id/publish
// @desc    Publish/unpublish a resume
// @access  Private
router.put('/:id/publish', protect, async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to modify this resume' });
        }

        resume.isPublished = !resume.isPublished;
        await resume.save();

        res.status(200).json({
            success: true,
            message: `Resume ${resume.isPublished ? 'published' : 'unpublished'} successfully`,
            isPublished: resume.isPublished
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/resume/:id/template/:templateName
// @desc    Get resume with specific template
// @access  Private
router.get('/:id/template/:templateName', protect, async (req, res, next) => {
    try {
        const validTemplates = ['tmpl-walton', 'tmpl-modern', 'tmpl-minimal', 'tmpl-creative'];
        if (!validTemplates.includes(req.params.templateName)) {
            return res.status(400).json({ error: 'Invalid template name' });
        }

        let resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to access this resume' });
        }

        resume.templateFramework = req.params.templateName;
        await resume.save();

        res.status(200).json({
            success: true,
            message: `Template changed to ${req.params.templateName}`,
            resume
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
