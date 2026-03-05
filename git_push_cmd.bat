@echo off
echo ==========================================
echo Git Push via Command Prompt
echo ==========================================

echo.
echo 🚀 PUSHING TO GITHUB - Command Prompt
echo.

cd /d "C:\Users\xmyoc\OneDrive\Documents\code\Framework"

echo [1/6] Initializing Git repository...
git init
echo.

echo [2/6] Adding all files...
git add .
echo.

echo [3/6] Creating commit...
git commit -m "Deploy to Vercel - The Framework with mobile PWA support"
echo.

echo [4/6] Adding GitHub remote...
git remote add origin https://github.com/xmyocat/The-Framework.git
echo.

echo [5/6] Setting main branch...
git branch -M main
echo.

echo [6/6] Pushing to GitHub...
git push -u origin main
echo.

echo ==========================================
echo ✅ PUSH COMPLETE!
echo ==========================================
echo.
echo Now go to Vercel and deploy your repository!
echo.
pause
