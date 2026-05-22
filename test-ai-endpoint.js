#!/usr/bin/env node
/**
 * Manual test for AI endpoint
 * Run with: node test-ai-endpoint.js
 */

const http = require('http');

const testData = {
  resumeText: `John Doe
  
Senior Software Engineer

EXPERIENCE:
- 5 years as full-stack developer
- Led team of 3 developers
- Improved performance by 40%
- Expert in JavaScript, Python, React

SKILLS:
- JavaScript, React, Node.js
- Python, SQL, MongoDB
- Docker, AWS, CI/CD

EDUCATION:
- BS Computer Science`
};

console.log('\n🧪 Testing Gemini AI Endpoint\n');
console.log('Endpoint: POST http://localhost:5000/api/ai/summarize-resume');
console.log('Request body:', JSON.stringify(testData, null, 2));
console.log('\n⏳ Sending request (this may take 5-10 seconds)...\n');

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai/summarize-resume',
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
    console.log('📊 Response Status:', res.statusCode);
    console.log('\n📝 Response Body:');
    
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS! Gemini AI is working!');
        console.log('\n📄 Summary from Gemini:');
        console.log('---');
        console.log(json.summary);
        console.log('---');
      } else if (json.error) {
        console.log('\n❌ ERROR:', json.error);
        if (json.solution) {
          console.log('💡 Solution:', json.solution);
        }
        if (json.details) {
          console.log('📋 Details:', json.details);
        }
      }
    } catch (e) {
      console.log(data);
      console.log('\n⚠️  Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Connection Error:', error.message);
  console.log('\n💡 Is the server running? Run: npm run dev');
});

req.write(postData);
req.end();
