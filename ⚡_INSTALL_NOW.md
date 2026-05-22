# ⚡ QUICK FIX - Install Dependencies NOW

## 🚨 The Problem

```
Error: Cannot find module 'jsonwebtoken'
```

Your npm packages are not installed!

---

## ✅ The Fix (3 Easy Steps)

### Step 1: Open Terminal

Open your terminal/command prompt and navigate to the project:

```
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
```

### Step 2: Install Dependencies

Run this command:

```
npm install
```

**Wait for it to complete** (will take 1-2 minutes)

You should see:

```
added X packages
```

### Step 3: Start the Server

After installation, run:

```
npm run dev
```

Or:

```
npm start
```

---

## ✨ Expected Result

After running `npm start`, you should see:

```
[nodemon] starting `node server.js`
[DATABASE] MongoDB Connected Layer: localhost

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       🚀 ResumeBuilder API Server                        ║
║       ✨ Running on http://localhost:5000                ║
║       📊 Environment: development                         ║
║       🗄️  Database: mongodb://localhost:27017/Resume...  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

If you see this, **SUCCESS!** ✅

---

## 🔍 Verify Installation

To verify packages installed correctly, check if these folders exist:

Open file explorer and navigate to:

```
c:\Users\admin\OneDrive\Desktop\ResumeBuilder\node_modules\
```

Look for these folders:

- ✅ `jsonwebtoken` folder
- ✅ `bcryptjs` folder
- ✅ `mongoose` folder
- ✅ `express` folder

If all exist, installation worked!

---

## 🧪 Test the Application

Once the server is running:

1. **Test Signup**: Go to http://localhost:5000/signUp.html
2. **Test Login**: Go to http://localhost:5000/login.html
3. **Test Protected**: Go to http://localhost:5000/Resume.html

---

## 🆘 If It Still Doesn't Work

### Option A: Full Reset

```
# Delete these files
Delete: node_modules folder
Delete: package-lock.json file

# Then reinstall
npm install
npm start
```

### Option B: Check Node/NPM

```
node --version    # Should be v14 or higher
npm --version     # Should be v6 or higher
```

If versions are old, update Node.js from https://nodejs.org

### Option C: Check MongoDB

Make sure MongoDB is running:

```
mongod
```

Should show:

```
[mongod] Listening on port 27017
```

---

## ✅ Everything Working?

Great! Now:

1. Test signup at `/signUp.html`
2. Test login at `/login.html`
3. Verify user in MongoDB
4. Check resume builder access

**That's it!** Your authentication system is ready! 🎉

---

**Still stuck?** Read: `FIX_MISSING_DEPENDENCIES.md`
