@echo off
echo ==========================================
echo Kill All Ngrok Processes
echo ==========================================

echo.
echo [1/3] Killing all ngrok processes...
taskkill /IM ngrok.exe /F >nul 2>&1
timeout /t 2 >nul

echo.
echo [2/3] Checking for remaining ngrok processes...
tasklist | findstr ngrok >nul
if %errorlevel% equ 0 (
    echo ❌ Still found ngrok processes, killing again...
    taskkill /IM ngrok.exe /F >nul 2>&1
    timeout /t 2 >nul
) else (
    echo ✅ All ngrok processes killed
)

echo.
echo [3/3] Final check...
tasklist | findstr ngrok >nul
if %errorlevel% equ 0 (
    echo ❌ Ngrok processes still running
    echo You may need to restart your computer
) else (
    echo ✅ All ngrok processes successfully killed
)

echo.
echo ==========================================
echo NGROK SESSION CLEARED
echo ==========================================
echo.
echo The ngrok session limit error should now be resolved.
echo You can now start a new ngrok session.
echo.
echo To start ngrok again:
echo npx ngrok http 3000
echo.
echo Or use: restart_app.bat
echo.
pause
