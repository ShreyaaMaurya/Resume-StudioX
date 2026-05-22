# Authentication Quick Start Guide

## ✅ Implementation Complete

Your ResumeBuilder now has full authentication with database persistence!

---

## 🚀 How It Works

### Signup Flow

```
User visits /signUp.html
    ↓
Fills form (Name, Email, Password)
    ↓
Clicks "Create Free Account"
    ↓
Data sent to: POST /api/auth/register
    ↓
User created in MongoDB
    ↓
Tokens stored in localStorage
    ↓
Redirect to /Resume.html ✓
```

### Login Flow

```
User visits /login.html
    ↓
Enters Email & Password
    ↓
Clicks "Sign In"
    ↓
Data sent to: POST /api/auth/login
    ↓
Credentials verified against MongoDB
    ↓
Tokens stored in localStorage
    ↓
Redirect to /Resume.html ✓
```

### Protected Resume Access

```
User tries to access /Resume.html
    ↓
JavaScript checks localStorage for accessToken
    ↓
Token found? → Allow access to Resume Builder ✓
Token NOT found? → Redirect to /login.html
```

---

## 🔧 What Was Changed

### 1. Backend (server.js)

```javascript
// Added import
const authRoutes = require("./routes/authRoutes");

// Enabled routes
app.use("/api/auth", authRoutes);
```

### 2. Frontend - Login (login.html)

- Added error message display
- Added form submission handler
- Calls `/api/auth/login`
- Saves tokens to localStorage
- Redirects on success

### 3. Frontend - Signup (signUp.html)

- Added error message display
- Added form submission handler
- Calls `/api/auth/register`
- Saves tokens to localStorage
- Redirects on success

### 4. Frontend - Resume (Resume.html)

- Added authentication check in `<head>`
- Redirects to login if no token found

---

## 📋 Available Endpoints

| Method | Endpoint                    | Purpose               | Auth Required |
| ------ | --------------------------- | --------------------- | ------------- |
| POST   | `/api/auth/register`        | Create new account    | No            |
| POST   | `/api/auth/login`           | Login user            | No            |
| POST   | `/api/auth/logout`          | Logout user           | Yes           |
| POST   | `/api/auth/refresh`         | Get new access token  | No            |
| GET    | `/api/auth/me`              | Get current user info | Yes           |
| PUT    | `/api/auth/update-profile`  | Update user profile   | Yes           |
| POST   | `/api/auth/change-password` | Change password       | Yes           |

---

## 🧪 Quick Test

### Test 1: Signup

```
1. Go to http://localhost:5000/signUp.html
2. Enter:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test1234
3. Click "Create Free Account"
4. Should redirect to Resume.html
```

### Test 2: Login

```
1. Go to http://localhost:5000/login.html
2. Enter:
   - Email: test@example.com
   - Password: Test1234
3. Click "Sign In"
4. Should redirect to Resume.html
```

### Test 3: Protected Access

```
1. Clear localStorage in browser (F12 → Application → Storage → Clear All)
2. Try to access http://localhost:5000/Resume.html
3. Should automatically redirect to login.html
```

---

## 💾 Database Info

**MongoDB Collection**: `users`

**User Fields**:

- `fullName` - Full name of user
- `email` - Unique email address
- `password` - Hashed password (bcryptjs)
- `phoneNumber` - Optional phone number
- `profileImage` - Optional profile picture URL
- `refreshTokens` - Array of active refresh tokens
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

---

## 🔐 Security Features

✅ Passwords hashed with bcryptjs (10 salt rounds)
✅ JWT tokens with expiration (30min access, 7day refresh)
✅ Email validation
✅ CORS protection
✅ Token stored in browser localStorage
✅ Automatic redirect for unauthorized access

---

## ⚙️ Environment Setup

Make sure `.env` file has these values:

```env
MONGO_URI=mongodb://localhost:27017/Resume-StudioX
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_change_this_in_production
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d
```

---

## 🎯 User Experience

| Page           | Before Auth          | After Auth                    |
| -------------- | -------------------- | ----------------------------- |
| `/login.html`  | ✓ Open               | ✓ Open (shows login form)     |
| `/signUp.html` | ✓ Open               | ✓ Open (shows signup form)    |
| `/Resume.html` | ✗ Redirects to login | ✓ Open (shows resume builder) |
| `/index.html`  | ✓ Open               | ✓ Open                        |

---

## 📝 Next Steps

1. **Start backend**: `npm start` (runs on port 5000)
2. **Test signup**: Visit signup page and create account
3. **Test login**: Use signup credentials to login
4. **Test protected**: Try accessing resume without login
5. **Check database**: Verify user data in MongoDB

---

## 🐛 Debugging

**Check tokens in browser**:

```javascript
// Open browser console (F12 → Console)
localStorage.getItem("accessToken");
localStorage.getItem("refreshToken");
localStorage.getItem("user");
```

**Clear all data**:

```javascript
localStorage.clear();
```

**Check API calls**:

1. Open DevTools (F12)
2. Go to Network tab
3. Try to signup/login
4. View the request/response

---

## 📞 Support

If something doesn't work:

1. Check browser console for errors (F12)
2. Check backend terminal for logs
3. Verify MongoDB is running
4. Verify `.env` file has correct values
5. Check Network tab in DevTools for API errors

---

**Status**: ✅ Ready to Use

All authentication features are implemented and ready for testing!
