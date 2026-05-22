# ResumeBuilder API - Testing Guide

## Testing with cURL

This guide provides cURL examples for testing all API endpoints. You can copy-paste these commands directly into your terminal.

---

## 🔐 Authentication Tests

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Developer",
    "email": "john.dev@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Developer",
    "email": "john.dev@example.com"
  }
}
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.dev@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Get Current User Info
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 4. Update Profile
```bash
curl -X PUT http://localhost:5000/api/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "fullName": "Jane Developer",
    "phoneNumber": "+1-555-0123",
    "profileImage": "https://example.com/profile.jpg"
  }'
```

### 5. Change Password
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456",
    "confirmPassword": "NewSecurePass456"
  }'
```

### 6. Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.dev@example.com"
  }'
```

### 7. Reset Password (use token from forgot password)
```bash
curl -X POST "http://localhost:5000/api/auth/reset-password/RESET_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePass123",
    "confirmPassword": "NewSecurePass123"
  }'
```

### 8. Refresh Access Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### 9. Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

---

## 📄 Resume Tests

### 1. Create Resume
```bash
curl -X POST http://localhost:5000/api/resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "fullName": "John Developer",
    "targetRole": "Senior Full-Stack Developer",
    "email": "john.dev@example.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA",
    "templateFramework": "tmpl-modern",
    "blocksData": [
      {
        "blockType": "summary",
        "val1": "Professional Summary",
        "val2": "",
        "bullets": "Experienced full-stack developer with 5+ years specializing in MERN stack development. Passionate about building scalable applications."
      },
      {
        "blockType": "experience",
        "val1": "Tech Corp Inc",
        "val2": "Node.js, React, MongoDB",
        "bullets": "Led development of microservices architecture\nOptimized database queries reducing latency by 40%\nMentored junior developers on best practices"
      },
      {
        "blockType": "skills",
        "val1": "Technical Skills",
        "val2": "JavaScript, React, Node.js, MongoDB, PostgreSQL, Docker, AWS",
        "bullets": ""
      },
      {
        "blockType": "education",
        "val1": "University of Technology",
        "val2": "Bachelor of Computer Science",
        "bullets": "Graduated 2018, GPA: 3.8"
      }
    ]
  }'
```

### 2. Get All Resumes
```bash
curl -X GET http://localhost:5000/api/resume \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 3. Get Single Resume
```bash
curl -X GET "http://localhost:5000/api/resume/RESUME_ID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 4. Update Resume
```bash
curl -X PUT "http://localhost:5000/api/resume/RESUME_ID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "fullName": "Jane Developer",
    "targetRole": "Technical Lead",
    "email": "jane.dev@example.com",
    "phone": "+1-555-9999",
    "location": "New York, NY",
    "blocksData": [
      {
        "blockType": "summary",
        "val1": "Professional Summary",
        "val2": "",
        "bullets": "Updated summary with new achievements..."
      }
    ]
  }'
```

### 5. Auto-Save Resume
```bash
curl -X PUT "http://localhost:5000/api/resume/RESUME_ID_HERE/auto-save" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "fullName": "John Developer",
    "targetRole": "Senior Developer",
    "email": "john.dev@example.com",
    "blocksData": []
  }'
```

### 6. Publish Resume
```bash
curl -X PUT "http://localhost:5000/api/resume/RESUME_ID_HERE/publish" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 7. Unpublish Resume (same endpoint)
```bash
curl -X PUT "http://localhost:5000/api/resume/RESUME_ID_HERE/publish" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 8. Delete Resume
```bash
curl -X DELETE "http://localhost:5000/api/resume/RESUME_ID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 9. Generate Resume with AI
```bash
curl -X POST http://localhost:5000/api/resume/generate-ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "targetRole": "Software Engineer"
  }'
```

---

## 💌 Cover Letter Tests

### 1. Create Cover Letter
```bash
curl -X POST http://localhost:5000/api/cover-letter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "recipientName": "Sarah Johnson",
    "recipientTitle": "Hiring Manager",
    "company": "Tech Innovators Inc",
    "companyAddress": "123 Tech Avenue, San Francisco, CA 94102",
    "jobTitle": "Senior Full-Stack Developer",
    "jobId": "JOB-2024-001",
    "opening": "Dear Ms. Johnson,\n\nI am writing to express my strong interest in the Senior Full-Stack Developer position at Tech Innovators Inc.",
    "body": "With over 5 years of experience in full-stack development using the MERN stack, I am confident in my ability to contribute significantly to your team. Throughout my career, I have demonstrated expertise in designing and implementing scalable web applications, optimizing database performance, and leading cross-functional teams.\n\nIn my current role at Tech Corp, I have successfully architected a microservices platform that reduced deployment time by 60% and improved system reliability. Additionally, I have mentored junior developers and established best practices that improved code quality metrics.",
    "closing": "I am excited about the opportunity to bring my expertise and passion for technology to Tech Innovators Inc. I would welcome the chance to discuss how my background and skills align with your team's needs. Thank you for considering my application.",
    "signature": "Best regards,\nJohn Developer",
    "template": "professional",
    "status": "draft"
  }'
```

### 2. Get All Cover Letters
```bash
curl -X GET http://localhost:5000/api/cover-letter \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 3. Get Single Cover Letter
```bash
curl -X GET "http://localhost:5000/api/cover-letter/COVER_LETTER_ID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 4. Update Cover Letter
```bash
curl -X PUT "http://localhost:5000/api/cover-letter/COVER_LETTER_ID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "recipientName": "Sarah Johnson",
    "company": "Tech Innovators Inc",
    "jobTitle": "Senior Full-Stack Developer",
    "opening": "Updated opening paragraph...",
    "body": "Updated body content...",
    "closing": "Updated closing paragraph...",
    "status": "final"
  }'
```

### 5. Link Resume to Cover Letter
```bash
curl -X PUT "http://localhost:5000/api/cover-letter/COVER_LETTER_ID_HERE/link-resume/RESUME_ID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 6. Get Cover Letters for Specific Resume
```bash
curl -X GET "http://localhost:5000/api/cover-letter/resume/RESUME_ID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 7. Delete Cover Letter
```bash
curl -X DELETE "http://localhost:5000/api/cover-letter/COVER_LETTER_ID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🛠️ Utility Tests

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### 2. Contact Form Submission
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John User",
    "email": "user@example.com",
    "subject": "Inquiry about ResumeBuilder Features",
    "message": "I would like to know more about the advanced features available in ResumeBuilder, particularly the AI-powered resume generation."
  }'
```

### 3. Server Statistics
```bash
curl -X GET http://localhost:5000/api/stats
```

### 4. API Version Info
```bash
curl -X GET http://localhost:5000/api/version
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete User Flow
1. Register user
2. Login with credentials
3. Create resume
4. Create cover letter
5. Link resume to cover letter
6. Update resume
7. Publish resume
8. Logout

### Scenario 2: Resume Management
1. Create multiple resumes
2. Get all resumes
3. Update each resume
4. Change template
5. Auto-save data
6. Publish one resume
7. Delete one resume

### Scenario 3: Cover Letter Management
1. Create cover letter without resume link
2. Create another resume
3. Link resume to cover letter
4. Update cover letter content
5. Change status to final
6. Create another cover letter for same resume

### Scenario 4: Authentication Security
1. Register user
2. Attempt login with wrong password (should fail)
3. Login with correct password
4. Attempt to access another user's resume (should be denied)
5. Change password
6. Login with new password
7. Request password reset
8. Reset password with token

---

## 💡 Testing Tips

### Using Postman (Alternative to cURL)
1. Import endpoints from API_DOCUMENTATION.md
2. Set up environment variables for tokens
3. Use pre-request scripts to automatically refresh tokens
4. Create test collections for different scenarios

### Common Test Cases
- ✅ Valid input with expected output
- ❌ Invalid input with proper error messages
- 🔐 Authentication required endpoints without token
- 👤 Authorization checks (user accessing another user's data)
- 🔄 Token expiration and refresh flow
- ↔️ Cross-resource operations (resume-cover letter linking)

### Debugging Tips
- Check response status codes (200, 201, 400, 401, 404, etc.)
- Look for `success` flag in responses
- Check error messages for validation details
- Verify MongoDB has data using MongoDB Compass
- Monitor server logs for request details

---

## 📊 Performance Testing

Test with larger datasets:
```bash
# Create multiple resumes in a loop
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/resume \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d "{\"fullName\":\"Test User $i\",\"targetRole\":\"Developer\",\"email\":\"user$i@example.com\",\"blocksData\":[]}"
done
```

---

## 🔍 Monitoring

Monitor server performance:
```bash
# Check server health
curl http://localhost:5000/api/health

# Get server statistics
curl http://localhost:5000/api/stats

# Check API version
curl http://localhost:5000/api/version
```

---

**Ready to test? Start with authentication, then test CRUD operations!** 🚀
