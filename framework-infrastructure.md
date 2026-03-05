# The Framework — Technical Infrastructure

## Overview

A personal learning documentation tool designed for low-friction capture and rich reflection. Students can quickly deposit thoughts, images, and audio from any device, then later organize and articulate their understanding. Teachers have read-only access to view student learning artifacts.

## Core Design Principles

1. **Capture is instant** — Under 10 seconds from app open to saved artifact
2. **Reflection is optional but supported deeply** — When ready, students can layer rich context onto captures
3. **Organization is automatic** — LLM-powered tagging and grouping reduces cognitive load
4. **Works anywhere** — Phone captures anytime, full interface on computer
5. **Privacy-first** — Student controls what teachers can see

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│   Phone (PWA)   │────────▶│    Supabase     │◀────────┐
│  Capture-first  │         │  (Cloud Inbox)  │         │
│    interface    │         │                 │         │
└─────────────────┘         │  - Auth         │         │
                            │  - Database     │         │
                            │  - File Storage │         │
                            └────────┬────────┘         │
                                     │                  │
                                     ▼                  │
                            ┌─────────────────┐         │
                            │ Local Computer  │─────────┘
                            │   (Next.js)     │
                            │                 │
                            │ - Full UI       │
                            │ - Transcription │
                            │ - LLM Tagging   │
                            │ - Gallery       │
                            └─────────────────┘
```

### How Sync Works

1. **Phone captures** → Supabase (immediately if online, queued if offline)
2. **Raw artifacts** sit in Supabase with `processed: false`
3. **When local computer runs the app:**
   - Fetches unprocessed artifacts
   - Runs Whisper transcription on audio
   - Runs Claude API for auto-tagging and subject detection
   - Updates artifacts with processed data
   - Marks as `processed: true`
4. **Gallery and reflection** happen on local computer (full interface)
5. **Changes sync back** to Supabase for cross-device access

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | PWA for phone, full app for desktop |
| **Database** | Supabase (PostgreSQL) | Cloud database, always available |
| **File Storage** | Supabase Storage | Audio and image blob storage |
| **Auth** | Supabase Auth | Student/teacher accounts |
| **Transcription** | OpenAI Whisper (local or API) | Audio → searchable text |
| **Auto-Organization** | Claude API | Tagging, subject detection, connections |
| **Styling** | Tailwind CSS | Rapid UI development |

---

## Data Model

### Artifact (atomic unit of capture)

```sql
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  type text check (type in ('audio', 'image', 'text', 'mixed')),
  
  -- Raw content
  file_urls text[], -- Array of storage URLs
  text_content text, -- Direct text input or annotations
  
  -- Processed content
  transcript text, -- Whisper output for audio
  thumbnail_url text, -- Auto-generated for gallery
  
  -- Organization (auto + manual)
  auto_tags text[],
  user_tags text[],
  subject text,
  connections uuid[], -- Related artifact IDs
  
  -- Metadata
  processed boolean default false,
  visibility text default 'private' check (visibility in ('private', 'teacher', 'public')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Reflection (deeper articulation)

```sql
create table reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  artifact_id uuid references artifacts(id), -- Can be null for standalone
  collection_id uuid references collections(id), -- Can be null
  
  -- Rich content stored as JSON blocks
  content_blocks jsonb, -- [{type: 'text', content: '...'}, {type: 'audio', url: '...'}]
  
  depth_indicator int, -- 1-5, self-assessed or LLM-suggested
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Collection (groupings)

```sql
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text,
  type text check (type in ('auto', 'manual')),
  artifact_ids uuid[],
  cover_image_url text,
  subject text,
  date_range tstzrange,
  
  created_at timestamptz default now()
);
```

### User Profile

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  role text check (role in ('student', 'teacher')),
  display_name text,
  settings jsonb default '{}',
  linked_teacher_ids uuid[], -- Teachers who can view this student's work
  
  created_at timestamptz default now()
);
```

---

## File Structure

```
framework/
├── app/
│   ├── (student)/
│   │   ├── capture/
│   │   │   └── page.tsx           # Main capture interface (3 big buttons)
│   │   ├── gallery/
│   │   │   └── page.tsx           # Visual masonry grid of artifacts
│   │   ├── artifact/
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Detail view + reflection editor
│   │   ├── collections/
│   │   │   └── page.tsx           # Grouped artifacts view
│   │   └── layout.tsx             # Student nav wrapper
│   │
│   ├── (teacher)/
│   │   ├── students/
│   │   │   └── [id]/
│   │   │       └── page.tsx       # View individual student's work
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Overview of all linked students
│   │   └── layout.tsx             # Teacher nav wrapper
│   │
│   ├── api/
│   │   ├── artifacts/
│   │   │   ├── route.ts           # CRUD operations
│   │   │   └── process/
│   │   │       └── route.ts       # Trigger processing for unprocessed
│   │   ├── transcribe/
│   │   │   └── route.ts           # Whisper integration
│   │   ├── organize/
│   │   │   └── route.ts           # Claude API for auto-tagging
│   │   ├── collections/
│   │   │   └── route.ts
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts       # Supabase auth callback
│   │
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing/redirect
│   └── globals.css
│
├── components/
│   ├── capture/
│   │   ├── AudioRecorder.tsx      # Push-to-record with pause/resume
│   │   ├── PhotoCapture.tsx       # Camera interface
│   │   ├── TextInput.tsx          # Quick text capture
│   │   └── CaptureButton.tsx      # The big button component
│   │
│   ├── gallery/
│   │   ├── ArtifactGrid.tsx       # Masonry layout
│   │   ├── ArtifactCard.tsx       # Individual card (thumbnail + preview)
│   │   ├── FilterBar.tsx          # Subject/date/type filters
│   │   └── SearchBar.tsx          # Full-text search
│   │
│   ├── artifact/
│   │   ├── ArtifactViewer.tsx     # Full artifact display
│   │   ├── AudioPlayer.tsx        # Playback with waveform
│   │   ├── ImageViewer.tsx        # Zoomable image
│   │   ├── TranscriptView.tsx     # Formatted transcript
│   │   ├── ReflectionEditor.tsx   # Rich editor for reflections
│   │   ├── ConnectionPanel.tsx    # Related artifacts sidebar
│   │   └── VisibilityToggle.tsx   # Private/teacher/public
│   │
│   ├── collections/
│   │   ├── CollectionCard.tsx     # Stack visualization
│   │   └── CollectionGrid.tsx
│   │
│   └── shared/
│       ├── TagSelector.tsx        # Add/remove tags
│       ├── SubjectBadge.tsx
│       ├── LoadingSpinner.tsx
│       └── OfflineIndicator.tsx   # Show when queued offline
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Auth middleware
│   │
│   ├── processing/
│   │   ├── transcription.ts       # Whisper integration
│   │   ├── organization.ts        # Claude API for tagging
│   │   ├── thumbnails.ts          # Generate thumbnails
│   │   └── processor.ts           # Main processing pipeline
│   │
│   ├── hooks/
│   │   ├── useArtifacts.ts        # Fetch/mutate artifacts
│   │   ├── useCapture.ts          # Capture flow state
│   │   ├── useOfflineQueue.ts     # IndexedDB queue management
│   │   └── useProcessing.ts       # Trigger/monitor processing
│   │
│   ├── utils/
│   │   ├── audio.ts               # Audio recording utilities
│   │   ├── camera.ts              # Camera access utilities
│   │   └── storage.ts             # File upload helpers
│   │
│   └── types.ts                   # TypeScript type definitions
│
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   ├── icons/                     # App icons for PWA
│   └── ...
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
│
├── .env.local.example             # Environment variables template
├── next.config.js                 # Next.js config (PWA settings)
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Key User Interfaces

### 1. Capture Screen (Phone-First)

The default view when opening the app. Three large, thumb-friendly buttons:

```
┌─────────────────────────────┐
│                             │
│      ┌─────────────┐        │
│      │             │        │
│      │   🎤 Audio  │        │
│      │             │        │
│      └─────────────┘        │
│                             │
│   ┌──────────┐ ┌──────────┐ │
│   │          │ │          │ │
│   │ 📷 Photo │ │ ✏️ Text  │ │
│   │          │ │          │ │
│   └──────────┘ └──────────┘ │
│                             │
│  ┌─────────────────────────┐│
│  │ Recent: [thumb] [thumb] ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

**Audio flow:**
1. Tap Audio → Recording starts (visual waveform)
2. Tap Pause → Recording pauses (think time)
3. Tap Resume → Continue recording
4. Tap Done → Saves, optional quick tag, returns to capture screen

**Photo flow:**
1. Tap Photo → Camera opens
2. Snap → Preview with "Add voice note?" option
3. Save → Optional quick tag, returns to capture screen

### 2. Gallery Screen

Masonry grid showing all artifacts visually:

```
┌─────────────────────────────┐
│ [Search...]    [Filters ▼]  │
├─────────────────────────────┤
│ ┌─────┐ ┌─────────┐ ┌─────┐ │
│ │ img │ │   img   │ │~~~~~│ │
│ │     │ │         │ │audio│ │
│ └─────┘ │         │ │"The"│ │
│ ┌───────┴─┐ ┌─────┴─┴─────┐ │
│ │  text   │ │     img     │ │
│ │ preview │ │             │ │
│ └─────────┘ └─────────────┘ │
│ ┌─────┐ ┌─────┐ ┌─────────┐ │
│ │~~~~~│ │ img │ │  text   │ │
│ ...                         │
└─────────────────────────────┘
```

- Images show the image as thumbnail
- Audio shows waveform + first line of transcript
- Text shows preview of content
- Tap any card → Detail view

### 3. Artifact Detail + Reflection

```
┌─────────────────────────────┐
│ ← Back              [Share] │
├─────────────────────────────┤
│                             │
│   [    Full Artifact     ]  │
│   [   Image/Audio/Text   ]  │
│                             │
├─────────────────────────────┤
│ Created: Jan 9, 2026        │
│ Subject: Electronics        │
│ Tags: [arduino] [sensors]   │
├─────────────────────────────┤
│ Transcript:                 │
│ "So I was working on..."    │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ + Add to this artifact  │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ✍️ Write Reflection     │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Related:                    │
│ [thumb] [thumb] [thumb]     │
├─────────────────────────────┤
│ Visibility: [Private ▼]     │
└─────────────────────────────┘
```

### 4. Reflection Editor

Rich editor for deeper articulation:

```
┌─────────────────────────────┐
│ Reflection on: [Artifact]   │
├─────────────────────────────┤
│                             │
│ [    Attached Artifact    ] │
│                             │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │  Rich text editor...    │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ [🎤 Add Audio] [📷 Add Img] │
│                             │
│ ─────────────────────────── │
│ Added blocks:               │
│ [Audio clip 1] [×]          │
│ [Image] [×]                 │
│                             │
├─────────────────────────────┤
│ Depth: ○ ○ ● ○ ○ (3/5)      │
│        surface → deep       │
├─────────────────────────────┤
│ [Cancel]           [Save]   │
└─────────────────────────────┘
```

---

## Processing Pipeline

When the local computer is running:

```
1. Check for unprocessed artifacts
   └─▶ SELECT * FROM artifacts WHERE processed = false

2. For each unprocessed artifact:
   ├─▶ If has audio:
   │   └─▶ Download from Supabase Storage
   │   └─▶ Run Whisper (local or API)
   │   └─▶ Store transcript
   │
   ├─▶ Generate thumbnail
   │   └─▶ Audio: waveform image
   │   └─▶ Image: resized version
   │   └─▶ Text: rendered preview
   │
   ├─▶ Send to Claude API:
   │   └─▶ "Given this content and user's previous subjects,
   │        suggest: subject, tags, connections"
   │   └─▶ Store auto_tags, subject, connections
   │
   └─▶ Mark processed = true

3. Run collection generation (periodic)
   └─▶ Group artifacts by subject + time proximity
   └─▶ Create/update auto collections
```

---

## PWA Configuration

### manifest.json

```json
{
  "name": "The Framework",
  "short_name": "Framework",
  "description": "Capture and reflect on your learning",
  "start_url": "/capture",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Capabilities

- Cache app shell for offline access
- Queue captures in IndexedDB when offline
- Background sync when connection restored
- Push notification support (optional, for reminders)

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# AI Services
OPENAI_API_KEY=your-openai-key  # For Whisper API (or omit if local)
ANTHROPIC_API_KEY=your-anthropic-key  # For auto-organization

# Local Whisper (optional)
WHISPER_LOCAL=true
WHISPER_MODEL_PATH=/path/to/whisper/model
```

---

## Getting Started (Post-Generation)

1. Create Supabase project at supabase.com
2. Run migrations to create tables
3. Set environment variables
4. `npm install` and `npm run dev`
5. Access on phone via local network IP or deploy to Vercel for phone access
6. Install as PWA on phone

---

## Future Considerations

- **MyPSII Integration**: Export artifacts/reflections to student portfolios
- **Batch Processing**: Run processing on a schedule rather than on-demand
- **Local LLM**: Replace Claude API with local model for tagging
- **Export Formats**: PDF portfolios, slideshow generation
- **Collaborative Collections**: Shared project documentation
