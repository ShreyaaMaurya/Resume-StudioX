# Authentication Implementation Guide

## Summary of Changes

This document outlines the authentication features implemented for the ResumeBuilder application, including user login/signup with database persistence and protected access to the Resume Builder.

---

## Features Implemented

### 1. **Backend Authentication Routes** (Enabled)

- **File**: `server.js`
- **Changes**: Enabled authentication routes from `routes/authRoutes.js`
- **API Endpoints Available**:
  - `POST /api/auth/register` - User signup
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  - `POST /api/auth/refresh` - Refresh access token
  - `GET /api/auth/me` - Get current user info
  - `PUT /api/auth/update-profile` - Update profile
  - `POST /api/auth/change-password` - Change password
  - `POST /api/auth/forgot-password` - Password reset
  - `POST /api/auth/reset-password/:resetToken` - Complete password reset

### 2. **Database Models**

- **User Model** (`models/User.js`):
  - fullName (required, max 100 chars)
  - email (required, unique)
  - password (hashed with bcryptjs)
  - phoneNumber (optional)
  - profileImage (optional)
  - resetPasswordToken & resetPasswordExpire (for password resets)
  - refreshTokens (array for token management)
  - createdAt & updatedAt (timestamps)

### 3. **Frontend - Login Page** (`public/login.html`)

- Updated with form submission handler
- Calls `POST /api/auth/login` API endpoint
- Stores tokens in localStorage:
  - `accessToken` - JWT for authenticated requests
  - `refreshToken` - Token for refreshing access token
  - `user` - User object (id, fullName, email, phoneNumber, profileImage)
- Redirects to `/Resume.html` on successful login
- Shows error messages for failed login attempts

### 4. **Frontend - Signup Page** (`public/signUp.html`)

- Updated with form submission handler
- Collects: First Name, Last Name, Email, Password, Confirm Password
- Calls `POST /api/auth/register` API endpoint
- Combines first and last name as fullName for storage
- Validates password confirmation on frontend
- Stores tokens in localStorage after successful signup
- Redirects to `/Resume.html` on successful signup
- Shows error messages for failed signup attempts

### 5. **Protected Resume Page** (`public/Resume.html`)

- Added authentication check at page load
- Checks for `accessToken` in localStorage
- Redirects to `/login.html` if token not found
- Allows access to resume builder only for authenticated users

---

## How to Use

### For Users - Signup Process:

1. Click "Sign Up" on the homepage or visit `/signUp.html`
2. Enter First Name, Last Name, Email
3. Create a password (min 8 characters)
4. Confirm password
5. Accept Terms of Service
6. Click "Create Free Account"
7. User data is saved to MongoDB
8. Automatically logged in and redirected to Resume Builder

### For Users - Login Process:

1. Click "Sign In" or visit `/login.html`
2. Enter email address
3. Enter password
4. Optionally check "Remember me for 30 days"
5. Click "Sign In"
6. Automatically redirected to Resume Builder if credentials are valid
7. Error message shown if credentials are invalid

### For Users - Access Resume Builder:

1. Must be logged in (signup or login first)
2. Visit `/Resume.html`
3. If not logged in, automatically redirected to login page
4. Once logged in, access allowed to the resume builder

---

## API Endpoints Detail

### Register (Signup)

```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "JWT_TOKEN",
  "refreshToken": "REFRESH_TOKEN",
  "user": {
    "id": "USER_ID",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login

```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Logged in successfully",
  "accessToken": "JWT_TOKEN",
  "refreshToken": "REFRESH_TOKEN",
  "user": {
    "id": "USER_ID",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "",
    "profileImage": null
  }
}
```

### Protected Route Example

```
GET /api/auth/me
Authorization: Bearer JWT_TOKEN

Response (200):
{
  "success": true,
  "user": { ... full user object ... }
}
```

---

## Database Configuration

### MongoDB Setup

The application uses MongoDB for storing user data. Ensure MongoDB is running:

**Local Setup:**

```bash
# Connection string in .env:
MONGO_URI=mongodb://localhost:27017/Resume-StudioX
```

**MongoDB Atlas (Cloud):**

```bash
# Connection string in .env:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Resume-StudioX
```

### User Collection Schema

```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  profileImage: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  refreshTokens: [
    {
      token: String,
      createdAt: Date (7-day TTL)
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs (10 salt rounds)
2. **JWT Authentication**:
   - Access tokens expire in 30 minutes
   - Refresh tokens expire in 7 days
3. **Token Rotation**: Refresh tokens are stored in database for validation
4. **CORS Protection**: Configured to accept requests from allowed origins
5. **Email Validation**: Email format is validated on both frontend and backend
6. **Password Requirements**: Minimum 8 characters, must contain alphanumeric elements

---

## Testing Instructions

### Start the Server

```bash
cd ResumeBuilder
npm start
```

The server runs on `http://localhost:5000`

### Test Signup

1. Go to `http://localhost:5000/signUp.html`
2. Fill in the form with test data
3. Submit the form
4. Should redirect to Resume.html
5. Check MongoDB to verify user was created

### Test Login

1. Go to `http://localhost:5000/login.html`
2. Enter the email and password from signup
3. Click Sign In
4. Should redirect to Resume.html

### Test Protected Resume Page

1. Clear localStorage to simulate logout
2. Try to access `http://localhost:5000/Resume.html`
3. Should redirect to login.html automatically

### Test Token Refresh

1. Wait for access token to expire (30 minutes)
2. Use the refresh token to get new access token
3. API: `POST /api/auth/refresh` with refreshToken in body

---

## Environment Variables Required

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/Resume-StudioX

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_change_this_in_production
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
```

---

## Troubleshooting

### Issue: "Login failed" error

- **Solution**: Verify email and password are correct
- **Check**: User exists in MongoDB database

### Issue: Cannot access Resume.html after login

- **Solution**: Check if access token is stored in localStorage
- **Check**: Browser console for any JavaScript errors

### Issue: Signup page not working

- **Solution**: Verify MongoDB is running and connected
- **Check**: Backend logs for connection errors
- **Verify**: Network tab in browser DevTools for API response

### Issue: Refresh token not working

- **Solution**: Ensure refresh token exists in database
- **Check**: Token expiry in refreshTokens array (7 days TTL)

---

## Files Modified

1. **server.js** - Enabled auth routes import and middleware
2. **public/login.html** - Added authentication form handling
3. **public/signUp.html** - Added registration form handling
4. **public/Resume.html** - Added authentication check at page load
5. **.env** - Already contains JWT configuration

---

## Future Enhancements

- [ ] Implement Google OAuth
- [ ] Implement GitHub OAuth
- [ ] Add two-factor authentication
- [ ] Implement password reset email
- [ ] Add user profile management
- [ ] Add logout from all devices feature
- [ ] Implement API rate limiting for auth routes
- [ ] Add user activity logging

---

## Support

For issues or questions about the authentication system, check:

1. Browser console (F12 → Console tab)
2. Backend logs in terminal
3. MongoDB logs for connection issues
4. Network tab in DevTools to inspect API calls
