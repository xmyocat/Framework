#!/bin/bash
# Deploy script to run on the VM after git pull
# This script updates dependencies, runs migrations, rebuilds, and restarts the app

set -e

echo "=================================="
echo "Framework Deployment Script (VM)"
echo "=================================="

cd /home/everett/framework

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Building application..."
npm run build

echo "Restarting PM2 process..."
pm2 restart framework || pm2 start ecosystem.config.js

echo ""
echo "=================================="
echo "Deployment Complete!"
echo "=================================="
echo "App available at: http://100.124.92.27:3000"
echo ""
