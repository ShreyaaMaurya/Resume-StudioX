#!/usr/bin/env node
/**
 * Image Upload OCR Test Script
 * Tests if image processing works correctly without [OCR] prefixes
 */

const http = require('http');

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║   IMAGE UPLOAD OCR FIX - VERIFICATION TOOL         ║');
console.log('╚════════════════════════════════════════════════════╝\n');

console.log('📋 What This Tests:');
console.log('   1. Sending a test image to /api/resume/generate-ai');
console.log('   2. Checking if [OCR] prefixes are removed');
console.log('   3. Verifying clean data is returned\n');

console.log('⚠️  IMPORTANT:');
console.log('   - Make sure your server is running: npm run dev');
console.log('   - Make sure Gemini API key is set in .env');
console.log('   - This test simulates image upload\n');

// Create a small test image (1x1 pixel PNG as base64)
// This is just for testing the API response format
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const testImageDataUri = `data:image/png;base64,${testImageBase64}`;

const testPayload = {
    targetRole: 'Senior Software Engineer',
    company: 'Google',
    resumeImage: testImageDataUri
};

console.log('📤 Sending request to /api/resume/generate-ai...\n');
console.log('Payload:', JSON.stringify(testPayload, null, 2).substring(0, 200) + '...\n');

const postData = JSON.stringify(testPayload);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume/generate-ai',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('═'.repeat(50));
        console.log('📊 RESPONSE RECEIVED\n');
        console.log('Status Code:', res.statusCode);
        console.log('Status:', res.statusCode === 200 ? '✅ OK' : '❌ ERROR');
        
        try {
            const json = JSON.parse(data);
            const response = json.data || json;
            
            // Check for [OCR] prefix issues
            const hasOCRPrefix = JSON.stringify(response).includes('[OCR]');
            
            console.log('\n📋 RESPONSE DATA:\n');
            console.log(JSON.stringify(response, null, 2));
            
            console.log('\n' + '═'.repeat(50));
            console.log('✅ VERIFICATION RESULTS:\n');
            
            if (res.statusCode === 200) {
                console.log('✅ API returned 200 OK');
            } else {
                console.log('❌ API returned', res.statusCode);
            }
            
            if (!hasOCRPrefix) {
                console.log('✅ NO [OCR] prefixes detected - FIX WORKING!');
            } else {
                console.log('❌ [OCR] prefixes still present - FIX NOT APPLIED');
                console.log('   Did you restart the server?');
            }
            
            // Check response structure
            if (response.summary) console.log('✅ Summary field present');
            if (response.experience) console.log('✅ Experience field present');
            if (response.skills) console.log('✅ Skills field present');
            if (response.education) console.log('✅ Education field present');
            
            if (response.experience && response.experience.role) {
                if (!response.experience.role.includes('[OCR]')) {
                    console.log('✅ Role field clean (no [OCR] prefix)');
                } else {
                    console.log('❌ Role still has [OCR] prefix');
                }
            }
            
            console.log('\n' + '═'.repeat(50));
            console.log('\n🎯 SUMMARY:\n');
            
            if (res.statusCode === 200 && !hasOCRPrefix) {
                console.log('✅ IMAGE UPLOAD OCR FIX IS WORKING!');
                console.log('\nYou can now:');
                console.log('  • Upload resume images');
                console.log('  • Get clean extracted data');
                console.log('  • No fake [OCR] labels\n');
            } else if (hasOCRPrefix) {
                console.log('⚠️  [OCR] prefixes are still appearing');
                console.log('\nTo fix:');
                console.log('  1. Stop server: Ctrl+C');
                console.log('  2. Start server: npm run dev');
                console.log('  3. Try this test again\n');
            } else {
                console.log('❌ API error - check server logs');
                console.log('   Run: npm run dev\n');
            }
            
        } catch (e) {
            console.log('❌ Could not parse JSON response');
            console.log('Raw response:', data.substring(0, 200));
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ CONNECTION ERROR:', error.message);
    console.log('\nMake sure:');
    console.log('  ✓ Server is running: npm run dev');
    console.log('  ✓ Server is on port 5000');
    console.log('  ✓ .env has GEMINI_API_KEY set\n');
});

req.write(postData);
req.end();

console.log('⏳ Waiting for response...\n');
