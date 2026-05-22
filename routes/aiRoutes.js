const express = require('express');
const router = express.Router();

// Import GeminiService
let GeminiService;
let serviceError = null;

try {
  GeminiService = require('../models/GeminiService');
} catch (e) {
  serviceError = e;
  console.error('⚠️  GeminiService import failed:', e.message);
  console.error('Make sure to run: npm install @google/generative-ai');
}

// Initialize Gemini Service
let geminiService;
try {
  if (GeminiService) {
    geminiService = new GeminiService();
    console.log('✅ Gemini Service initialized successfully');
  }
} catch (e) {
  serviceError = e;
  console.error('⚠️  Gemini Service initialization failed:', e.message);
}

// Middleware to check if Gemini is available
const checkGemini = (req, res, next) => {
  if (!geminiService || serviceError) {
    return res.status(503).json({ 
      error: 'Gemini AI service is not available',
      details: serviceError ? serviceError.message : 'Service not initialized',
      solution: 'Run: npm install @google/generative-ai'
    });
  }
  next();
};

// 1. Summarize Resume
router.post('/summarize-resume', checkGemini, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const summary = await geminiService.summarizeResume(resumeText);
    res.json({ summary });
  } catch (error) {
    console.error('Resume summarization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Generate Cover Letter
router.post('/generate-cover-letter', checkGemini, async (req, res) => {
  try {
    const { resumeData, jobDescription, companyName } = req.body;
    
    if (!resumeData || !jobDescription || !companyName) {
      return res.status(400).json({ 
        error: 'resumeData, jobDescription, and companyName are required' 
      });
    }

    const coverLetter = await geminiService.generateCoverLetter(
      resumeData, 
      jobDescription, 
      companyName
    );
    res.json({ coverLetter });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get Resume Improvement Suggestions
router.post('/resume-suggestions', checkGemini, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const suggestions = await geminiService.improveSuggestions(resumeText);
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Get Skills Suggestions
router.post('/skills-suggestions', checkGemini, async (req, res) => {
  try {
    const { currentSkills, targetRole } = req.body;
    
    if (!currentSkills || !targetRole) {
      return res.status(400).json({ 
        error: 'currentSkills and targetRole are required' 
      });
    }

    const suggestions = await geminiService.generateSkillsSuggestions(
      currentSkills, 
      targetRole
    );
    res.json({ suggestions });
  } catch (error) {
    console.error('Skills suggestions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Optimize Resume for Job Description
router.post('/optimize-for-job', checkGemini, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ 
        error: 'resumeText and jobDescription are required' 
      });
    }

    const optimization = await geminiService.optimizeJobDescription(
      resumeText, 
      jobDescription
    );
    res.json({ optimization });
  } catch (error) {
    console.error('Job optimization error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
