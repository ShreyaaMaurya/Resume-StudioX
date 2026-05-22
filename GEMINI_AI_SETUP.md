# ResumeBuilder with Gemini AI - Setup Instructions

## 🚀 Quick Start

### Step 1: Install Gemini SDK
```bash
npm install @google/generative-ai
```

### Step 2: Verify API Key
Your `.env` file already has your Gemini API key configured. ✅

### Step 3: Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## 📡 AI API Endpoints

### 1. Summarize Resume
**POST** `/api/ai/summarize-resume`
```json
{
  "resumeText": "Your complete resume text here..."
}
```
**Response:** Professional 2-3 sentence summary

### 2. Generate Cover Letter
**POST** `/api/ai/generate-cover-letter`
```json
{
  "resumeData": "Your resume...",
  "jobDescription": "Job posting text...",
  "companyName": "Company Name"
}
```
**Response:** Full professional cover letter

### 3. Resume Improvement Suggestions
**POST** `/api/ai/resume-suggestions`
```json
{
  "resumeText": "Your complete resume text..."
}
```
**Response:** Detailed suggestions for improvement

### 4. Skills Gap Analysis
**POST** `/api/ai/skills-suggestions`
```json
{
  "currentSkills": "Python, JavaScript, SQL...",
  "targetRole": "Senior Software Engineer"
}
```
**Response:** Top 5 skills to develop + recommendations

### 5. Optimize Resume for Job
**POST** `/api/ai/optimize-for-job`
```json
{
  "resumeText": "Your resume...",
  "jobDescription": "Job posting..."
}
```
**Response:** Skills match %, fit score, and optimization tips

---

## 🔒 Security Notes

✅ **Done:**
- API key is in `.env` (not hardcoded)
- `.env` should NOT be committed to git (check `.gitignore`)

❌ **Important:**
- Never share your API key publicly
- If exposed, regenerate at: https://makersuite.google.com/app/apikeys
- Monitor API usage in Google Cloud Console

---

## ✅ Health Check

Test if everything is working:
```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "ResumeStudio X Backend is running smoothly",
  "version": "1.0.0"
}
```

---

## 🛠️ Troubleshooting

### Port 5000 already in use?
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env: PORT=5001
```

### Gemini API errors?
1. Verify `GEMINI_API_KEY` in `.env`
2. Check if `@google/generative-ai` is installed: `npm list @google/generative-ai`
3. Verify API key is active at: https://makersuite.google.com/app/apikeys

### Module not found errors?
Run: `npm install`

---

## 📊 What's Included

✅ Resume summarization
✅ Professional cover letter generation
✅ Resume improvement suggestions
✅ Skills gap analysis
✅ Job description matching
✅ ATS compatibility scoring

All powered by **Google Gemini AI**!
