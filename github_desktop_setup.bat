@echo off
echo ==========================================
echo GitHub Desktop Setup - 99% Automated
echo ==========================================

echo.
echo 🚀 GITHUB DESKTOP SETUP FOR THE FRAMEWORK
echo ==========================================
echo.

echo [1/8] Downloading GitHub Desktop...
echo Opening download page in 3 seconds...
timeout /t 3 >nul
start https://desktop.github.com/

echo.
echo [2/8] Installation Instructions:
echo ==========================================
echo 1. Download GitHub Desktop from the opened page
echo 2. Run the installer (click Next, Next, Install, Finish)
echo 3. Launch GitHub Desktop
echo 4. Sign in with your GitHub account (xmyocat)
echo 5. Continue to the next step when ready
echo.

echo Press any key when GitHub Desktop is installed and you're signed in...
pause

echo.
echo [3/8] Preparing your repository...
echo Your project folder: C:\Users\xmyoc\OneDrive\Documents\code\Framework
echo.

echo [4/8] GitHub Desktop Steps:
echo ==========================================
echo 1. In GitHub Desktop, click: File > Add Local Repository
echo 2. Browse to: C:\Users\xmyoc\OneDrive\Documents\code\Framework
echo 3. Click "Add Repository"
echo 4. GitHub Desktop will detect it's not yet published
echo 5. Click "Publish repository"
echo.

echo Press any key when you see the "Publish repository" screen...
pause

echo.
echo [5/8] Publishing to GitHub:
echo ==========================================
echo 1. Repository name: The-Framework (should be pre-filled)
echo 2. Description: Mobile PWA learning capture framework
echo 3. Visibility: Public
echo 4. Keep this code private: UNCHECKED
echo 5. Click "Publish repository"
echo.

echo Press any key after publishing is complete...
pause

echo.
echo [6/8] Opening Vercel for deployment...
timeout /t 2 >nul
start https://vercel.com/new

echo.
echo [7/8] Vercel Deployment Steps:
echo ==========================================
echo 1. On Vercel, click "Import Git Repository"
echo 2. Enter: https://github.com/xmyocat/The-Framework.git
echo 3. Click "Import"
echo 4. Your repository should now have files!
echo.

echo Press any key when you see the Vercel import screen...
pause

echo.
echo [8/8] Final Deployment Configuration:
echo ==========================================
echo 1. Framework Preset: Next.js (should auto-detect)
echo 2. Build Command: npm run build
echo 3. Install Command: npm install
echo 4. Output Directory: .next
echo.

echo 🌐 Environment Variables to Add:
echo ==========================================
echo - NEXT_PUBLIC_SUPABASE_URL
echo - NEXT_PUBLIC_SUPABASE_ANON_KEY  
echo - OPENAI_API_KEY
echo - ANTHROPIC_API_KEY (optional)
echo.

echo 🎯 FINAL RESULT:
echo ==========================================
echo ✅ Permanent URL: the-framework.vercel.app
echo ✅ Works from anywhere in the world
echo ✅ Mobile camera works (HTTPS)
echo ✅ No local server needed
echo ✅ Automatic SSL certificate
echo.

echo 📱 After deployment, your Framework will be accessible from anywhere!
echo.
echo ==========================================
echo SETUP COMPLETE!
echo ==========================================
echo.
echo Your GitHub Desktop + Vercel setup is now automated!
echo Follow the on-screen instructions and you'll have a permanent URL.
echo.
pause
