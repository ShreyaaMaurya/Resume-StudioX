// Email validation
const validateEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

// Password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
const validatePassword = (password) => {
    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one number' };
    }
    return { valid: true };
};

// Resume data validation
const validateResumeData = (data) => {
    const errors = [];
    
    if (!data.fullName || data.fullName.trim() === '') {
        errors.push('Full name is required');
    }
    if (!data.targetRole || data.targetRole.trim() === '') {
        errors.push('Target role is required');
    }
    if (!data.email || !validateEmail(data.email)) {
        errors.push('Valid email is required');
    }
    if (!data.blocksData || !Array.isArray(data.blocksData)) {
        errors.push('Resume blocks data must be an array');
    }

    return { valid: errors.length === 0, errors };
};

// Cover letter data validation
const validateCoverLetterData = (data) => {
    const errors = [];

    if (!data.recipientName || data.recipientName.trim() === '') {
        errors.push('Recipient name is required');
    }
    if (!data.company || data.company.trim() === '') {
        errors.push('Company name is required');
    }
    if (!data.jobTitle || data.jobTitle.trim() === '') {
        errors.push('Job title is required');
    }
    if (!data.opening || data.opening.trim() === '') {
        errors.push('Opening paragraph is required');
    }
    if (!data.body || data.body.trim() === '') {
        errors.push('Body content is required');
    }
    if (!data.closing || data.closing.trim() === '') {
        errors.push('Closing paragraph is required');
    }

    return { valid: errors.length === 0, errors };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateResumeData,
    validateCoverLetterData
};
