const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { validateEmail, validatePassword } = require('../middleware/validation');
const { protect, generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res, next) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        // Validation
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Please provide a valid email' });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create user
        user = new User({
            fullName: fullName.trim(),
            email: email.toLowerCase(),
            password
        });

        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Please provide a valid email' });
        }

        // Check for user
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        // Check if refresh token exists in database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
        if (!tokenExists) {
            return res.status(401).json({ error: 'Refresh token not found' });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (remove refresh token)
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // Remove refresh token from database
        req.user.refreshTokens = req.user.refreshTokens.filter(rt => rt.token !== refreshToken);
        await req.user.save();

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Please provide an email' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

        await user.save();

        // In a production environment, send email with reset token
        // For now, we return the token (not recommended for production)
        res.status(200).json({
            success: true,
            message: 'Password reset token sent to email',
            resetToken // Remove this in production
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/reset-password/:resetToken
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:resetToken', async (req, res, next) => {
    try {
        const { password, confirmPassword } = req.body;
        const resetToken = req.params.resetToken;

        if (!password || !confirmPassword) {
            return res.status(400).json({ error: 'Please provide password and confirm password' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Hash the reset token to find user
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.refreshTokens = []; // Invalidate all refresh tokens

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res, next) => {
    try {
        const { fullName, phoneNumber, profileImage } = req.body;

        const user = await User.findById(req.user.id);

        if (fullName) {
            user.fullName = fullName.trim();
        }
        if (phoneNumber) {
            user.phoneNumber = phoneNumber.trim();
        }
        if (profileImage) {
            user.profileImage = profileImage;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/change-password
// @desc    Change password for logged in user
// @access  Private
router.post('/change-password', protect, async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'Please provide all password fields' });
        }

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        user.password = newPassword;
        user.refreshTokens = []; // Invalidate all refresh tokens
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
