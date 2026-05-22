@echo off
REM Quick test script for Gemini AI endpoints (Windows)

echo.
echo ========================================
echo   ResumeBuilder AI API Test Suite
echo ========================================
echo.

REM Test 1: Health Check
echo 1. Testing Health Check...
curl -X GET http://localhost:5000/api/health
echo.
echo.

REM Test 2: Resume Summarization
echo 2. Testing Resume Summarization...
curl -X POST http://localhost:5000/api/ai/summarize-resume ^
  -H "Content-Type: application/json" ^
  -d "{\"resumeText\": \"John Doe\n\nSoftware Engineer with 5 years experience. Expert in JavaScript, Python, React.\"}"
echo.
echo.

REM Test 3: Skills Suggestions
echo 3. Testing Skills Suggestions...
curl -X POST http://localhost:5000/api/ai/skills-suggestions ^
  -H "Content-Type: application/json" ^
  -d "{\"currentSkills\": \"JavaScript, React, Node.js\", \"targetRole\": \"Senior Full Stack Developer\"}"
echo.
echo.

echo ========================================
echo Tests complete! Check responses above.
echo ========================================
