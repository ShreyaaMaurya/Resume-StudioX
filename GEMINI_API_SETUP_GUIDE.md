# 🔑 Setting Up Your Gemini API Key Correctly

## The Problem You Were Experiencing

Your AI generation was falling back to **template/mock data** instead of calling Gemini API. This has been fixed in the code, but you need to:

1. **Configure your Gemini API Key** in the application
2. **Ensure it has multimodal vision enabled**
3. **Test that it's actually being used**

---

## Step-by-Step: Configure Gemini API

### Step 1: Start Your Server

```bash
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
npm run dev
```

Server will run on: http://localhost:5000

### Step 2: Open Resume Page

Go to: http://localhost:5000/Resume.html

### Step 3: Click Settings

- Look for **Settings** button in top navigation bar
- It's usually a gear icon ⚙️

### Step 4: Enter Your Gemini API Key

Your API Key:

```
AIzaSyC65-y2ji4tcp4dt6qDuTpwhq7irkLhG_Q
```

**Paste this key** into the "Gemini API Key" field.

### Step 5: Save Settings

Click **Save** or **Apply**

The key is now stored in your browser's **localStorage**.

---

## Testing If It's Working

### Method 1: Using DevTools Console

1. Open Browser DevTools: **F12**
2. Go to **Console** tab
3. Click **"Generate from AI"** button
4. Look for these messages:

✅ **GOOD - You should see:**

```
[AI Core] Attempting Gemini multimodal for image...
[AI Core] ✅ Gemini multimodal succeeded
```

❌ **BAD - You might see:**

```
[AI Core] NO API KEY CONFIGURED - Cannot process resume image
[AI Core] Gemini HTTP 403: Permission denied
[AI Core] Invalid image data - base64 string is empty
```

### Method 2: Check API Key in Browser

1. Open DevTools: **F12**
2. Go to **Application** tab
3. Click **Local Storage** on the left
4. Look for entry: `geminiApiKey`
5. It should show your full API key

---

## Common Issues & Fixes

### Issue 1: "No AI API Key Configured"

**Cause**: Key wasn't saved or browser cleared localStorage

**Fix**:

1. Go back to Settings
2. Re-enter API key:
   ```
   AIzaSyC65-y2ji4tcp4dt6qDuTpwhq7irkLhG_Q
   ```
3. Click Save
4. Hard refresh page: **Ctrl+F5**
5. Try again

### Issue 2: "HTTP 403: Permission denied"

**Cause**: API key doesn't have multimodal vision permissions enabled

**Fix**:

1. Go to: https://console.cloud.google.com/
2. Make sure you're using the right project
3. Enable these APIs:
   - **Generative Language API** (for Gemini)
   - Make sure "Gemini 1.5 Flash" model has vision enabled
4. Or create a new API key with full permissions:
   - https://ai.google.dev/tutorials/setup
5. Replace with new key in Settings

### Issue 3: "Invalid image data - base64 string is empty"

**Cause**: Image upload isn't working properly

**Fix**:

1. Make sure you're uploading a **real image** or **PDF**
2. File size should be < 10MB
3. Try uploading again
4. If issue persists, manually enter "Generate from AI" text instead

### Issue 4: Still showing template data?

**Cause**: Old code running or cache not cleared

**Fix**:

1. Kill server: **Ctrl+C**
2. Clear browser cache: **Ctrl+Shift+Delete**
   - Clear: Cookies, Cache, LocalStorage
3. Close browser completely
4. Restart server: `npm run dev`
5. Open browser fresh
6. Re-enter API key in Settings
7. Try again

---

## How the New Code Works

### Before (BROKEN):

```
User uploads image
  ↓
Try Gemini API
  ↓ (if fails)
Use hardcoded template data ❌ (this was the problem!)
```

### After (FIXED):

```
User uploads image
  ↓
Check if API key exists
  ├─ No key? → Show error "No API key configured" ✅
  └─ Has key? → Try Gemini API
     ├─ Success? → Use real AI data ✅
     └─ Fails? → Show error with details ✅
                 (Don't silently fall back to templates)
```

---

## What Each Feature Does

### "Generate from AI" Button

- Generates resume content based on **target role** (e.g., "Software Engineer")
- Calls Gemini text-only generation
- Returns: summary, experience, skills, education, certifications

### "Upload Resume" Feature

- Upload **image of resume** or **PDF file**
- Gemini **reads** the image and extracts text
- Converts to structured resume format
- Should show YOUR actual resume content, not templates

### Settings → Gemini API Key

- Where you enter your personal API key
- Stored in **localStorage** (browser)
- Sent with every API request as header: `x-gemini-key`
- If not set, falls back to server's `process.env.GEMINI_API_KEY`

---

## Files That Were Updated

These files now prevent the template fallback:

1. **middleware/aiEngine.js** (Lines 509-530)
   - Checks if API keys exist BEFORE falling back
   - Returns error if no keys configured
   - Only uses local templates if AI genuinely fails

2. **public/Resume.html**
   - Mobile responsive fixes (tested at 640px)
   - API key validation on client-side

3. **public/cover-letter.html** & **public/portfolio.html**
   - Mobile responsive fixes

---

## Quick Verification Checklist

- [ ] Server started: `npm run dev`
- [ ] Can access: http://localhost:5000/Resume.html
- [ ] API key entered in Settings
- [ ] Browser localStorage has `geminiApiKey` entry
- [ ] Console shows `[AI Core]` messages (not errors)
- [ ] "Generate from AI" produces real content or specific error
- [ ] Mobile layout works at 640px width
- [ ] Mobile navbar visible on all pages

---

## Need More Help?

If AI still isn't working:

1. **Check Console Errors** (F12 → Console)
   - Look for `[AI Core]` log messages
   - Read the actual error text

2. **Check Network Tab** (F12 → Network)
   - Click "Generate from AI"
   - Look for request to `generativelanguage.googleapis.com`
   - Check the response status (should be 200, not 403)

3. **Verify API Key Has Permissions**
   - Go to: https://console.cloud.google.com/
   - Make sure API key is enabled for:
     - Generative Language API
     - Vision (multimodal models)

---

**Status**: Your fixes are deployed! Just need to:

1. ✅ Add API key in Settings
2. ✅ Test with "Generate from AI"
3. ✅ Should work - no more templates!
