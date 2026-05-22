#!/usr/bin/env node
/**
 * Diagnostic Script: Test Image Upload Processing
 * This will help us debug why image processing is failing
 */

const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config();

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║  IMAGE UPLOAD DIAGNOSTIC - AI Processing DEBUG       ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log('📋 CONFIGURATION CHECK:\n');

// Check 1: API Keys
const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

console.log('1️⃣  Gemini API Key:');
if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    const masked = geminiKey.substring(0, 10) + '...' + geminiKey.substring(geminiKey.length - 5);
    console.log(`   ✅ Found: ${masked}`);
} else {
    console.log('   ❌ NOT SET OR INVALID');
}

console.log('\n2️⃣  OpenAI API Key:');
if (openaiKey && openaiKey !== 'your_openai_api_key_here' && !openaiKey.includes('placeholder')) {
    const masked = openaiKey.substring(0, 10) + '...';
    console.log(`   ✅ Found: ${masked}`);
} else {
    console.log('   ❌ NOT SET OR INVALID');
}

// Check 2: Files
console.log('\n3️⃣  Required Files:');
const filesToCheck = [
    '/middleware/aiEngine.js',
    '/routes/resumeRoutes.js',
    '/.env'
];

filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        const size = fs.statSync(fullPath).size;
        console.log(`   ✅ ${file} (${size} bytes)`);
    } else {
        console.log(`   ❌ ${file} - MISSING`);
    }
});

// Check 3: Gemini SDK
console.log('\n4️⃣  Gemini SDK Installation:');
try {
    require('@google/generative-ai');
    console.log('   ✅ @google/generative-ai installed');
} catch (e) {
    console.log('   ❌ @google/generative-ai NOT installed');
    console.log('   Fix: npm install @google/generative-ai');
}

// Check 4: Test Gemini API connection
console.log('\n5️⃣  Gemini API Connection Test:\n');

(async () => {
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const client = new GoogleGenerativeAI(geminiKey);
        const model = client.getGenerativeModel({ model: 'gemini-pro' });
        
        console.log('   ⏳ Sending test request to Gemini...');
        const result = await model.generateContent('Respond with exactly: "GEMINI API WORKS"');
        const response = await result.response;
        const text = response.text();
        
        if (text.includes('GEMINI API WORKS')) {
            console.log('   ✅ Gemini API is working correctly');
            console.log(`   Response: ${text.substring(0, 50)}...`);
        } else {
            console.log('   ⚠️  Unexpected response from Gemini');
            console.log(`   Response: ${text}`);
        }
    } catch (err) {
        console.log(`   ❌ Gemini API Connection Failed`);
        console.log(`   Error: ${err.message}`);
        
        if (err.message.includes('API key')) {
            console.log('   💡 Issue: Invalid API key');
            console.log('   Solution: Check GEMINI_API_KEY in .env');
        }
        if (err.message.includes('404') || err.message.includes('not found')) {
            console.log('   💡 Issue: API endpoint not found');
            console.log('   Solution: Verify Gemini API is enabled in Google Cloud');
        }
    }
    
    // Check 5: Test multimodal capability
    console.log('\n6️⃣  Gemini Multimodal (Image) Support Test:\n');
    
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const client = new GoogleGenerativeAI(geminiKey);
        const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Create a tiny test image (1x1 white pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        
        console.log('   ⏳ Testing image processing with Gemini...');
        const result = await model.generateContent([
            'What do you see in this image?',
            {
                inlineData: {
                    mimeType: 'image/png',
                    data: testImageBase64
                }
            }
        ]);
        
        const response = await result.response;
        const text = response.text();
        
        console.log('   ✅ Gemini multimodal (image) is working');
        console.log(`   Response preview: ${text.substring(0, 80)}...`);
    } catch (err) {
        console.log(`   ❌ Gemini Multimodal Test Failed`);
        console.log(`   Error: ${err.message}`);
        
        if (err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('RATE_LIMIT')) {
            console.log('   💡 Issue: API rate limit or quota exceeded');
            console.log('   Solution: Wait a moment and try again');
        }
        if (err.message.includes('INVALID') || err.message.includes('not support')) {
            console.log('   💡 Issue: Image format not supported or API doesn\'t support multimodal');
            console.log('   Solution: Try using text-only generation instead');
        }
        if (err.message.includes('PERMISSION')) {
            console.log('   💡 Issue: Permission denied');
            console.log('   Solution: Enable Vision API in Google Cloud Console');
        }
    }
    
    // Summary
    console.log('\n' + '═'.repeat(55));
    console.log('\n📊 SUMMARY:\n');
    
    const checks = [
        geminiKey && geminiKey !== 'your_gemini_api_key_here' ? '✅' : '❌',
        ' Gemini API Key configured',
        fs.existsSync(path.join(__dirname, '/middleware/aiEngine.js')) ? '✅' : '❌',
        ' aiEngine.js exists',
        
    ];
    
    console.log(checks.join(' '));
    
    console.log('\n🎯 RECOMMENDED ACTIONS:\n');
    
    if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
        console.log('1. ⚠️  Set GEMINI_API_KEY in .env');
        console.log('   Get key from: https://makersuite.google.com/app/apikeys\n');
    }
    
    console.log('2. 🔄 Restart server: npm run dev\n');
    
    console.log('3. 🧪 Try uploading an image in the app\n');
    
    console.log('4. 📋 Check browser network tab:\n');
    console.log('   - Look for POST /api/resume/generate-ai');
    console.log('   - Check response for errors\n');
    
    console.log('═'.repeat(55) + '\n');
})();
