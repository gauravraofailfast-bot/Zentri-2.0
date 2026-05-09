-- Migration 002: Add curricula table, chapters table, and new question fields
-- Fixes the broken S0 migration that had wrong field mapping and no subject split

-- ============================================================================
-- Add new columns to questions
-- ============================================================================
ALTER TABLE questions ADD COLUMN IF NOT EXISTS marks int;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS cognitive_skill text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS estimated_solve_time_sec int;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic_hint text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_number text;

-- ============================================================================
-- CURRICULA (lookup table for exam subjects)
-- ============================================================================
CREATE TABLE IF NOT EXISTS curricula (
  id text PRIMARY KEY,
  course text NOT NULL,
  subject text NOT NULL,
  icon text,
  sort_order int
);

ALTER TABLE curricula ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'curricula' AND policyname = 'curricula_readable_by_all'
  ) THEN
    CREATE POLICY "curricula_readable_by_all" ON curricula FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO curricula (id, course, subject, icon, sort_order) VALUES
  ('class10-math-standard', 'Class 10', 'Mathematics (Standard)', 'calculator', 1),
  ('class10-math-basic', 'Class 10', 'Mathematics (Basic)', 'calculator', 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CHAPTERS (chapter metadata per curriculum)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chapters (
  id text PRIMARY KEY,
  curriculum_id text NOT NULL,
  chapter_id text NOT NULL,
  chapter_name text NOT NULL,
  chapter_order int,
  page_range text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chapters' AND policyname = 'chapters_readable_by_auth'
  ) THEN
    CREATE POLICY "chapters_readable_by_auth" ON chapters FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS chapters_curriculum_idx ON chapters(curriculum_id);

-- Grant permissions to all roles (needed for service_role writes and authenticated reads)
GRANT ALL ON TABLE chapters TO service_role, anon, authenticated;
GRANT ALL ON TABLE curricula TO service_role, anon, authenticated;

-- ============================================================================
-- Wipe broken data (wrong field mapping + no subject split)
-- ============================================================================
DELETE FROM questions;
DELETE FROM concepts;
