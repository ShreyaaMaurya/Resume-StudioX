const express = require('express');
const router = express.Router();
const CoverLetter = require('../models/CoverLetter');
const { protect } = require('../middleware/auth');
const { validateCoverLetterData } = require('../middleware/validation');

// @route   POST /api/cover-letter
// @desc    Create a new cover letter
// @access  Private
router.post('/', protect, async (req, res, next) => {
    try {
        const validation = validateCoverLetterData(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.errors.join(', ') });
        }

        const coverLetter = new CoverLetter({
            userId: req.user.id,
            ...req.body
        });

        const savedCoverLetter = await coverLetter.save();
        res.status(201).json({
            success: true,
            message: 'Cover letter created successfully',
            coverLetter: savedCoverLetter
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/cover-letter
// @desc    Get all cover letters for current user
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const coverLetters = await CoverLetter.find({ userId: req.user.id })
            .populate('resumeId', 'fullName targetRole')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: coverLetters.length,
            coverLetters
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/cover-letter/:id
// @desc    Get a single cover letter by ID
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const coverLetter = await CoverLetter.findById(req.params.id)
            .populate('userId', 'fullName email')
            .populate('resumeId', 'fullName targetRole');

        if (!coverLetter) {
            return res.status(404).json({ error: 'Cover letter not found' });
        }

        // Check ownership
        if (coverLetter.userId._id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to access this cover letter' });
        }

        res.status(200).json({
            success: true,
            coverLetter
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/cover-letter/:id
// @desc    Update a cover letter
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        let coverLetter = await CoverLetter.findById(req.params.id);

        if (!coverLetter) {
            return res.status(404).json({ error: 'Cover letter not found' });
        }

        // Check ownership
        if (coverLetter.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this cover letter' });
        }

        const validation = validateCoverLetterData(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.errors.join(', ') });
        }

        coverLetter = await CoverLetter.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Cover letter updated successfully',
            coverLetter
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/cover-letter/:id
// @desc    Delete a cover letter
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const coverLetter = await CoverLetter.findById(req.params.id);

        if (!coverLetter) {
            return res.status(404).json({ error: 'Cover letter not found' });
        }

        // Check ownership
        if (coverLetter.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this cover letter' });
        }

        await CoverLetter.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Cover letter deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/cover-letter/:id/link-resume/:resumeId
// @desc    Link a resume to a cover letter
// @access  Private
router.put('/:id/link-resume/:resumeId', protect, async (req, res, next) => {
    try {
        const coverLetter = await CoverLetter.findById(req.params.id);

        if (!coverLetter) {
            return res.status(404).json({ error: 'Cover letter not found' });
        }

        // Check ownership
        if (coverLetter.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to modify this cover letter' });
        }

        coverLetter.resumeId = req.params.resumeId;
        await coverLetter.save();

        const updated = await coverLetter.populate('resumeId', 'fullName targetRole');

        res.status(200).json({
            success: true,
            message: 'Resume linked to cover letter successfully',
            coverLetter: updated
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/cover-letter/resume/:resumeId
// @desc    Get all cover letters for a specific resume
// @access  Private
router.get('/resume/:resumeId', protect, async (req, res, next) => {
    try {
        const coverLetters = await CoverLetter.find({
            userId: req.user.id,
            resumeId: req.params.resumeId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: coverLetters.length,
            coverLetters
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
