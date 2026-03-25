-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: Artifacts (atomic unit of capture)
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  type text check (type in ('audio', 'image', 'text', 'video', 'mixed')),
  
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

-- Table: Collections (groupings)
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

-- Table: Reflections (deeper articulation)
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

-- Table: User Profile
create table profiles (
  id uuid primary key references auth.users(id),
  role text check (role in ('student', 'teacher')),
  display_name text,
  settings jsonb default '{}',
  linked_teacher_ids uuid[], -- Teachers who can view this student's work
  
  created_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table artifacts enable row level security;
alter table collections enable row level security;
alter table reflections enable row level security;
alter table profiles enable row level security;

-- Policies (Basic implementation - refine for production)
-- Users can see their own data
create policy "Users can allow select their own artifacts" on artifacts for select using (auth.uid() = user_id);
create policy "Users can allow insert their own artifacts" on artifacts for insert with check (auth.uid() = user_id);
create policy "Users can allow update their own artifacts" on artifacts for update using (auth.uid() = user_id);

create policy "Users can allow select their own collections" on collections for select using (auth.uid() = user_id);
create policy "Users can allow insert their own collections" on collections for insert with check (auth.uid() = user_id);
create policy "Users can allow update their own collections" on collections for update using (auth.uid() = user_id);

create policy "Users can allow select their own reflections" on reflections for select using (auth.uid() = user_id);
create policy "Users can allow insert their own reflections" on reflections for insert with check (auth.uid() = user_id);
create policy "Users can allow update their own reflections" on reflections for update using (auth.uid() = user_id);

create policy "Users can allow select their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can allow update their own profile" on profiles for update using (auth.uid() = id);
