# ResumeBuilder Backend API Documentation

## Overview

A comprehensive, production-ready backend API for the ResumeBuilder application built with Node.js, Express.js, and MongoDB. This API provides complete user authentication, resume management, and cover letter management functionality.

## Features

### ✅ Authentication System
- User registration with password hashing (bcrypt)
- JWT-based authentication (Access & Refresh tokens)
- Login/Logout functionality
- Password reset with token verification
- Change password for authenticated users
- Profile management
- Secure token refresh mechanism

### ✅ Resume Management
- Create, Read, Update, Delete (CRUD) operations
- List all user resumes
- Multiple template support (modern, minimal, creative, walton)
- Auto-save functionality
- Publish/Unpublish resumes
- AI-powered resume generation
- Resume blocks management (summary, experience, skills, education, projects, etc.)

### ✅ Cover Letter Management
- Complete CRUD operations
- Multiple templates (professional, creative, minimalist)
- Link cover letters to resumes
- Track cover letters by status (draft/final)
- Auto-generate cover letters with AI

### ✅ Utility Features
- Health check endpoint
- Contact form submission
- Server statistics
- API version information
- Comprehensive endpoint documentation

### ✅ Production-Ready Features
- Comprehensive error handling
- Input validation
- CORS support
- Request logging
- Graceful shutdown
- MongoDB connection management
- Environment configuration
- Security best practices

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or cloud)
- npm or yarn

### Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy/update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/Resume-StudioX
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_REFRESH_SECRET=your_super_secret_refresh_token_key
   JWT_EXPIRE=30m
   JWT_REFRESH_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000,http://localhost:5000
   ```

4. **Start MongoDB**
   - Ensure MongoDB is running on your system
   ```bash
   mongod
   ```

5. **Start the server**
   ```bash
   # Development with nodemon
   npm run dev

   # Production
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
}

Response:
{
    "success": true,
    "message": "User registered successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "fullName": "John Doe",
        "email": "john@example.com"
    }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "SecurePass123"
}

Response:
{
    "success": true,
    "message": "Logged in successfully",
    "accessToken": "...",
    "refreshToken": "...",
    "user": {...}
}
```

#### Refresh Access Token
```
POST /api/auth/refresh
Content-Type: application/json

{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
    "success": true,
    "accessToken": "..."
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "refreshToken": "..."
}

Response:
{
    "success": true,
    "message": "Logged out successfully"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
    "email": "john@example.com"
}

Response:
{
    "success": true,
    "message": "Password reset token sent to email",
    "resetToken": "abc123def456..." (for development only)
}
```

#### Reset Password
```
POST /api/auth/reset-password/:resetToken
Content-Type: application/json

{
    "password": "NewSecurePass123",
    "confirmPassword": "NewSecurePass123"
}

Response:
{
    "success": true,
    "message": "Password reset successfully"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "user": {...}
}
```

#### Update Profile
```
PUT /api/auth/update-profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "fullName": "Jane Doe",
    "phoneNumber": "+1234567890",
    "profileImage": "https://..."
}

Response:
{
    "success": true,
    "message": "Profile updated successfully",
    "user": {...}
}
```

#### Change Password
```
POST /api/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass123",
    "confirmPassword": "NewSecurePass123"
}

Response:
{
    "success": true,
    "message": "Password changed successfully"
}
```

---

### Resume Routes (`/api/resume`)

#### Create Resume
```
POST /api/resume
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "fullName": "John Doe",
    "targetRole": "Senior Developer",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, USA",
    "templateFramework": "tmpl-modern",
    "blocksData": [
        {
            "blockType": "summary",
            "val1": "Professional Summary",
            "val2": "",
            "bullets": "Experienced software engineer..."
        }
    ]
}

Response:
{
    "success": true,
    "message": "Resume created successfully",
    "resume": {...}
}
```

#### Get All User Resumes
```
GET /api/resume
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "count": 3,
    "resumes": [...]
}
```

#### Get Single Resume
```
GET /api/resume/:id
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "resume": {...}
}
```

#### Update Resume
```
PUT /api/resume/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "fullName": "Jane Doe",
    "targetRole": "Lead Developer",
    ...
}

Response:
{
    "success": true,
    "message": "Resume updated successfully",
    "resume": {...}
}
```

#### Delete Resume
```
DELETE /api/resume/:id
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "message": "Resume deleted successfully"
}
```

#### Auto-Save Resume
```
PUT /api/resume/:id/auto-save
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "fullName": "John Doe",
    "targetRole": "Developer",
    ...
}

Response:
{
    "success": true,
    "message": "Resume auto-saved successfully",
    "lastAutoSave": "2024-01-15T10:30:00.000Z"
}
```

#### Publish/Unpublish Resume
```
PUT /api/resume/:id/publish
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "message": "Resume published successfully",
    "isPublished": true
}
```

#### Generate Resume with AI
```
POST /api/resume/generate-ai
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "targetRole": "Software Engineer"
}

Response:
{
    "success": true,
    "data": {
        "summary": "Results-driven Software Engineer...",
        "experience": {...},
        ...
    }
}
```

---

### Cover Letter Routes (`/api/cover-letter`)

#### Create Cover Letter
```
POST /api/cover-letter
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "recipientName": "Hiring Manager",
    "recipientTitle": "HR Director",
    "company": "Tech Company Inc",
    "companyAddress": "123 Tech Street, CA",
    "jobTitle": "Senior Developer",
    "jobId": "JOB123",
    "opening": "Dear Hiring Manager...",
    "body": "I am excited to apply...",
    "closing": "Thank you for considering...",
    "template": "professional"
}

Response:
{
    "success": true,
    "message": "Cover letter created successfully",
    "coverLetter": {...}
}
```

#### Get All User Cover Letters
```
GET /api/cover-letter
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "count": 2,
    "coverLetters": [...]
}
```

#### Get Single Cover Letter
```
GET /api/cover-letter/:id
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "coverLetter": {...}
}
```

#### Update Cover Letter
```
PUT /api/cover-letter/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "opening": "Updated opening...",
    ...
}

Response:
{
    "success": true,
    "message": "Cover letter updated successfully",
    "coverLetter": {...}
}
```

#### Delete Cover Letter
```
DELETE /api/cover-letter/:id
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "message": "Cover letter deleted successfully"
}
```

#### Link Resume to Cover Letter
```
PUT /api/cover-letter/:id/link-resume/:resumeId
Authorization: Bearer <accessToken>

Response:
{
    "success": true,
    "message": "Resume linked to cover letter successfully",
    "coverLetter": {...}
}
```

---

### Utility Routes

#### Health Check
```
GET /api/health

Response:
{
    "success": true,
    "message": "Server is healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600
}
```

#### Contact Form
```
POST /api/contact
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry about ResumeBuilder",
    "message": "I would like to know more about..."
}

Response:
{
    "success": true,
    "message": "Message sent successfully",
    "submission": {...}
}
```

#### Server Statistics
```
GET /api/stats

Response:
{
    "success": true,
    "stats": {
        "totalUsers": 150,
        "totalResumes": 450,
        "totalCoverLetters": 300,
        "timestamp": "2024-01-15T10:30:00.000Z"
    }
}
```

#### API Version
```
GET /api/version

Response:
{
    "success": true,
    "version": "1.0.0",
    "name": "ResumeBuilder API",
    "description": "...",
    "endpoints": {...}
}
```

---

## Database Schema

### User Schema
```javascript
{
    fullName: String (required),
    email: String (required, unique),
    password: String (required, hashed),
    phoneNumber: String,
    profileImage: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshTokens: [{
        token: String,
        createdAt: Date (expires in 7 days)
    }],
    createdAt: Date,
    updatedAt: Date
}
```

### Resume Schema
```javascript
{
    userId: ObjectId (ref: User),
    fullName: String,
    targetRole: String,
    email: String,
    phone: String,
    location: String,
    avatarUrl: String,
    contactLine: String,
    templateFramework: String (enum),
    blocksData: [{
        blockType: String (enum),
        val1: String,
        val2: String,
        bullets: String
    }],
    isPublished: Boolean,
    autoSaveData: Object,
    lastAutoSave: Date,
    createdAt: Date,
    updatedAt: Date
}
```

### CoverLetter Schema
```javascript
{
    userId: ObjectId (ref: User),
    resumeId: ObjectId (ref: Resume),
    recipientName: String,
    recipientTitle: String,
    company: String,
    companyAddress: String,
    jobTitle: String,
    jobId: String,
    opening: String,
    body: String,
    closing: String,
    signature: String,
    template: String (enum),
    status: String (enum: draft, final),
    createdAt: Date,
    updatedAt: Date
}
```

---

## Validation Rules

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Email Validation
- Must be a valid email format
- Must be unique for user registration

### Resume Data
- Full name required
- Target role required
- Valid email required
- Blocks data must be an array

### Cover Letter Data
- Recipient name required
- Company name required
- Job title required
- Opening, body, and closing paragraphs required

---

## Error Handling

All error responses follow this format:

```json
{
    "success": false,
    "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User not authorized to access resource
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Security Features

✅ **Password Hashing**: Passwords are hashed using bcryptjs  
✅ **JWT Tokens**: Secure token-based authentication  
✅ **Refresh Tokens**: Separate refresh tokens with TTL  
✅ **CORS Protection**: Configurable CORS origin  
✅ **Input Validation**: All inputs validated before processing  
✅ **Error Handling**: Sensitive error information not exposed  
✅ **Ownership Verification**: Users can only access their own resources  
✅ **Token Expiration**: Access tokens expire after 30 minutes  
✅ **Rate Limiting Ready**: Structure supports easy integration  

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/Resume-StudioX

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5000

# Email (for future implementation)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password

# API Keys
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
```

---

## Development

### Run in Development Mode
```bash
npm run dev
```

This uses nodemon to automatically restart the server on file changes.

### Project Structure
```
ResumeBuilder/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Error handling
│   ├── requestLogger.js     # Request logging
│   ├── validation.js        # Input validation
│   └── aiEngine.js          # AI simulation
├── models/
│   ├── User.js              # User schema
│   ├── Resume.js            # Resume schema
│   └── CoverLetter.js       # Cover letter schema
├── routes/
│   ├── authRoutes.js        # Authentication endpoints
│   ├── resumeRoutes.js      # Resume endpoints
│   ├── coverLetterRoutes.js # Cover letter endpoints
│   └── utilityRoutes.js     # Utility endpoints
├── public/                  # Frontend files
├── .env                     # Environment configuration
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
└── server.js                # Main server file
```

---

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Create Resume (with token):**
```bash
curl -X POST http://localhost:5000/api/resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "John Doe",
    "targetRole": "Developer",
    "email": "john@example.com",
    "blocksData": []
  }'
```

### Using Postman
1. Import the API endpoints into Postman
2. Use the "Authorization" tab to add Bearer tokens
3. Test each endpoint with sample data

---

## Deployment Checklist

- [ ] Update JWT secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB production URI
- [ ] Set up email service (SMTP)
- [ ] Configure CORS origins for production domain
- [ ] Set up SSL/HTTPS
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy for MongoDB
- [ ] Test all authentication flows
- [ ] Test all CRUD operations
- [ ] Performance testing and optimization

---

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check MongoDB URI in `.env`
- Verify MongoDB is accessible on localhost:27017

### JWT Token Issues
- Ensure JWT_SECRET is set in `.env`
- Token may be expired, use refresh endpoint
- Check Authorization header format: `Bearer <token>`

### CORS Errors
- Verify CORS_ORIGIN in `.env`
- Check request origin matches allowed origins
- Ensure correct Content-Type headers

### Validation Errors
- Check all required fields are provided
- Verify email format is valid
- Ensure password meets requirements

---

## Future Enhancements

- [ ] Email verification on registration
- [ ] Social login integration (Google, GitHub)
- [ ] Resume template marketplace
- [ ] ATS (Applicant Tracking System) optimization
- [ ] Resume analytics and insights
- [ ] Real AI integration (Gemini/OpenAI)
- [ ] PDF export functionality
- [ ] File storage integration (S3/GCS)
- [ ] WebSocket support for real-time updates
- [ ] Rate limiting
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Resume scoring algorithm

---

## License

This project is part of the ResumeBuilder application.

---

## Support

For issues or questions, please refer to the API documentation or contact the development team.

**API Base URL:** `http://localhost:5000/api`  
**Documentation:** See this README  
**Health Check:** `GET /api/health`  
**Version Info:** `GET /api/version`
