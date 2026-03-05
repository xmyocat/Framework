@echo off
echo ==========================================
echo Push to GitHub Helper
echo ==========================================

echo.
echo 📤 PUSH TO GITHUB
echo ==========================================
echo.

set /p github_url="Enter your GitHub repository URL: 
(e.g., https://github.com/username/framework.git): "

echo.
echo Adding GitHub remote...
git remote add origin %github_url% 2>nul || git remote set-url origin %github_url%

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Pushed to GitHub successfully!
echo.
echo Next: Go to Vercel and deploy your repository
echo.
start https://vercel.com/new
pause
