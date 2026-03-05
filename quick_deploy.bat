@echo off
echo ==========================================
echo Quick Deploy - One Click Setup
echo ==========================================

echo.
echo 🚀 QUICK DEPLOY TO VERCEL
echo ==========================================
echo.
echo This will automate everything and open the right links
echo for you to complete the manual steps.
echo.

echo 📋 WHAT THIS SCRIPT DOES:
echo ✅ Initializes Git repository
echo ✅ Creates deployment configuration  
echo ✅ Opens GitHub for repo creation
echo ✅ Pushes code to GitHub
echo ✅ Opens Vercel for deployment
echo.

echo 📋 WHAT YOU NEED TO DO:
echo 1. Create GitHub repository (link opens automatically)
echo 2. Deploy on Vercel (link opens automatically)
echo 3. Add environment variables
echo.

echo.
echo Starting automated setup...
echo.

rem Check if this is first run
if not exist ".deploy_setup_complete" (
    echo [1/5] First-time setup...
    goto first_setup
) else (
    echo [1/5] Already setup, opening deployment links...
    goto open_links
)

:first_setup
echo Initializing Git repository...
if not exist ".git" (
    git init
    git add .
    git commit -m "Initial commit - The Framework"
    echo ✅ Git initialized
)

echo Creating deployment config...
if not exist "vercel.json" (
    (
        echo {
        echo   "buildCommand": "npm run build",
        echo   "outputDirectory": ".next", 
        echo   "framework": "nextjs"
        echo }
    ) > vercel.json
    echo ✅ Vercel config created
)

echo Marking setup as complete...
echo. > .deploy_setup_complete

:open_links
echo.
echo [2/5] Opening GitHub to create repository...
timeout /t 2 >nul
start https://github.com/new

echo.
echo [3/5] Opening Vercel for deployment...
timeout /t 2 >nul  
start https://vercel.com/new

echo.
echo [4/5] Opening ngrok for immediate testing...
timeout /t 2 >nul
start cmd /k "npx ngrok http 3000"

echo.
echo [5/5] Setup complete! Here's what to do:
echo.
echo ==========================================
echo 📋 YOUR ACTION ITEMS:
echo ==========================================
echo.
echo 1️⃣ GITHUB SETUP:
echo - GitHub tab opened: Create new repository
echo - Name: "framework" (or your choice)
echo - Make it Public
echo - Click "Create repository"
echo.
echo 2️⃣ PUSH TO GITHUB:
echo - Copy the repository URL from GitHub
echo - Run: git remote add origin [URL]
echo - Run: git push -u origin main
echo.
echo 3️⃣ DEPLOY ON VERCEL:
echo - Vercel tab opened: Click "New Project"
echo - Import your GitHub repository
echo - Add environment variables:
echo   • NEXT_PUBLIC_SUPABASE_URL
echo   • NEXT_PUBLIC_SUPABASE_ANON_KEY
echo   • OPENAI_API_KEY
echo   • ANTHROPIC_API_KEY (optional)
echo - Click "Deploy"
echo.
echo 4️⃣ GET PERMANENT URL:
echo - Wait for deployment to complete
echo - Your URL: your-app-name.vercel.app
echo - Works from anywhere in the world!
echo.
echo 5️⃣ IMMEDIATE TESTING:
echo - ngrok window opened for temporary URL
echo - Use ngrok URL while waiting for deployment
echo.
echo 🎯 RESULT:
echo - Permanent URL from anywhere
echo - Mobile camera works (HTTPS)
echo - No local server needed
echo.
echo ==========================================
echo.
echo Keep this window open for reference!
echo.
pause
