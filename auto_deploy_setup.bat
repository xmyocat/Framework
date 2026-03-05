@echo off
echo ==========================================
echo Automatic Deployment Setup
echo ==========================================

echo.
echo 🚀 This script will automate most of the deployment setup
echo and open the necessary links for you to complete manually.
echo.

echo [1/8] Checking prerequisites...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Installing Git...
    start https://git-scm.com/download/win
    echo Please install Git first, then run this script again.
    pause
    exit /b
)
echo ✅ Git is installed

echo.
echo [2/8] Initializing Git repository...
if not exist ".git" (
    echo Initializing Git...
    git init
    git add .
    git commit -m "Initial commit - The Framework"
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

echo.
echo [3/8] Creating deployment configuration...
if not exist "vercel.json" (
    (
        echo {
        echo   "buildCommand": "npm run build",
        echo   "outputDirectory": ".next",
        echo   "framework": "nextjs",
        echo   "installCommand": "npm install",
        echo   "devCommand": "npm run dev"
        echo }
    ) > vercel.json
    echo ✅ Created vercel.json
)

echo.
echo [4/8] Creating README for deployment...
if not exist "README.md" (
    (
        echo # The Framework
        echo.
        echo A mobile-first learning capture framework with offline support.
        echo.
        echo ## Features
        echo - Mobile PWA with offline support
        echo - Audio/video/photo/text capture
        echo - AI-powered transcription and organization
        echo - Real-time sync
        echo.
        echo ## Environment Variables
        echo - NEXT_PUBLIC_SUPABASE_URL
        echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
        echo - OPENAI_API_KEY
        echo - ANTHROPIC_API_KEY
        echo.
        echo ## Development
        echo npm run dev
        echo.
        echo ## Build
        echo npm run build
    ) > README.md
    echo ✅ Created README.md
)

echo.
echo [5/8] Preparing for GitHub push...
echo.

rem Check if remote already exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ Ready to add GitHub remote
) else (
    echo ✅ GitHub remote already exists
)

echo.
echo [6/8] Opening GitHub for repository creation...
echo.
echo 📋 STEPS TO COMPLETE:
echo ==========================================
echo 1. GitHub will open in a new window
echo 2. Click "New repository" 
echo 3. Name it: framework (or your preferred name)
echo 4. Make it Public
echo 5. Click "Create repository"
echo 6. Copy the repository URL
echo 7. Return here to continue
echo.

timeout /t 3 >nul
start https://github.com/new

echo.
echo Press any key after you've created the GitHub repository...
pause

echo.
echo [7/8] Getting GitHub repository URL...
set /p github_url="Enter your GitHub repository URL (e.g., https://github.com/username/framework.git): "

echo.
echo Adding GitHub remote...
git remote add origin %github_url% 2>nul || git remote set-url origin %github_url%

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo [8/8] Opening Vercel for deployment...
echo.
echo 📋 FINAL STEPS:
echo ==========================================
echo 1. Vercel will open in a new window
echo 2. Click "New Project"
echo 3. Import your GitHub repository
echo 4. Add these environment variables:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY  
echo    - OPENAI_API_KEY
echo    - ANTHROPIC_API_KEY (optional)
echo 5. Click "Deploy"
echo 6. Get your permanent URL!
echo.

timeout /t 3 >nul
start https://vercel.com/new

echo.
echo 🎉 SETUP COMPLETE!
echo ==========================================
echo.
echo ✅ Code pushed to GitHub
echo ✅ Vercel is opening for deployment
echo ✅ Your permanent URL will be: your-name.vercel.app
echo.
echo 📱 After deployment:
echo - Your app works from anywhere in the world
echo - Mobile camera will work (HTTPS)
echo - No local server needed
echo.
echo 📧 Keep this window open for reference
echo.
pause
