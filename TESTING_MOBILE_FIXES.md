# QUICK START - Test Your Fixes

## 1. Start the Server

Open Command Prompt and run:

```bash
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
npm run dev
```

Server should start on http://localhost:5000

## 2. Test Mobile Navbar

1. Open http://localhost:5000 in Chrome
2. Press **F12** to open Developer Tools
3. Click the **device toolbar icon** (top-left of DevTools)
4. Select **iPad** or **iPhone 12**
5. You should see the navbar items (Home, Cover Letter, Portfolio)
6. Try resizing down to 640px - navbar should still be visible

✅ **Expected**: All navigation links visible, no broken layout

## 3. Test Mobile Layout

1. Go to http://localhost:5000/Resume.html
2. In DevTools, set width to **640px**
3. Check that:
   - ✅ Sidebar is on top (not side-by-side)
   - ✅ Canvas/preview is below sidebar
   - ✅ All buttons are full-width
   - ✅ No horizontal scrolling

4. Go to http://localhost:5000/cover-letter.html
5. Set width to **640px**
6. Check that:
   - ✅ Letter preview shows full-width
   - ✅ Buttons stack vertically
   - ✅ Header is readable

## 4. Test AI Generation (Most Important!)

1. Go to http://localhost:5000/Resume.html
2. Scroll down to **"Generate from AI"** section
3. Click **"Generate from AI"**
4. You should see ONE of these:
   - ✅ **Option A**: If no API key set → Error message: "No AI API key configured"
   - ✅ **Option B**: If Gemini key set → Actual AI-generated content (NOT template data)
   - ❌ **WRONG**: Should NOT see template data like "Vortex Tech Solutions" or fake [OCR] tags

### To Test with API Key:

1. Click the **Settings** button in top-right
2. Enter your Gemini API key: `AIzaSyC65-y2ji4tcp4dt6qDuTpwhq7irkLhG_Q`
3. Save settings
4. Try "Generate from AI" again
5. Should call Gemini API and generate real content

## 5. Verify Fixes in Code

Open your browser DevTools (F12) > Console tab:

- When "Generate from AI" is clicked, you should see:
  - ✅ `[AI Core]` log messages
  - ✅ Either: `Attempting Gemini...` or `NO API KEY CONFIGURED`
  - ✅ NOT: `Using local fallback` (unless AI actually failed)

## Test Checklist

- [ ] Mobile navbar shows at 640px width
- [ ] Resume page responsive at 640px (no horizontal scroll)
- [ ] Cover Letter page responsive at 640px
- [ ] Portfolio page responsive at 640px
- [ ] AI Generation shows error OR real content (not template)
- [ ] Buttons are full-width on mobile
- [ ] All text readable on mobile
- [ ] Header doesn't overflow on mobile

## Troubleshooting

**Issue**: Server won't start on port 5000

- **Fix**: Kill old process:
  ```bash
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  npm run dev
  ```

**Issue**: Navbar still doesn't show on mobile

- **Fix**: Clear browser cache (Ctrl+Shift+Delete)
- Restart server
- Hard reload page (Ctrl+F5)

**Issue**: AI still shows template data

- **Fix**:
  1. Check API key is entered (Settings button)
  2. Open DevTools Console
  3. Look for error messages
  4. Verify API key isn't placeholder text

**Issue**: Mobile layout still broken

- **Fix**: Check DevTools is set to actual device size (640px or 768px)
- Not just zoomed out - actual device size
- Try different breakpoints: 640px, 768px, 1024px

## Success Message

When everything works, you should see:

1. ✅ **Mobile navbar visible** at all sizes
2. ✅ **Mobile layouts responsive** with no overflow
3. ✅ **AI generation returns real content** or proper error
4. ✅ **All buttons tappable** on mobile
5. ✅ **No template data** appearing

---

**Questions?** Check the browser console (F12) for detailed error messages!
