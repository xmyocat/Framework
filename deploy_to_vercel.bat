@echo off
echo ==========================================
echo Deploy to Vercel for Permanent URL
echo ==========================================

echo.
echo 🚀 DEPLOYING TO VERCEL (PERMANENT URL)
echo ==========================================
echo.

echo [1/5] Checking if Git is initialized...
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - The Framework"
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

echo.
echo [2/5] Creating Vercel configuration...
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
echo [3/5] Creating deployment package...
if not exist "deploy" mkdir deploy
echo ✅ Ready for deployment

echo.
echo [4/5] Environment variables needed:
echo ==========================================
echo You'll need these environment variables in Vercel:
echo - NEXT_PUBLIC_SUPABASE_URL
echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo - OPENAI_API_KEY
echo - ANTHROPIC_API_KEY (optional)
echo.

echo [5/5] DEPLOYMENT INSTRUCTIONS:
echo ==========================================
echo.
echo 🌐 TO GET PERMANENT URL:
echo.
echo 1. Push to GitHub:
echo    git remote add origin https://github.com/yourusername/framework.git
echo    git push -u origin main
echo.
echo 2. Go to vercel.com
echo 3. Click "New Project"
echo 4. Import your GitHub repository
echo 5. Add environment variables
echo 6. Click Deploy
echo.
echo 7. 🎉 You'll get: your-app-name.vercel.app
echo.
echo 📱 BENEFITS:
echo - Permanent URL from anywhere
echo - HTTPS included (mobile camera works!)
echo - No local server needed
echo - Automatic deployments
echo - Global CDN
echo.

echo 🚀 READY TO DEPLOY?
echo.
echo Next steps:
echo 1. Create GitHub repository
echo 2. Run: git push commands above
echo 3. Deploy on Vercel
echo 4. Enjoy permanent URL!
echo.

echo 💡 ALTERNATIVE: Railway.app
echo - Another easy deployment option
echo - Get your-app.railway.app
echo - Similar setup process
echo.
pause
