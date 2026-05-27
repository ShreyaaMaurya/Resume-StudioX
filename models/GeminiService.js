const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro'
];

function normalizeApiKey(rawVal) {
  if (!rawVal || typeof rawVal !== 'string') {
    return null;
  }

  const trimmed = rawVal.trim();
  if (!trimmed) {
    return null;
  }

  if (
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === 'your_gemini_api_key_here' ||
    trimmed.includes('placeholder') ||
    trimmed.length <= 15
  ) {
    return null;
  }

  return trimmed;
}

class GeminiService {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    const normalizedKey = normalizeApiKey(apiKey);
    if (!normalizedKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables or request headers. Add it to your .env file or send x-gemini-key.');
    }

    this.apiKey = normalizedKey;
    this.client = new GoogleGenerativeAI(normalizedKey);
  }

  async generateText(prompt, maxTokens = 1000) {
    let lastError = null;

    for (const modelName of GEMINI_MODEL_FALLBACKS) {
      try {
        const model = this.client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens }
        });
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) {
          return text;
        }
      } catch (error) {
        lastError = error;
        const errorMessage = error?.message || String(error);
        const modelUnavailable = /not found|not available|404|model/i.test(errorMessage);

        if (!modelUnavailable) {
          console.error('Gemini API Error:', error);

          if (errorMessage.includes('API key')) {
            throw new Error('Invalid or missing API key. Check your GEMINI_API_KEY or x-gemini-key.');
          }
          if (errorMessage.includes('PERMISSION_DENIED')) {
            throw new Error('Permission denied. Enable Gemini API at https://console.cloud.google.com/apis');
          }
          if (errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('API rate limit exceeded. Please try again later.');
          }

          throw new Error(`Gemini API Error: ${errorMessage}`);
        }
      }
    }

    throw new Error(`Gemini API Error: ${lastError?.message || 'No supported Gemini model responded.'}`);
  }

  async summarizeResume(resumeText) {
    const prompt = `Please provide a concise professional summary of the following resume. Keep it to 2-3 sentences:

${resumeText}

Summary:`;

    return this.generateText(prompt, 300);
  }

  async generateCoverLetter(resumeData, jobDescription, companyName) {
    const prompt = `Based on the following resume and job description, generate a professional cover letter for ${companyName}:

RESUME:
${resumeData}

JOB DESCRIPTION:
${jobDescription}

COMPANY NAME: ${companyName}

Please write a compelling cover letter that is professional, personalized, and highlights relevant skills and experience. Format it as a proper business letter.`;

    return this.generateText(prompt, 1500);
  }

  async improveSuggestions(resumeText) {
    const prompt = `Review the following resume and provide actionable improvement suggestions to make it more compelling and ATS-friendly:

${resumeText}

Please provide:
1. Strengths of the resume
2. Areas for improvement
3. Specific recommendations for each section
4. Keywords that could be added
5. Overall ATS compatibility score (1-10) with explanation

Format your response clearly with headers for each section.`;

    return this.generateText(prompt, 1500);
  }

  async generateSkillsSuggestions(currentSkills, targetRole) {
    const prompt = `I have the following skills: ${currentSkills}

I want to target this role: ${targetRole}

Please suggest:
1. Top 5 skills I should develop or improve
2. How to position my existing skills for this role
3. Recommended certifications or courses
4. How to demonstrate these skills in a resume`;

    return this.generateText(prompt, 1000);
  }

  async optimizeJobDescription(resumeText, jobDescription) {
    const prompt = `Match the provided resume against the job description and suggest optimizations:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please provide:
1. Key skills match percentage
2. Missing but important skills to highlight
3. Suggested resume improvements specific to this job
4. Recommended cover letter focus areas
5. Overall job fit score (1-10)`;

    return this.generateText(prompt, 1200);
  }
}

module.exports = GeminiService;
