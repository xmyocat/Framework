@echo off
echo ==========================================
echo The Framework - Access URLs
echo ==========================================

echo.
echo [1/3] Getting your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do set IP=%%a
set IP=%IP: =%

echo.
echo [2/3] Checking server status...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✅ Server is running on port 3000
) else (
    echo ❌ Server not found on port 3000
    echo Starting server...
    start "Next.js Server" cmd /k "npm run dev"
    timeout /t 10 >nul
)

echo.
echo [3/3] Access URLs:
echo ==========================================
echo 🖥️  Desktop:     http://localhost:3000
echo 📱 Local WiFi:   http://%IP%:3000
echo.
echo 🌐 Mobile Access Options:
echo 1. Use Local WiFi URL above (same network)
echo 2. Check ngrok window for HTTPS URL
echo.
echo 📱 Safari Instructions:
echo - Open Safari on iPhone/iPad
echo - Enter the Local WiFi URL above
echo - Or use ngrok HTTPS URL from ngrok window
echo.
pause
