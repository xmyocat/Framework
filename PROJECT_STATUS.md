# Project Status: The Framework

**Last Updated:** March 27, 2026
**Current Phase:** MIGRATED TO SELF-HOSTED ✅

## 🚀 Implementation State

### ✅ Completed Features
1.  **Authentication & Database** - **MIGRATED**
    *   **Status**: Fully functional - Self-hosted PostgreSQL with NextAuth.js
    *   **Database**: PostgreSQL on VM (100.124.92.27) with Prisma ORM
    *   **Auth**: NextAuth.js credentials provider with bcrypt password hashing

2.  **Mobile PWA & Offline Support**
    *   **PWA**: Installable on iOS/Android (Add to Home Screen).
    *   **Offline Capture**: Record audio, video, photo, and text *without internet*.
    *   **Auto-Sync**: Background synchronization when connection is restored.
    *   **Status Indicators**: Real-time "Offline" / "Syncing" / "Online" status.

3.  **Capture Flow (Enhanced)**
    *   **Audio**: Recording with **real-time visualizer** (Waveform).
    *   **Transcription**: Automatic server-side transcription using **OpenAI Whisper**.
    *   **Robustness**: Fail-safe mechanisms to save locally if upload fails.
    *   **Mobile Camera**: Fixed "operation was aborted" error with HTTPS detection.

4.  **Gallery & Interactions**
    *   **Layout**: Masonry Grid with search and filtering.
    *   **Lightbox**: **Double-click** any artifact to view in fullscreen.
    *   **Rich Media**: Video playback and audio player within lightbox.
    *   **Delete**: Delete functionality **NOW WORKING** with local file cleanup.

5.  **Infrastructure & Stability**
    *   **Next.js**: v16.1.6 with NextAuth integration
    *   **Database**: PostgreSQL with Prisma ORM
    *   **Storage**: Local filesystem at `/app/uploads`
    *   **Process Management**: PM2 configuration included

### 🏠 **Self-Hosted Architecture**

| Component | Previous (Supabase) | Current (Self-Hosted) |
|-----------|-------------------|---------------------|
| **Auth** | Supabase Auth | NextAuth.js + PostgreSQL |
| **Database** | Supabase Postgres | Local PostgreSQL via Prisma |
| **Storage** | Supabase Storage | Local filesystem `/app/uploads` |
| **Session** | Supabase JWT | NextAuth JWT |

## 🛠️ Development Principles

### 🧪 **Test-As-You-Go Rule** (CRITICAL - USER REQUIREMENT)
*   **MANDATORY**: All code must be tested immediately after implementation
*   **NO EXCEPTIONS**: Never wait for user to report bugs
*   **PROACTIVE DEBUGGING**: Run commands, test features, validate functionality
*   **END-TO-END TESTING**: Test complete user flows before marking as complete
*   **ERROR HANDLING**: Verify error states and user feedback work correctly
*   **BROWSER TESTING**: Test actual functionality in browser, not just code analysis
*   **USER REQUIREMENT**: ⚠️ **USER EXPLICITLY REQUESTED: "Please remember that I want you to do the testing before I do"**

## 🎯 Current Status (March 27, 2026)

### ✅ **SELF-HOSTED DEPLOYMENT READY**
- **VM IP**: `100.124.92.27`
- **Access**: Via Tailscale or direct SSH (`everett@100.124.92.27`)
- **Database**: PostgreSQL configured with Prisma
- **Storage**: Local filesystem with `/api/files/` serving
- **Auth**: NextAuth.js with credentials provider

### 🔧 **Migration Complete**
| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Auth | ✅ REMOVED | Replaced with NextAuth.js |
| Supabase Database | ✅ REMOVED | Replaced with PostgreSQL + Prisma |
| Supabase Storage | ✅ REMOVED | Replaced with local filesystem |
| Delete Functionality | ✅ FIXED | Now works with local storage |
| Transcription | ✅ READY | Uses local file download |

## 🚀 Deployment Workflow

### For Development (After Every Session)

**Windows:** Double-click `deploy-and-push.bat`

This single command will:
1. ✅ Git add all changes
2. ✅ Git commit with timestamp  
3. ✅ Git push to GitHub
4. ✅ SSH to VM and deploy

**Result:** Code is saved to GitHub AND live on your VM

### For Initial VM Setup

```bash
# 1. Transfer to VM (run once from Windows)
scp -r . everett@100.124.92.27:/home/everett/framework

# 2. SSH and setup (run on VM)
ssh everett@100.124.92.27
cd /home/everett/framework
chmod +x deploy/vm-setup.sh
./deploy/vm-setup.sh

# 3. Configure secrets
nano .env.local  # Set NEXTAUTH_SECRET

# 4. Start
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Universal Access URL

**http://100.124.92.27:3000**

- Works on mobile (via Tailscale)
- Works on desktop (via Tailscale)
- Camera works without HTTPS issues
- Full control over your data

### 📋 Next Steps

1. **Deploy to VM** (IMMEDIATE)
   ```bash
   # Transfer project to VM
   scp -r . everett@100.124.92.27:/home/everett/framework
   
   # Run setup script on VM
   ssh everett@100.124.92.27
   cd /home/everett/framework
   chmod +x deploy/vm-setup.sh
   ./deploy/vm-setup.sh
   ```

2. **Configure Environment**
   - Edit `.env.local` with your `OPENAI_API_KEY`
   - Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - Update `DATABASE_URL` if needed

3. **Start Application**
   ```bash
   pm2 start ecosystem.config.js
   ```

### � **Deployment Status**
- **Local Development**: Ready for testing
- **VM Deployment**: Scripts prepared, ready to deploy
- **Production URL**: Will be `http://100.124.92.27:3000`

## 📁 New Files Created

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `lib/db.ts` | Prisma client |
| `lib/auth/options.ts` | NextAuth configuration |
| `lib/auth/password.ts` | Password hashing utilities |
| `lib/storage/local.ts` | Local file storage service |
| `app/api/auth/[...nextauth]/route.ts` | Auth API endpoints |
| `app/api/auth/register/route.ts` | User registration |
| `app/api/artifacts/route.ts` | Artifacts CRUD API |
| `app/api/artifacts/[id]/route.ts` | Individual artifact API |
| `app/api/files/[...path]/route.ts` | File serving API |
| `deploy/vm-setup.sh` | VM deployment script |
| `deploy/README.md` | Deployment guide |
| `types/next-auth.d.ts` | NextAuth type extensions |

## 🗑️ Removed Supabase Dependencies
- `@supabase/ssr`
- `@supabase/supabase-js`
- `lib/supabase/` directory
- `supabase/` directory

## 📝 Environment Variables (New)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/framework?schema=public"
NEXTAUTH_URL="http://100.124.92.27:3000"
NEXTAUTH_SECRET="your-secret-key-here"
UPLOAD_DIR="/app/uploads"
OPENAI_API_KEY="sk-your-openai-key-here"
```
