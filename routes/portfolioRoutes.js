const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');
const { generatePortfolioData } = require('../middleware/aiEngine');

// @route   GET /api/portfolio
// @desc    Get portfolio data for the logged-in user
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.user.id });
        
        if (!portfolio) {
            // Return empty layout draft rather than failing to keep workstation happy
            return res.status(200).json({
                success: true,
                message: 'No portfolio configuration found. Ready to draft.',
                portfolio: null
            });
        }

        res.status(200).json({
            success: true,
            portfolio
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/portfolio
// @desc    Create or update portfolio data for the logged-in user
// @access  Private
router.post('/', protect, async (req, res, next) => {
    try {
        const { fullName, targetRole } = req.body;

        if (!fullName || !targetRole) {
            return res.status(400).json({ error: 'Full name and target role are required' });
        }

        // Search and upsert user portfolio data
        let portfolio = await Portfolio.findOne({ userId: req.user.id });

        if (portfolio) {
            portfolio = await Portfolio.findOneAndUpdate(
                { userId: req.user.id },
                { ...req.body, updatedAt: Date.now() },
                { new: true, runValidators: true }
            );
        } else {
            portfolio = new Portfolio({
                userId: req.user.id,
                ...req.body
            });
            await portfolio.save();
        }

        res.status(200).json({
            success: true,
            message: 'Portfolio configurations saved and synced successfully.',
            portfolio
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/portfolio/generate
// @desc    Synthesize portfolio layout blueprint using AI engine
// @access  Private
router.post('/generate', protect, generatePortfolioData, (req, res) => {
    res.status(200).json({
        success: true, // Allow client to mount fallback data successfully
        usedRealProvider: req.aiUsedRealProvider || false,
        hasConfiguredProvider: req.aiHasConfiguredProvider || false,
        aiProviderUsed: req.aiProviderUsed || null,
        aiProviderKeySource: req.aiProviderKeySource || null,
        aiProviderFailureCode: req.aiProviderFailureCode || null,
        aiProviderFailureReason: req.aiProviderFailureReason || null,
        message: req.aiUsedRealProvider 
            ? 'Portfolio synthesized successfully by AI engine.' 
            : 'AI synthesis failed, fell back to template data.',
        data: req.aiGeneratedPortfolio
    });
});

module.exports = router;
