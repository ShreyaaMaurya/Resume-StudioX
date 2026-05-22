# ResumeBuilder Backend - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Install Dependencies
```bash
cd c:\Users\admin\OneDrive\Desktop\ResumeBuilder
npm install
```

### 2. Start MongoDB
```bash
# Make sure MongoDB is running on your system
mongod
```

### 3. Run the Server
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       🚀 ResumeBuilder API Server                        ║
║       ✨ Running on http://localhost:5000                ║
│       📊 Environment: development                         ║
║       🗄️  Database: mongodb://localhost:27017/Resume-StudioX
║                                                           ║
║       Available Routes:                                   ║
║       - Authentication: /api/auth/*                      ║
║       - Resume: /api/resume/*                            ║
║       - Cover Letter: /api/cover-letter/*                ║
║       - Health Check: /api/health                        ║
║       - Stats: /api/stats                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## ✅ Quick Test

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "Test12345",
    "confirmPassword": "Test12345"
  }'
```

You'll get back access and refresh tokens.

### Create a Resume (use token from registration)
```bash
curl -X POST http://localhost:5000/api/resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "John Doe",
    "targetRole": "Senior Developer",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "location": "New York",
    "templateFramework": "tmpl-modern",
    "blocksData": [
      {
        "blockType": "summary",
        "val1": "Professional Summary",
        "val2": "",
        "bullets": "Experienced developer with 5+ years in full-stack development"
      }
    ]
  }'
```

## 📚 Documentation

Full API documentation: See `API_DOCUMENTATION.md`

## 🔑 Key Features

✨ **User Authentication**
- Register, Login, Logout
- Password reset & change
- Profile management
- JWT tokens with refresh capability

📄 **Resume Management**
- Create, Read, Update, Delete
- Multiple templates
- Auto-save functionality
- AI-powered generation

💌 **Cover Letters**
- Full CRUD operations
- Link to resumes
- Multiple templates

🛠️ **Utilities**
- Health check
- Contact form
- Server statistics
- API version info

## 🔧 Environment Variables

Edit `.env` file to customize:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/Resume-StudioX
JWT_SECRET=change_this_key_in_production
JWT_REFRESH_SECRET=change_this_key_too
```

## 📁 Project Structure

```
├── config/          - Database configuration
├── middleware/      - Auth, validation, error handling
├── models/          - User, Resume, CoverLetter schemas
├── routes/          - API endpoints
├── public/          - Frontend files
└── server.js        - Main application file
```

## 🐛 Troubleshooting

**MongoDB not connecting?**
- Make sure `mongod` is running
- Check MONGO_URI in .env

**Port already in use?**
- Change PORT in .env or stop the process using that port

**Dependencies not installing?**
- Delete node_modules and package-lock.json
- Run `npm install` again

**Token issues?**
- Make sure to include `Authorization: Bearer <token>` header
- Tokens expire in 30m (use refresh endpoint for new one)

## 📞 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/resume` | Get all user resumes |
| POST | `/api/resume` | Create resume |
| GET | `/api/cover-letter` | Get all cover letters |
| POST | `/api/cover-letter` | Create cover letter |
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Server statistics |

## 🎯 Next Steps

1. Update JWT secrets in `.env` for production
2. Configure email service for password reset
3. Set up real MongoDB cloud instance
4. Deploy to hosting platform (Heroku, AWS, DigitalOcean, etc.)
5. Connect frontend to these API endpoints
6. Test all flows thoroughly

## 📖 Need More Help?

- See `API_DOCUMENTATION.md` for complete API reference
- Check middleware for authentication flows
- Review models for database schema details
- Look at routes for endpoint implementations

---

**Happy coding! 🎉**
