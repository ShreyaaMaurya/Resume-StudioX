#!/usr/bin/env node
/**
 * Test script to validate Gemini AI setup
 * Run with: node test-gemini-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n======================================');
console.log('🔍 ResumeBuilder Gemini AI Diagnostics');
console.log('======================================\n');

// Check 1: Environment Variables
console.log('1️⃣  Checking environment variables...');
require('dotenv').config();

if (process.env.GEMINI_API_KEY) {
    const apiKey = process.env.GEMINI_API_KEY;
    const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 10);
    console.log('✅ GEMINI_API_KEY found:', maskedKey);
} else {
    console.log('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}

// Check 2: Dependencies
console.log('\n2️⃣  Checking installed dependencies...');
const packagePath = path.join(__dirname, 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

if (package.dependencies['@google/generative-ai']) {
    console.log('✅ @google/generative-ai is in package.json');
} else {
    console.log('❌ @google/generative-ai NOT in package.json');
}

// Check 3: Try to import Gemini SDK
console.log('\n3️⃣  Attempting to import @google/generative-ai...');
try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    console.log('✅ Successfully imported @google/generative-ai');
    
    // Check 4: Try to initialize Gemini
    console.log('\n4️⃣  Attempting to initialize Gemini API...');
    const apiKey = process.env.GEMINI_API_KEY;
    const client = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini client initialized successfully');
    
    // Check 5: Try to get model
    console.log('\n5️⃣  Testing model access...');
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Model gemini-pro is accessible');
    
    // Check 6: Test API call
    console.log('\n6️⃣  Running test API call (this takes 5-10 seconds)...');
    const testPrompt = 'Say "Hello from Gemini!" in one sentence.';
    
    (async () => {
        try {
            console.log('   ⏳ Sending request to Gemini API...');
            const result = await model.generateContent(testPrompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('✅ API call successful!');
            console.log('\n📝 Response from Gemini:');
            console.log('   ' + text);
            
            console.log('\n======================================');
            console.log('✅ ALL CHECKS PASSED! Gemini AI is ready!');
            console.log('======================================\n');
            
            console.log('🎯 Next steps:');
            console.log('   1. Run: npm run dev');
            console.log('   2. Test API endpoint: POST /api/ai/summarize-resume');
            console.log('\n');
            
        } catch (error) {
            console.log('❌ API call failed!');
            console.log('Error:', error.message);
            
            if (error.message.includes('API key')) {
                console.log('\n⚠️  API KEY ISSUE:');
                console.log('   - Your API key may be invalid');
                console.log('   - Check at: https://makersuite.google.com/app/apikeys');
                console.log('   - Regenerate a new key and update .env');
            }
            
            if (error.message.includes('PERMISSION_DENIED')) {
                console.log('\n⚠️  PERMISSION ISSUE:');
                console.log('   - Your API key may not have Gemini API access');
                console.log('   - Enable Gemini API: https://console.cloud.google.com/apis');
            }
            
            process.exit(1);
        }
    })();
    
} catch (error) {
    console.log('❌ Failed to import @google/generative-ai');
    console.log('\nError:', error.message);
    console.log('\n⚠️  SOLUTION: Run: npm install');
    console.log('   This will install all dependencies including Gemini SDK.\n');
    process.exit(1);
}
