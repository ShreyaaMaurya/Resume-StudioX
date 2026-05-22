require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const coverLetterRoutes = require('./routes/coverLetterRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const DEFAULT_PORT = Number.parseInt(process.env.PORT, 10) || 5000;

// Connect to MongoDB
connectDB();

// ========== MIDDLEWARE ==========

// CORS Configuration
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ========== API ROUTES ==========

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ResumeStudio X Backend is running smoothly',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API version
app.get('/api/version', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'ResumeStudio X',
        api: 'v1'
    });
});

// API stats
app.get('/api/stats', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Contact form (simple - no email yet)
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    console.log(`Contact form received from ${email}: ${subject}`);
    
    res.json({
        success: true,
        message: 'Thank you for contacting us! We will respond soon.'
    });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Resume routes
app.use('/api/resume', resumeRoutes);

// Cover letter routes
app.use('/api/cover-letter', coverLetterRoutes);

// Portfolio routes
app.use('/api/portfolio', portfolioRoutes);

// AI routes (Gemini integration)
app.use('/api/ai', aiRoutes);

// ========== FRONTEND ROUTES ==========

// Helper to render HTML files and inject header/footer partials when present
function renderHtmlFile(res, filename) {
    const filePath = path.join(__dirname, 'public', filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

    let html = fs.readFileSync(filePath, 'utf8');

    // Premium Glassmorphic Preloader
    const preloaderHtml = `
    <!-- Premium Glassmorphic Preloader -->
    <div id="app-preloader" style="position: fixed; inset: 0; z-index: 99999; background-color: #090d16; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: opacity 0.5s ease-out, visibility 0.5s ease-out; font-family: system-ui, -apple-system, sans-serif;">
        <style>
            @keyframes preloader-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes preloader-ping {
                0% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(1.2); opacity: 0.5; }
                100% { transform: scale(1); opacity: 0.2; }
            }
            .preloader-spinner {
                width: 64px;
                height: 64px;
                border: 4px solid #1e293b;
                border-top-color: #4f46e5;
                border-right-color: #a855f7;
                border-radius: 50%;
                animation: preloader-spin 0.8s linear infinite;
                box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.1);
            }
            .preloader-logo {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 32px;
                width: 32px;
                background: linear-gradient(135deg, #4f46e5, #a855f7);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                color: #ffffff;
                font-size: 14px;
                box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
            }
            .preloader-glow {
                position: absolute;
                inset: -16px;
                border-radius: 50%;
                border: 1px solid rgba(79, 70, 229, 0.1);
                animation: preloader-ping 2s ease-in-out infinite;
            }
            .preloader-title {
                font-size: 12px;
                font-weight: 900;
                letter-spacing: 0.15em;
                color: #f1f5f9;
                text-transform: uppercase;
                margin-top: 32px;
            }
            .preloader-subtitle {
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.1em;
                color: #64748b;
                text-transform: uppercase;
                font-family: monospace;
                margin-top: 6px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .preloader-dot {
                width: 6px;
                height: 6px;
                background-color: #6366f1;
                border-radius: 50%;
                display: inline-block;
                animation: preloader-ping 1s ease-in-out infinite;
            }
        </style>
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div class="preloader-glow"></div>
            <div class="preloader-spinner"></div>
            <div class="preloader-logo">R</div>
            <div class="preloader-title">ResumeStudio <span style="background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">X</span></div>
            <div class="preloader-subtitle">
                <span class="preloader-dot"></span>
                Compiling Assets...
            </div>
        </div>
    </div>
    <script>
        (function() {
            const hidePreloader = () => {
                const loader = document.getElementById('app-preloader');
                if (loader) {
                    loader.style.opacity = '0';
                    loader.style.visibility = 'hidden';
                    setTimeout(() => loader.remove(), 500);
                }
            };
            if (document.readyState === 'complete') {
                hidePreloader();
            } else {
                window.addEventListener('load', hidePreloader);
                setTimeout(hidePreloader, 1500); // safety fallback
            }
        })();
    </script>
    `;

    // Inject Preloader immediately after <body> opening tag on all pages
    html = html.replace(/<body[^>]*>/i, match => match + preloaderHtml);

    // Skip header injection for login/signup pages, workstations and index.html (landing page has its own beautiful navbar)
    const skipHeaderPages = ['index.html', 'login.html', 'signup.html', 'signUp.html', 'sign-up.html', 'resume.html', 'cover-letter.html', 'portfolio.html'];
    const shouldInjectHeader = !skipHeaderPages.includes(filename.toLowerCase());

    // Skip footer injection for landing page, workstations and login/signup pages (index.html has its own beautiful custom footer)
    const skipFooterPages = ['index.html', 'login.html', 'signup.html', 'signUp.html', 'sign-up.html', 'resume.html', 'cover-letter.html', 'portfolio.html'];
    const shouldInjectFooter = !skipFooterPages.includes(filename.toLowerCase());

    if (shouldInjectHeader) {
        const headerPath = path.join(__dirname, 'public', 'partials', 'header.html');
        const header = fs.existsSync(headerPath) ? fs.readFileSync(headerPath, 'utf8') : '';

        if (html.includes('<!--HEADER-->')) {
            html = html.replace('<!--HEADER-->', header);
        } else {
            // Find and inject immediately after the preloader if it was just injected
            if (html.includes('<!-- Premium Glassmorphic Preloader -->')) {
                html = html.replace(/<\/script>\s*<!-- Premium Glassmorphic Preloader -->/i, match => match + '\n' + header);
            } else {
                html = html.replace(/<body[^>]*>/i, match => match + header);
            }
        }
    }

    if (shouldInjectFooter) {
        const footerPath = path.join(__dirname, 'public', 'partials', 'footer.html');
        const footer = fs.existsSync(footerPath) ? fs.readFileSync(footerPath, 'utf8') : '';

        if (html.includes('<!--FOOTER-->')) {
            html = html.replace('<!--FOOTER-->', footer);
        } else {
            html = html.replace(/<\/body>/i, footer + '</body>');
        }
    }

    res.send(html);
}

// Serve HTML files through the renderer
app.get('/:page.html', (req, res, next) => {
    const requested = `${req.params.page}.html`;
    renderHtmlFile(res, requested);
});

// Root route
app.get('/', (req, res) => {
    renderHtmlFile(res, 'index.html');
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Global error handler (must be last)
// app.use(errorHandler);

// ========== SERVER START ==========

let server;

function startServer(port) {
    server = app.listen(port, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       🚀 ResumeBuilder API Server                        ║
║       ✨ Running on http://localhost:${port}              ║
║       📊 Environment: ${process.env.NODE_ENV}                  ║
║       🗄️  Database: ${process.env.MONGO_URI}  ║
║                                                           ║
║       Available Routes:                                   ║
║       - Authentication: /api/auth/*                      ║
║       - Resume: /api/resume/*                            ║
║       - Cover Letter: /api/cover-letter/*                ║
║       - Health Check: /api/health                        ║
║       - Stats: /api/stats                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
        `);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && port < DEFAULT_PORT + 10) {
            console.warn(`Port ${port} is already in use, trying ${port + 1}...`);
            startServer(port + 1);
            return;
        }

        throw error;
    });
}

startServer(DEFAULT_PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;