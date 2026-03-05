@echo off
echo ==========================================
echo Setting up and Starting The Framework Prototype
echo ==========================================

echo.
echo [1/3] Installing dependencies (if needed)...
call npm list || call npm install

echo.
echo [2/3] Starting development server...
start "Next.js Server" cmd /k "npm run dev"

echo.
echo Waiting for server to warm up...
timeout /t 5 >nul

echo.
echo [3/3] Starting ngrok tunnel (for mobile access)...
echo.
echo Cleaning up existing ngrok sessions...
taskkill /IM ngrok.exe /F >nul 2>&1
timeout /t 2 >nul
echo IMPORTANT: Look at the new window that opens for your HTTPS URL!
echo it will look like: https://[random-string].ngrok-free.app
echo.
start "ngrok Tunnel" cmd /k "npx ngrok http 3000"

echo.
echo Opening local browser...
start http://localhost:3000

echo.
echo Done! 
echo 1. Keep this window and the other two windows OPEN.
echo 2. Use the ngrok URL on your phone for Camera/Mic access.
echo.
pause
