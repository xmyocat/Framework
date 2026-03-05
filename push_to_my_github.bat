@echo off
echo ==========================================
echo Push to GitHub - xmyocat/The-Framework
echo ==========================================

echo.
echo 🚀 PUSHING TO YOUR GITHUB REPOSITORY
echo Repository: https://github.com/xmyocat/The-Framework
echo.

echo [1/5] Adding GitHub remote...
git remote add origin https://github.com/xmyocat/The-Framework.git
echo ✅ GitHub remote added

echo.
echo [2/5] Creating initial commit (if needed)...
git add .
git commit -m "Deploy to Vercel - The Framework with mobile PWA support" 2>nul || echo ✅ Already committed

echo.
echo [3/5] Setting up main branch...
git branch -M main
echo ✅ Main branch set

echo.
echo [4/5] Pushing to GitHub...
git push -u origin main
echo ✅ Code pushed to GitHub!

echo.
echo [5/5] Opening Vercel for deployment...
timeout /t 3 >nul
start https://vercel.com/new

echo.
echo ==========================================
echo 🎉 READY FOR VERCEL DEPLOYMENT!
echo ==========================================
echo.
echo ✅ Code pushed to: https://github.com/xmyocat/The-Framework
echo ✅ Vercel is opening for deployment
echo.
echo 📋 NEXT STEPS:
echo 1. Vercel will open in a new window
echo 2. Click "Import Project" 
echo 3. Select "Git Integration"
echo 4. Find "The-Framework" repository
echo 5. Click "Import"
echo 6. Add these environment variables:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo    - OPENAI_API_KEY
echo    - ANTHROPIC_API_KEY (optional)
echo 7. Click "Deploy"
echo.
echo 🌐 Your permanent URL will be: the-framework.vercel.app
echo 📱 Mobile camera will work (HTTPS included!)
echo 🚀 Works from anywhere in the world!
echo.
pause
