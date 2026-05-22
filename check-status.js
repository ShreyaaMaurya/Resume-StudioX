#!/usr/bin/env node
/**
 * SETUP COMPLETE - Final Status Check
 * Run: node check-status.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║   RESUMEBUILDER + GEMINI AI - STATUS CHECK         ║');
console.log('╚════════════════════════════════════════════════════╝\n');

const checks = [];

// Check 1: .env file
const envPath = path.join(__dirname, '.env');
checks.push({
    name: 'Configuration (.env)',
    status: fs.existsSync(envPath),
    path: envPath,
    fix: 'Create .env file with GEMINI_API_KEY'
});

// Check 2: package.json
const packagePath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
checks.push({
    name: '@google/generative-ai in package.json',
    status: !!pkg.dependencies['@google/generative-ai'],
    dependency: '@google/generative-ai',
    fix: 'Run: npm install'
});

// Check 3: GeminiService
const servicePath = path.join(__dirname, 'models', 'GeminiService.js');
checks.push({
    name: 'GeminiService.js',
    status: fs.existsSync(servicePath),
    path: servicePath,
    fix: 'File should be in /models/GeminiService.js'
});

// Check 4: aiRoutes
const routesPath = path.join(__dirname, 'routes', 'aiRoutes.js');
checks.push({
    name: 'AI Routes (aiRoutes.js)',
    status: fs.existsSync(routesPath),
    path: routesPath,
    fix: 'File should be in /routes/aiRoutes.js'
});

// Check 5: server.js updated
const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
checks.push({
    name: 'Server includes AI routes',
    status: serverContent.includes('aiRoutes'),
    fix: 'Update server.js to include: const aiRoutes = require(\'./routes/aiRoutes\');'
});

// Check 6: Test files
checks.push({
    name: 'Diagnostic test file',
    status: fs.existsSync(path.join(__dirname, 'test-gemini-setup.js')),
    fix: 'File: test-gemini-setup.js'
});

// Display results
let allPass = true;
checks.forEach((check, i) => {
    const icon = check.status ? '✅' : '❌';
    console.log(`${i + 1}. ${icon} ${check.name}`);
    if (!check.status) {
        console.log(`   Fix: ${check.fix}`);
        allPass = false;
    }
});

console.log('\n' + '═'.repeat(50));
console.log('\n📋 NEXT STEPS:\n');

if (allPass) {
    console.log('✅ All files are in place!\n');
    console.log('Run these commands:\n');
    console.log('  1️⃣  npm install');
    console.log('  2️⃣  node test-gemini-setup.js');
    console.log('  3️⃣  npm run dev\n');
} else {
    console.log('⚠️  Some files are missing. Check the fixes above.\n');
}

console.log('📡 5 API ENDPOINTS AVAILABLE:\n');
console.log('  • POST /api/ai/summarize-resume');
console.log('  • POST /api/ai/generate-cover-letter');
console.log('  • POST /api/ai/resume-suggestions');
console.log('  • POST /api/ai/skills-suggestions');
console.log('  • POST /api/ai/optimize-for-job\n');

console.log('📚 DOCUMENTATION FILES:\n');
console.log('  • AI_FIXED_READY.md - Complete overview');
console.log('  • FIX_AI_NOT_WORKING.md - Troubleshooting');
console.log('  • QUICK_FIX_GEMINI.md - Quick start');
console.log('  • GEMINI_AI_SETUP.md - API docs\n');

console.log('🚀 Get started:\n');
console.log('  npm install && node test-gemini-setup.js\n');

console.log('═'.repeat(50) + '\n');
