const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables. Add it to your .env file.');
    }
    if (apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY is set to placeholder. Please set a real API key in .env');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt, maxTokens = 1000) {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      if (error.message.includes('API key')) {
        throw new Error('Invalid or missing API key. Check your GEMINI_API_KEY in .env');
      }
      if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Permission denied. Enable Gemini API at https://console.cloud.google.com/apis');
      }
      if (error.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Gemini API Error: ${error.message}`);
    }
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
