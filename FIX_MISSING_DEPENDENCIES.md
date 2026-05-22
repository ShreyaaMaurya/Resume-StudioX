# ⚠️ Fix: Missing Dependencies

## Problem

```
Error: Cannot find module 'jsonwebtoken'
```

This happens because npm packages are not installed.

---

## Solution

### Option 1: Quick Install (Recommended)

Run these commands in your terminal:

```bash
cd "c:\Users\admin\OneDrive\Desktop\ResumeBuilder"
npm install
```

This will install ALL missing dependencies from package.json

### Option 2: Install Specific Packages Only

If you just need these two packages:

```bash
cd "c:\Users\admin\OneDrive\Desktop\ResumeBuilder"
npm install jsonwebtoken bcryptjs
```

---

## After Installation

Once dependencies are installed, run:

```bash
npm run dev
```

Or:

```bash
npm start
```

The server should start successfully!

---

## What's Being Installed

The missing packages are:

- **jsonwebtoken** - For JWT token generation and verification
- **bcryptjs** - For password hashing

Both are listed in package.json:

```json
"dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    ...
}
```

---

## Verify Installation

After running `npm install`, check these folders exist:

```
node_modules/jsonwebtoken/
node_modules/bcryptjs/
```

If they exist, dependencies are installed correctly!

---

## Run the Server

```bash
npm run dev
```

Expected output:

```
[nodemon] starting `node server.js`
[DATABASE] MongoDB Connected Layer: localhost
🚀 ResumeBuilder API Server
✨ Running on http://localhost:5000
```

---

## Still Having Issues?

1. Delete `node_modules` folder completely
2. Delete `package-lock.json`
3. Run `npm install` again
4. Run `npm run dev`

This usually solves any dependency issues!

---

**Need help?** Check the terminal output for error messages or review the documentation files.
