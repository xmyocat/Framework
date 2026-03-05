@echo off
echo ==========================================
echo Killing All Processes and Restarting The Framework
echo ==========================================

echo.
echo [1/6] Killing all Node.js processes...
taskkill /IM node.exe /F >nul 2>&1
timeout /t 2 >nul

echo.
echo [2/6] Killing all ngrok processes...
taskkill /IM ngrok.exe /F >nul 2>&1
timeout /t 2 >nul

echo.
echo [3/6] Cleaning up .next directory...
rmdir /s /q ".next" >nul 2>&1
timeout /t 1 >nul

echo.
echo [4/6] Installing dependencies (if needed)...
call npm list >nul 2>&1 || call npm install

echo.
echo [5/6] Starting development server...
start "Next.js Server" cmd /k "npm run dev"

echo.
echo Waiting for server to warm up...
timeout /t 8 >nul

echo.
echo [6/6] Starting ngrok tunnel...
echo Cleaning up any existing ngrok sessions...
taskkill /IM ngrok.exe /F >nul 2>&1
timeout /t 2 >nul
start "ngrok Tunnel" cmd /k "npx ngrok http 3000"

echo.
echo Waiting for ngrok to initialize...
timeout /t 10 >nul

echo.
echo ==========================================
echo FRAMEWORK RESTARTED SUCCESSFULLY!
echo ==========================================

echo.
echo 🖥️  Desktop Access: http://localhost:3000
echo.

echo 📱 Mobile Access:
echo ==========================================
echo ❌ Camera will NOT work on HTTP URLs:
echo    http://localhost:3000
echo.

echo ✅ Camera WILL work on HTTPS ngrok URL:
echo    Check the "ngrok Tunnel" window for the HTTPS URL
echo    It looks like: https://[random-string].ngrok-free.app
echo.

echo 📱 Safari Instructions:
echo 1. Find the ngrok window (check taskbar if needed)
echo 2. Copy the HTTPS URL from that window
echo 3. Open Safari on your iPhone/iPad
echo 4. Paste the HTTPS URL
echo 5. Camera will now work!
echo.

echo 🔍 Keep all windows open for the app to work properly!
echo.
pause
