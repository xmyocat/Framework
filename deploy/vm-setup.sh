#!/bin/bash
# Deployment script for The Framework on Proxmox VM
# Run this on the VM after transferring the project

set -e

echo "=================================="
echo "The Framework - VM Setup Script"
echo "=================================="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
echo "Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE USER framework WITH PASSWORD 'framework_password';
CREATE DATABASE framework OWNER framework;
GRANT ALL PRIVILEGES ON DATABASE framework TO framework;
EOF

# Create upload directory
echo "Creating upload directories..."
sudo mkdir -p /app/uploads/{audio,images,video}
sudo chown -R $USER:$USER /app/uploads

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Navigate to app directory
cd /home/everett/framework

# Install dependencies
echo "Installing Node dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "Building application..."
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'framework',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Setup environment file
echo "Creating environment file..."
cp .env.local.template .env.local
echo "⚠️  Please edit .env.local with your actual values:"
echo "   - DATABASE_URL (update password if needed)"
echo "   - NEXTAUTH_SECRET (generate a random string)"
echo "   - OPENAI_API_KEY"

# Start with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo "Application should be running at: http://100.124.92.27:3000"
echo ""
echo "Useful commands:"
echo "  pm2 logs framework     - View logs"
echo "  pm2 restart framework - Restart app"
echo "  pm2 stop framework    - Stop app"
echo ""
echo "Don't forget to:"
echo "  1. Edit .env.local with your actual API keys"
echo "  2. Set up a proper NEXTAUTH_SECRET"
echo "  3. Configure firewall if needed: sudo ufw allow 3000"
