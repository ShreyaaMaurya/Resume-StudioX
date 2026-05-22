#!/bin/bash
# Quick test script for Gemini AI endpoints

echo "🧪 Testing ResumeBuilder AI API..."
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -X GET http://localhost:5000/api/health | json_pp 2>/dev/null || curl -X GET http://localhost:5000/api/health
echo ""
echo ""

# Test 2: Resume Summarization
echo "2️⃣  Testing Resume Summarization..."
curl -X POST http://localhost:5000/api/ai/summarize-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\n\nSoftware Engineer with 5 years of experience in full-stack development. Expert in JavaScript, Python, and React. Led team of 3 developers on e-commerce platform. Improved page load time by 40%."
  }' | json_pp 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 3: Skills Suggestions
echo "3️⃣  Testing Skills Suggestions..."
curl -X POST http://localhost:5000/api/ai/skills-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "currentSkills": "JavaScript, React, Node.js, MongoDB",
    "targetRole": "Senior Full Stack Developer"
  }' | json_pp 2>/dev/null || echo "Response received"
echo ""
echo ""

echo "✅ Tests complete! Check the responses above."
