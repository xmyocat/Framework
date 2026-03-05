@echo off
echo ==========================================
echo Ngrok Permanent Domain Setup
echo ==========================================

echo.
echo 🌐 NGROK PERMANENT DOMAIN SETUP:
echo ==========================================
echo.
echo To get a permanent ngrok URL:
echo.
echo 1. Sign up at ngrok.com
echo 2. Upgrade to paid plan ($5/month)
echo 3. Reserve a custom domain: your-framework.ngrok.io
echo 4. Update your ngrok.yml config
echo 5. Run ngrok with your custom domain
echo.

echo 📋 STEPS TO SETUP:
echo ==========================================
echo.
echo Step 1: Install ngrok auth token
echo ngrok config add-authtoken YOUR_AUTH_TOKEN
echo.

echo Step 2: Create ngrok config file
echo Create file: ngrok.yml
echo.

echo Step 3: Add this to ngrok.yml:
echo authtoken: YOUR_AUTH_TOKEN
echo domain: your-framework.ngrok.io
echo tunnels:
echo   web:
echo     proto: http
echo     addr: 3000
echo     bind_tls: true
echo.

echo Step 4: Run with custom domain
echo ngrok start web
echo.

echo 🚀 ALTERNATIVE: Use reserved domain
echo ngrok http 3000 --domain=your-framework.ngrok.io
echo.

echo 📱 Benefits:
echo - Same URL everywhere
echo - Works from any country
echo - HTTPS included
echo - Mobile camera works
echo.

echo 💡 QUICK TEST:
echo For now, let's start regular ngrok to test:
echo.

taskkill /IM ngrok.exe /F >nul 2>&1
timeout /t 2 >nul
start "ngrok Tunnel" cmd /k "npx ngrok http 3000"

echo.
echo ✅ Ngrok started with temporary URL
echo Check the ngrok window for current URL
echo.
echo 📝 To get permanent URL:
echo 1. Visit ngrok.com
echo 2. Sign up for paid plan
echo 3. Reserve your domain
echo 4. Update this script with your domain
echo.
pause
