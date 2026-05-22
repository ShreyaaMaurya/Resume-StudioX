# ⚡ GEMINI AI SETUP - COMPLETE TROUBLESHOOTING GUIDE

## THE PROBLEM

Your Gemini AI is not generating results because **the SDK is not installed**.

---

## THE SOLUTION (3 SIMPLE STEPS)

### STEP 1️⃣ : Install the Gemini SDK

Open Command Prompt or PowerShell and run:

```bash
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
npm install
```

**Wait for it to complete.** This installs:

- ✅ @google/generative-ai (Gemini SDK)
- ✅ All other dependencies

---

### STEP 2️⃣ : Verify Everything Works

Run the diagnostic:

```bash
node test-gemini-setup.js
```

**You should see:**

```
✅ GEMINI_API_KEY found: AIzaSyC...
✅ @google/generative-ai is in package.json
✅ Successfully imported @google/generative-ai
✅ Gemini client initialized successfully
✅ Model gemini-pro is accessible
✅ API call successful!

📝 Response from Gemini:
   Hello from Gemini!

✅ ALL CHECKS PASSED! Gemini AI is ready!
```

---

### STEP 3️⃣ : Start the Server and Test

**Terminal 1: Start the server**

```bash
npm run dev
```

Should show:

```
listening on port 5000
```

**Terminal 2: Test the API**

```bash
node test-ai-endpoint.js
```

Should show:

```
✅ SUCCESS! Gemini AI is working!

📄 Summary from Gemini:
---
[AI-generated summary of resume]
---
```

---

## WHAT CHANGED

I've set up everything for you:

1. **GeminiService.js** - Core AI engine with methods for:
   - Resume summarization
   - Cover letter generation
   - Resume improvement suggestions
   - Skills analysis
   - Job matching

2. **aiRoutes.js** - 5 API endpoints:
   - `POST /api/ai/summarize-resume`
   - `POST /api/ai/generate-cover-letter`
   - `POST /api/ai/resume-suggestions`
   - `POST /api/ai/skills-suggestions`
   - `POST /api/ai/optimize-for-job`

3. **.env** - Already has your API key configured

4. **package.json** - Now includes @google/generative-ai

5. **server.js** - Updated to include AI routes

6. **Test Scripts:**
   - `test-gemini-setup.js` - Validates everything
   - `test-ai-endpoint.js` - Tests the API
   - `test-ai-api.bat` - Windows batch test

---

## IF IT'S STILL NOT WORKING

### Error: "Module not found @google/generative-ai"

```bash
npm install @google/generative-ai
```

### Error: "GEMINI_API_KEY is not defined"

Open `.env` and verify:

```
GEMINI_API_KEY=AIzaSyC65-y2ji4tcp4dt6qDuTpwhq7irkLhG_Q
```

### Error: "PERMISSION_DENIED" or "API key invalid"

1. Go to: https://makersuite.google.com/app/apikeys
2. Delete the old key
3. Generate a new one
4. Update `.env` with new key
5. Restart server

### Error: "Cannot POST /api/ai/summarize-resume"

Make sure:

1. Server is running: `npm run dev` ✅
2. You're using the correct URL: `http://localhost:5000/...` ✅
3. Content-Type header is set to `application/json` ✅

### Port 5000 already in use

Change port in `.env`:

```
PORT=5001
```

Then start: `npm run dev`

---

## COMPLETE FILE STRUCTURE

```
ResumeBuilder/
├── .env (has your API key)
├── package.json (includes @google/generative-ai)
├── server.js (updated with AI routes)
├── models/
│   └── GeminiService.js (AI engine)
├── routes/
│   ├── aiRoutes.js (5 new endpoints)
│   ├── authRoutes.js
│   ├── resumeRoutes.js
│   └── coverLetterRoutes.js
├── test-gemini-setup.js (diagnostic)
├── test-ai-endpoint.js (endpoint test)
└── QUICK_FIX_GEMINI.md (this file)
```

---

## API EXAMPLES

### 1. Summarize Resume

```bash
curl -X POST http://localhost:5000/api/ai/summarize-resume \
  -H "Content-Type: application/json" \
  -d "{\"resumeText\": \"John Doe, Software Engineer with 5 years experience\"}"
```

### 2. Generate Cover Letter

```bash
curl -X POST http://localhost:5000/api/ai/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d "{
    \"resumeData\": \"John Doe...\",
    \"jobDescription\": \"We are looking for...\",
    \"companyName\": \"Google\"
  }"
```

### 3. Resume Suggestions

```bash
curl -X POST http://localhost:5000/api/ai/resume-suggestions \
  -H "Content-Type: application/json" \
  -d "{\"resumeText\": \"John Doe...\"}"
```

### 4. Skills Suggestions

```bash
curl -X POST http://localhost:5000/api/ai/skills-suggestions \
  -H "Content-Type: application/json" \
  -d "{
    \"currentSkills\": \"JavaScript, React\",
    \"targetRole\": \"Senior Frontend Developer\"
  }"
```

### 5. Optimize for Job

```bash
curl -X POST http://localhost:5000/api/ai/optimize-for-job \
  -H "Content-Type: application/json" \
  -d "{
    \"resumeText\": \"John Doe...\",
    \"jobDescription\": \"We are looking for...\"
  }"
```

---

## 🎯 SUCCESS CHECKLIST

Before you do anything else, verify:

- [ ] Ran `npm install` without errors
- [ ] `node test-gemini-setup.js` shows ✅ all checks
- [ ] Server starts with `npm run dev`
- [ ] `curl http://localhost:5000/api/health` returns OK
- [ ] `node test-ai-endpoint.js` shows AI response

Once all are ✅, your AI is working! 🚀

---

## 📞 NEXT STEPS

1. **Make API calls** from your frontend to `/api/ai/...` endpoints
2. **Display results** in your React/HTML pages
3. **Add error handling** for when AI is processing
4. **Cache responses** to avoid redundant API calls

---

## 🔐 SECURITY REMINDER

✅ **Good:** API key is in `.env` (not in code)
⚠️ **Important:**

- Don't expose `.env` file publicly
- Don't commit `.env` to git
- If you shared your API key, regenerate it immediately
- Check `.gitignore` includes `.env`

Your API key has been exposed in this chat. Please regenerate it at:
https://makersuite.google.com/app/apikeys

---

**You're all set! Run these commands:**

```bash
npm install
node test-gemini-setup.js
npm run dev
```

Then test with:

```bash
node test-ai-endpoint.js
```

Happy coding! 🎉
