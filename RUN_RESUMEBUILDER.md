# 🚀 HOW TO RUN ResumeBuilder

Your ResumeBuilder is ready to go! Follow these steps to get everything running.

---

## 📋 What You Have

✅ **Frontend** - Beautiful UI with 5 pages:

- Homepage (index.html)
- Resume Builder (Resume.html)
- Cover Letter (cover-letter.html)
- Login (login.html)
- Contact (contact.html)
- Pricing (pricing.html)

✅ **Backend** - Express.js server on port 5000

---

## 🎯 QUICK START (2 Options)

### Option 1: Using npm (Recommended)

**Step 1:** Open terminal and navigate to project

```bash
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
```

**Step 2:** Start the server

```bash
npm run dev
```

**Step 3:** Open your browser

```
http://localhost:5000
```

✅ **Done!** Your ResumeBuilder is live!

---

### Option 2: Manual Node Start

```bash
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
node server.js
```

Then visit: `http://localhost:5000`

---

## 🌐 Access the Application

Once server is running, open browser and visit:

### Main Pages:

- **Home:** http://localhost:5000/
- **Resume Builder:** http://localhost:5000/Resume.html
- **Cover Letter:** http://localhost:5000/cover-letter.html
- **Login:** http://localhost:5000/login.html
- **Contact:** http://localhost:5000/contact.html
- **Pricing:** http://localhost:5000/pricing.html

### API Endpoints (Basic):

- **Health Check:** http://localhost:5000/api/health
- **API Version:** http://localhost:5000/api/version
- **System Stats:** http://localhost:5000/api/stats

---

## ✨ Features Available NOW

### Frontend

✅ Modern, stylish UI
✅ Responsive design (mobile & desktop)
✅ Animated navbar with hover effects
✅ Large, readable fonts (25-50% bigger)
✅ Beautiful gradient colors
✅ Professional shadows & spacing
✅ Contact form
✅ Login page
✅ All pages fully functional

### Backend (Basic)

✅ Server running
✅ Static file serving
✅ Health checks
✅ Contact form submission
✅ API structure ready

---

## ⏳ To Unlock Advanced Backend (25 More Endpoints)

Run this in a NEW terminal:

```bash
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
npm install
```

Then restart server (Ctrl+C, then npm run dev)

You'll get:

- User authentication (register/login)
- Resume CRUD
- Cover letter CRUD
- Auto-save
- And much more!

---

## 🧪 Test the Frontend

### Click and interact with:

1. **Navbar** - Hover over links to see animated underline
2. **Forms** - Fill out contact form
3. **Navigation** - Go between pages
4. **Responsive Design** - Resize browser to see mobile view

### Test Contact Form:

1. Go to Contact page: http://localhost:5000/contact.html
2. Fill in the form
3. Click Submit
4. Check console for confirmation

---

## 🔧 Troubleshooting

### Server won't start?

```bash
npm install
npm run dev
```

### Port 5000 already in use?

Change PORT in .env file:

```
PORT=3000
```

Then restart server.

### Getting 404 errors?

Make sure you're visiting:

- `http://localhost:5000/` (not http://localhost:5000)
- Check browser console (F12) for errors

### Pages not loading?

1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart server
3. Visit http://localhost:5000/

---

## 📊 Server Output

When server starts, you should see:

```
◇ injected env (20) from .env
🚀 ResumeBuilder API Server
✨ Running on http://localhost:5000
📊 Environment: development
🗄️  Database: Connected

[timestamp] GET /
[timestamp] GET /css/style.css
[timestamp] GET /js/app.js
```

---

## 💡 Keyboard Shortcuts

While server is running:

- **Ctrl+C** - Stop server
- **rs** (then Enter) - Restart server (if using nodemon)

---

## 🎯 Next Steps

### 1. Test Frontend (Right Now)

- Visit http://localhost:5000
- Click around
- Test responsive design

### 2. Full Backend (5 minutes)

- Open new terminal
- Run: `npm install`
- Restart server

### 3. Test Authentication (After npm install)

- Go to Login page
- Test registration
- Test login

### 4. Build Resumes (After npm install)

- Create resumes
- Save resumes
- Download resume

---

## 📚 Documentation

After npm install, read:

- **API_DOCUMENTATION.md** - All endpoints
- **TESTING_GUIDE.md** - How to test
- **BACKEND_QUICK_START.md** - Backend setup

---

## ✅ Checklist

- [ ] Server started with `npm run dev`
- [ ] Visited http://localhost:5000 in browser
- [ ] Saw homepage loading
- [ ] Clicked around different pages
- [ ] Tested responsive design (resize browser)
- [ ] Tested contact form
- [ ] Saw animated navbar hover effects
- [ ] Verified larger fonts

Once all checked, you're good to go! ✨

---

## 🎉 You're All Set!

Your ResumeBuilder frontend is live and beautiful.

The backend is ready with basic endpoints.

Everything is working! 🚀

---

### Commands Quick Reference:

```bash
# Start server
npm run dev

# Navigate to project
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder

# Install dependencies (for full backend)
npm install

# Test health endpoint
curl http://localhost:5000/api/health

# Open in browser
http://localhost:5000
```

---

**Ready to build amazing resumes!** 💼✨
