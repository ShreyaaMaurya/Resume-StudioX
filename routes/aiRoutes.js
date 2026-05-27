const express = require('express');
const router = express.Router();

const GeminiService = require('../models/GeminiService');

function getGeminiService(req) {
  const requestKey = req.headers['x-gemini-key'];

  try {
    return new GeminiService(requestKey || process.env.GEMINI_API_KEY);
  } catch (error) {
    console.error('⚠️  GeminiService initialization failed:', error.message);
    return null;
  }
}

// Middleware to check if Gemini is available
const checkGemini = (req, res, next) => {
  const geminiService = getGeminiService(req);

  if (!geminiService) {
    return res.status(503).json({ 
      error: 'Gemini AI service is not available',
      details: 'Provide x-gemini-key in the request or set GEMINI_API_KEY in .env',
      solution: 'Set a valid Gemini API key in the app settings or .env'
    });
  }

  req.geminiService = geminiService;
  next();
};

// 1. Summarize Resume
router.post('/summarize-resume', checkGemini, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const summary = await req.geminiService.summarizeResume(resumeText);
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

    const coverLetter = await req.geminiService.generateCoverLetter(
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

    const suggestions = await req.geminiService.improveSuggestions(resumeText);
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

    const suggestions = await req.geminiService.generateSkillsSuggestions(
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

    const optimization = await req.geminiService.optimizeJobDescription(
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
