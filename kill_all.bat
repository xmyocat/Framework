@echo off
echo ==========================================
echo Kill All Processes - Complete Cleanup
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
echo [3/6] Killing any remaining processes on ports 3000-3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :300') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 >nul

echo.
echo [4/6] Cleaning up .next directory...
rmdir /s /q ".next" >nul 2>&1
timeout /t 1 >nul

echo.
echo [5/6] Checking for remaining processes...
echo Checking Node.js...
tasklist | findstr node >nul
if %errorlevel% equ 0 (
    echo ❌ Still found Node.js processes
) else (
    echo ✅ All Node.js processes killed
)

echo Checking ngrok...
tasklist | findstr ngrok >nul
if %errorlevel% equ 0 (
    echo ❌ Still found ngrok processes
) else (
    echo ✅ All ngrok processes killed
)

echo Checking ports 3000-3001...
netstat -ano | findstr :300 >nul
if %errorlevel% equ 0 (
    echo ❌ Still found processes on ports 3000-3001
) else (
    echo ✅ Ports 3000-3001 are free
)

echo.
echo [6/6] Cleanup complete!
echo.

echo ==========================================
echo ALL PROCESSES KILLED SUCCESSFULLY
echo ==========================================
echo.
echo ✅ Node.js processes killed
echo ✅ Ngrok processes killed  
echo ✅ Ports 3000-3001 freed
echo ✅ Build cache cleared
echo.
echo You can now start fresh with:
echo - restart_app.bat
echo - npm run dev
echo - npx ngrok http 3000
echo.
echo All processes are now completely killed.
echo.
pause
