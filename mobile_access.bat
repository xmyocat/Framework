@echo off
echo ==========================================
echo Mobile Camera Access - HTTPS Required
echo ==========================================

echo.
echo 📱 MOBILE CAMERA REQUIRES HTTPS
echo.
echo Mobile browsers block camera access on HTTP URLs.
echo You MUST use the ngrok HTTPS URL for camera to work.
echo.

echo [1/3] Checking ngrok status...
tasklist | findstr ngrok >nul
if %errorlevel% equ 0 (
    echo ✅ ngrok is running
) else (
    echo ❌ ngrok not found, starting it...
    start "ngrok Tunnel" cmd /k "npx ngrok http 3000"
    timeout /t 5 >nul
)

echo.
echo [2/3] Getting your local IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do set IP=%%a
set IP=%IP: =%

echo.
echo [3/3] MOBILE ACCESS OPTIONS:
echo ==========================================
echo.
echo ❌ WILL NOT WORK (HTTP):
echo    http://localhost:3000
echo    http://%IP%:3000
echo.
echo ✅ WILL WORK (HTTPS):
echo    Look in the ngrok window for the HTTPS URL
echo    It looks like: https://random-chars.ngrok-free.app
echo.
echo 📱 STEPS:
echo 1. Find the ngrok window that opened
echo 2. Copy the HTTPS URL from that window
echo 3. Open Safari on your mobile device
echo 4. Paste the HTTPS URL
echo 5. Camera should now work!
echo.
echo 🔍 If ngrok window is not visible, check your taskbar
echo    for a window titled "ngrok Tunnel"
echo.
pause
