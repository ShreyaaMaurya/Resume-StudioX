# 🚀 QUICK SETUP - Gemini AI for ResumeBuilder

## Problem: AI Not Working

Follow these steps in order:

---

## STEP 1: Install Dependencies (CRITICAL!)

```bash
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
npm install
```

**What this does:**

- Downloads all required packages from npm registry
- Installs `@google/generative-ai` (the Gemini SDK)
- Creates `node_modules` folder

**Time:** 2-3 minutes ⏳

---

## STEP 2: Verify Setup

```bash
node test-gemini-setup.js
```

**What this does:**

- ✅ Checks if .env file has API key
- ✅ Checks if dependencies are installed
- ✅ Tests connection to Gemini API
- ✅ Runs a test prompt

**Expected output:**

```
✅ ALL CHECKS PASSED! Gemini AI is ready!
```

**If it fails:** Read the error message - it will tell you exactly what's wrong!

---

## STEP 3: Start the Server

```bash
npm run dev
```

**What this does:**

- Starts Express server on http://localhost:5000
- Enables hot-reload with nodemon (auto-restarts on file changes)

**Expected output:**

```
[timestamp] GET /api/health
✅ Server running on port 5000
```

---

## STEP 4: Test the AI API

### Option A: Using curl (Windows PowerShell or Git Bash)

```bash
curl -X POST http://localhost:5000/api/ai/summarize-resume ^
  -H "Content-Type: application/json" ^
  -d "{\"resumeText\": \"John Doe, Software Engineer with 5 years experience\"}"
```

### Option B: Using the test script

```bash
node test-ai-endpoint.js
```

### Option C: Using Postman

1. POST to: `http://localhost:5000/api/ai/summarize-resume`
2. Body (JSON):

```json
{
  "resumeText": "John Doe\n\nSoftware Engineer with 5 years experience in full-stack development"
}
```

---

## Available Endpoints

### 1. Summarize Resume

```
POST /api/ai/summarize-resume
Body: { "resumeText": "..." }
```

### 2. Generate Cover Letter

```
POST /api/ai/generate-cover-letter
Body: {
  "resumeData": "...",
  "jobDescription": "...",
  "companyName": "..."
}
```

### 3. Resume Improvement Suggestions

```
POST /api/ai/resume-suggestions
Body: { "resumeText": "..." }
```

### 4. Skills Gap Analysis

```
POST /api/ai/skills-suggestions
Body: {
  "currentSkills": "JavaScript, React...",
  "targetRole": "Senior Developer"
}
```

### 5. Optimize for Job

```
POST /api/ai/optimize-for-job
Body: {
  "resumeText": "...",
  "jobDescription": "..."
}
```

---

## ❌ Common Issues & Fixes

### Issue: "Module not found: @google/generative-ai"

**Fix:**

```bash
npm install
```

The Gemini SDK wasn't installed. This command fixes it.

---

### Issue: "GEMINI_API_KEY is not defined"

**Fix:**

1. Open `.env` file
2. Check if `GEMINI_API_KEY=...` exists
3. If missing, add it:

```
GEMINI_API_KEY=AIzaSyC65-y2ji4tcp4dt6qDuTpwhq7irkLhG_Q
```

---

### Issue: "API key not found or invalid"

**Fix:**

1. Go to: https://makersuite.google.com/app/apikeys
2. Check if your key is still valid
3. If not, delete it and create a new one
4. Update `.env` with the new key

---

### Issue: "Error 503 - Gemini AI service is not available"

**Fix:** The API key or SDK is not properly initialized.

1. Check if you ran `npm install` ✅
2. Verify `.env` has your API key ✅
3. Run: `node test-gemini-setup.js` to see detailed error ✅

---

### Issue: Server won't start (Port already in use)

**Fix:**

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace 1234 with actual PID)
taskkill /PID 1234 /F

# Or change port in .env
PORT=5001
```

---

## 📋 Checklist Before Testing

- [ ] Ran `npm install`
- [ ] Verified API key in `.env`
- [ ] Ran `node test-gemini-setup.js` - all ✅
- [ ] Started server with `npm run dev`
- [ ] Server shows "running on port 5000"

---

## 🎯 Quick Verification

**Test if server is running:**

```bash
curl http://localhost:5000/api/health
```

**Expected response:**

```json
{
  "status": "OK",
  "message": "ResumeStudio X Backend is running smoothly",
  "version": "1.0.0"
}
```

---

## Need More Help?

1. **Check server logs** - Look for error messages in the terminal
2. **Run diagnostic** - `node test-gemini-setup.js` gives detailed info
3. **Check .env** - Verify all required variables are set
4. **Regenerate API key** - May have expired or been revoked

---

## 🎉 Success Indicators

✅ `npm install` completes without errors
✅ `node test-gemini-setup.js` shows all checks passed
✅ `npm run dev` starts server on port 5000
✅ `curl /api/health` returns status OK
✅ `curl /api/ai/summarize-resume` returns AI-generated summary

You're ready to go! 🚀
