@echo off
:: Windows deployment script - Git push + Deploy to VM
:: Run this after every session to push code and update server

echo ====================================
echo Framework - Git Push + VM Deploy
echo ====================================
echo.

:: Git operations
echo [1/4] Adding changes to git...
git add -A

echo [2/4] Committing with timestamp...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
git commit -m "Update: %mydate% %mytime%"

echo [3/4] Pushing to GitHub...
git push origin main

echo [4/4] Deploying to VM...
ssh everett@100.124.92.27 "cd /home/everett/framework && ./deploy/deploy-vm.sh"

echo.
echo ====================================
echo Deployment Complete!
echo ====================================
echo VM URL: http://100.124.92.27:3000
echo.
pause
