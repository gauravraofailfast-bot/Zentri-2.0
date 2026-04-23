-- Sprint 0 Initial Schema
-- Includes: profiles, concepts, landmarks, progress, entitlements, questions

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- PROFILES (extends auth.users)
-- ============================================================================
create table if not exists profiles (
  id uuid references auth.users primary key,
  display_name text,
  free_chapter_id text, -- User's chosen free chapter
  selected_language text default 'en',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "users_read_own_profile" on profiles for select using (auth.uid() = id);
create policy "users_update_own_profile" on profiles for update using (auth.uid() = id);

-- ============================================================================
-- CONCEPTS (migrated from Firestore)
-- ============================================================================
create table if not exists concepts (
  id text primary key,
  curriculum_id text not null, -- 'class10-math'
  language text not null default 'en',
  chapter_id text not null, -- 'ch8'
  topic_id text,
  name text not null,
  description text,
  source_reference text, -- 'ncert-class10-ch8.3'
  prerequisites text[],
  mastery_criteria jsonb,
  common_misconceptions jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table concepts enable row level security;
create index concepts_curriculum_idx on concepts(curriculum_id, language);
create index concepts_chapter_idx on concepts(chapter_id);

create policy "concepts_readable_by_auth" on concepts for select using (auth.role() = 'authenticated');

-- ============================================================================
-- QUESTIONS (Previous Year Questions)
-- ============================================================================
create table if not exists questions (
  id text primary key,
  curriculum_id text not null, -- 'class10-math'
  chapter_id text not null, -- 'ch8'
  concept_id text references concepts(id), -- Optional link to concept
  language text not null default 'en',
  question_text text not null,
  question_type text, -- 'mcq', 'short-answer', 'long-answer', etc.
  options jsonb, -- For MCQ: [{text: "...", isCorrect: true}, ...]
  answer text, -- Short form or key
  answer_explanation text,
  difficulty text default 'medium', -- 'easy', 'medium', 'hard'
  source text default 'ncert', -- 'ncert', 'pmt', 'jee', 'pyq', etc.
  year int, -- 2023, 2022, etc. (for PYQs)
  created_at timestamptz default now()
);

alter table questions enable row level security;
create index questions_curriculum_idx on questions(curriculum_id, chapter_id);
create index questions_concept_idx on questions(concept_id);

create policy "questions_readable_by_auth" on questions for select using (auth.role() = 'authenticated');

-- ============================================================================
-- LANDMARKS (Mission instances)
-- ============================================================================
create table if not exists landmarks (
  id text primary key,
  curriculum_id text not null, -- 'class10-math'
  biome_id text not null, -- 'pink-city'
  concept_id text references concepts(id),
  mechanic_type text not null, -- 'drag-angle-release', 'tap-identify', etc.
  mechanic_config jsonb, -- Config passed to mechanic component
  vibe_notes text,
  sort_order int,
  created_at timestamptz default now()
);

alter table landmarks enable row level security;
create index landmarks_curriculum_idx on landmarks(curriculum_id, biome_id);

create policy "landmarks_readable_by_auth" on landmarks for select using (auth.role() = 'authenticated');

-- ============================================================================
-- PROGRESS (Per-user, per-concept mastery)
-- ============================================================================
create table if not exists progress (
  user_id uuid references profiles(id),
  concept_id text references concepts(id),
  curriculum_id text not null,
  mastery_level int default 0, -- 0-5
  last_practiced timestamptz,
  next_due timestamptz, -- For spaced-rep (populated in S2)
  attempts int default 0,
  correct int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, concept_id)
);

alter table progress enable row level security;
create index progress_user_idx on progress(user_id);
create index progress_next_due_idx on progress(user_id, next_due) where next_due is not null;

create policy "users_read_own_progress" on progress for select using (auth.uid() = user_id);
create policy "users_write_own_progress" on progress for insert with check (auth.uid() = user_id);
create policy "users_update_own_progress" on progress for update using (auth.uid() = user_id);

-- ============================================================================
-- ENTITLEMENTS (Paywall hook, unused in S0)
-- ============================================================================
create table if not exists entitlements (
  user_id uuid references profiles(id),
  curriculum_id text,
  tier text default 'horizon', -- 'horizon', 'wayfarer', 'caravan', 'cartographer'
  free_chapter_id text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  primary key (user_id, curriculum_id)
);

alter table entitlements enable row level security;

create policy "users_read_own_entitlements" on entitlements for select using (auth.uid() = user_id);

-- ============================================================================
-- Timestamps
-- ============================================================================
-- Update updated_at on concepts
create or replace function update_concepts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger concepts_updated_at_trigger
before update on concepts
for each row
execute function update_concepts_updated_at();

-- Update updated_at on progress
create or replace function update_progress_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger progress_updated_at_trigger
before update on progress
for each row
execute function update_progress_updated_at();

-- ============================================================================
-- Success
-- ============================================================================
-- Schema ready. Next: seed data via scripts/migrate-firestore.ts
