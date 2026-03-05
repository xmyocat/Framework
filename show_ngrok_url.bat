@echo off
echo ==========================================
echo Ngrok URL Display
echo ==========================================

echo.
echo 🔍 Looking for ngrok HTTPS URL...
echo.

echo [1/3] Checking if ngrok is running...
tasklist | findstr ngrok >nul
if %errorlevel% neq 0 (
    echo ❌ ngrok is not running
    echo Starting ngrok...
    start "ngrok Tunnel" cmd /k "npx ngrok http 3000"
    timeout /t 10 >nul
)

echo.
echo [2/3] Attempting to get ngrok URL...
echo Note: This may not work on all systems due to ngrok API changes
echo.

rem Try to get URL from ngrok API (may not work if ngrok is not configured for API access)
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://127.0.0.1:4040/api/tunnels' -ErrorAction Stop; $response.tunnels | Where-Object { $_.proto -eq 'https' } | Select-Object -ExpandProperty public_url } catch { 'Could not fetch URL automatically' }" 2>nul

echo.
echo [3/3] Manual Instructions:
echo ==========================================
echo.
echo 📱 To get the ngrok HTTPS URL:
echo 1. Look for the window titled "ngrok Tunnel"
echo 2. Find the line that says "Forwarding"
echo 3. Copy the HTTPS URL (starts with https://)
echo.
echo Example of what to look for in ngrok window:
echo    Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3000
echo.
echo 📱 Mobile Access:
echo - Use the HTTPS URL from ngrok window
echo - Camera will work on HTTPS but NOT on HTTP
echo.
pause
