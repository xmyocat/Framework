@echo off
:: FULLY AUTOMATED: Git Push + VM Deploy + Vercel Delete
:: Run this at the end of each session - one click does everything

echo ====================================
echo Framework - Automated Deployment
echo ====================================
echo.

:: Step 1: Git operations
echo [1/5] Adding changes to git...
git add -A

echo [2/5] Committing with timestamp...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
git commit -m "Auto-deploy: %mydate% %mytime%"

echo [3/5] Pushing to GitHub...
git push origin main

:: Step 4: Deploy to VM via SSH
echo [4/5] Deploying to VM (100.124.92.27)...
echo This may take a few minutes...
ssh everett@100.124.92.27 "cd /home/everett/framework && ./deploy/deploy-vm.sh"

:: Step 5: Delete Vercel deployment
echo [5/5] Removing Vercel deployment...
npx vercel remove framework-psii --yes

echo.
echo ====================================
echo DEPLOYMENT COMPLETE!
echo ====================================
echo.
echo Your app is now live at:
echo    http://100.124.92.27:3000
echo.
echo GitHub: Updated
echo VM: Deployed
echo Vercel: Deleted
echo.
pause
