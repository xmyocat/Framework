# Self-Hosted Deployment Guide

This guide explains how to deploy The Framework on your school's Proxmox VM instead of using Supabase.

## Prerequisites

- SSH access to the VM: `everett@100.124.92.27`
- Tailscale configured for access
- VM specs: 2 CPUs, 8GB RAM (as shown in your screenshot)

## Development Workflow

### After Every Session (Windows)

Double-click `deploy-and-push.bat` or run in Command Prompt:

```cmd
deploy-and-push.bat
```

This script will:
1. Add all changes to git
2. Commit with timestamp
3. Push to GitHub
4. SSH into VM and deploy automatically

### What the Deploy Script Does

The deployment script (`deploy/deploy-vm.sh`) runs on the VM and:
1. Pulls latest changes from git
2. Installs any new dependencies (`npm install`)
3. Runs database migrations (`prisma migrate deploy`)
4. Rebuilds the application (`npm run build`)
5. Restarts the PM2 process

## Quick Start

### 1. Transfer Project to VM

```bash
# From your local machine, transfer the project
scp -r . everett@100.124.92.27:/home/everett/framework
```

### 2. Run Setup Script on VM

```bash
ssh everett@100.124.92.27
cd /home/everett/framework
chmod +x deploy/vm-setup.sh
./deploy/vm-setup.sh
```

### 3. Configure Environment

Edit `.env.local` with your actual values:

```bash
nano .env.local
```

Required changes:
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `OPENAI_API_KEY`: Your OpenAI API key
- `DATABASE_URL`: Update if you changed the PostgreSQL password

### 4. Start the Application

```bash
pm2 start ecosystem.config.js
```

The app will be available at: `http://100.124.92.27:3000`

### 5. Future Updates (After Every Session)

On Windows, simply run:
```cmd
deploy-and-push.bat
```

This will git push and deploy to your VM automatically.

## Architecture Changes

### What Changed from Supabase

| Feature | Before (Supabase) | After (Self-Hosted) |
|---------|------------------|---------------------|
| **Auth** | Supabase Auth | NextAuth.js with credentials |
| **Database** | Supabase Postgres | Local PostgreSQL via Prisma |
| **Storage** | Supabase Storage | Local filesystem at `/app/uploads` |
| **Session** | Supabase JWT | NextAuth JWT |

### New API Routes

- `/api/auth/[...nextauth]` - Authentication endpoints
- `/api/auth/register` - User registration
- `/api/artifacts` - CRUD for artifacts
- `/api/files/[...path]` - File serving from local storage

### Database Schema

The Prisma schema in `prisma/schema.prisma` defines:
- `User` - Stores user credentials (hashed passwords)
- `Artifact` - Your captured content
- `Collection` - Groupings of artifacts
- `Reflection` - Deeper articulations
- `Profile` - User profile data

## Management Commands

```bash
# View logs
pm2 logs framework

# Restart app
pm2 restart framework

# Stop app
pm2 stop framework

# Update database schema (after code changes)
npx prisma migrate dev

# Generate Prisma client (after schema changes)
npx prisma generate
```

## Troubleshooting

### Database Connection Issues

Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

Verify database exists:
```bash
sudo -u postgres psql -l
```

### File Upload Issues

Check upload directory permissions:
```bash
ls -la /app/uploads
sudo chown -R $USER:$USER /app/uploads
```

### Port Already in Use

Find and kill process using port 3000:
```bash
sudo lsof -ti:3000 | xargs kill -9
```

## Security Considerations

1. **Firewall**: Consider configuring UFW to restrict access
2. **HTTPS**: Use nginx with SSL certificates for production
3. **Secrets**: Never commit `.env.local` to git
4. **Backups**: Set up regular PostgreSQL backups

## Migration from Supabase (Optional)

If you have existing data in Supabase you want to migrate:

1. Export data from Supabase as JSON/CSV
2. Use Prisma's seed functionality to import
3. Copy files from Supabase Storage to `/app/uploads`

## Support

The app is now fully self-contained on your VM with no external dependencies except:
- OpenAI API (for transcription)
- Optional: Anthropic API (for organization)
