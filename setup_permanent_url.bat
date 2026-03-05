@echo off
echo ==========================================
echo Permanent URL Setup Options
echo ==========================================

echo.
echo 🌐 PERMANENT URL SOLUTIONS:
echo.
echo Option 1: Ngrok Reserved Domain (Paid)
echo - Get a custom subdomain like: my-framework.ngrok.io
echo - Works from anywhere in the world
echo - Requires ngrok paid plan (~$5/month)
echo.

echo Option 2: Cloud Deployment (Free/Paid)
echo - Deploy to Vercel, Netlify, or Railway
echo - Get a permanent URL like: my-framework.vercel.app
echo - Works from anywhere
echo.

echo Option 3: Self-hosted with Dynamic DNS
echo - Use services like No-IP or DuckDNS
echo - Get a custom domain that points to your IP
echo - Requires port forwarding setup
echo.

echo ==========================================
echo RECOMMENDED: Cloud Deployment
echo ==========================================
echo.
echo For easiest permanent access, deploy to Vercel:
echo 1. Push your code to GitHub
echo 2. Connect Vercel to your GitHub
echo 3. Automatic deployments
echo 4. Permanent URL: your-app.vercel.app
echo.

echo ==========================================
echo SETUP STEPS:
echo ==========================================

echo [1/3] Preparing for cloud deployment...
echo.

echo 📁 Creating deployment configuration...
if not exist "vercel.json" (
    echo { "buildCommand": "npm run build", "outputDirectory": ".next", "framework": "nextjs" } > vercel.json
    echo ✅ Created vercel.json
)

echo.
echo 📦 Creating deployment package...
if not exist "deploy" mkdir deploy
echo ✅ Created deploy directory

echo.
echo 📋 Next Steps for Permanent URL:
echo 1. Create a GitHub repository
echo 2. Push your code to GitHub
echo 3. Sign up at vercel.com
echo 4. Connect Vercel to your GitHub
echo 5. Deploy your app
echo 6. Get permanent URL: your-app.vercel.app
echo.

echo 📱 After deployment:
echo - Your app will work from anywhere
echo - Mobile camera will work (HTTPS)
echo - No need to run local servers
echo - Automatic SSL certificate
echo.

echo 🚀 For immediate testing, use ngrok:
echo run_ngrok_permanent.bat
echo.
pause
