-- Migration 004: Fix the naming confusion
--
-- BEFORE:
--   "concepts" table  = actually Firestore topics (wrong level)
--   No concepts table = the real 20-30 min session units were missing
--
-- AFTER:
--   "topics"   table = Firestore topics (broad grouping per chapter)
--   "concepts" table = smallest completable unit (20-30 min session)
--                      each concept belongs to a topic
--                      each concept has its own theory slice + PYQs
--
-- FK chain: curricula → chapters → topics → concepts → questions/progress/landmarks

-- ============================================================================
-- STEP 1: Rename concepts → topics
-- Drop dependent objects first, recreate after rename
-- ============================================================================

-- Drop trigger + function on old concepts table
DROP TRIGGER IF EXISTS concepts_updated_at_trigger ON concepts;
DROP FUNCTION IF EXISTS update_concepts_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS concepts_curriculum_idx;
DROP INDEX IF EXISTS concepts_chapter_idx;

-- Drop RLS policy
DROP POLICY IF EXISTS "concepts_readable_by_auth" ON concepts;

-- Drop FKs on child tables that reference concepts(id)
ALTER TABLE questions  DROP CONSTRAINT IF EXISTS questions_concept_id_fkey;
ALTER TABLE landmarks  DROP CONSTRAINT IF EXISTS landmarks_concept_id_fkey;
ALTER TABLE progress   DROP CONSTRAINT IF EXISTS progress_concept_id_fkey;

-- Rename
ALTER TABLE concepts RENAME TO topics;

-- Rename topic_id column to clarify it holds the Firestore topic key
-- (it was already called topic_id — keep as-is, it's correct now)

-- Recreate indexes on topics
CREATE INDEX IF NOT EXISTS topics_curriculum_idx ON topics(curriculum_id, language);
CREATE INDEX IF NOT EXISTS topics_chapter_idx    ON topics(chapter_id);

-- Recreate RLS policy on topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_readable_by_auth" ON topics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Recreate updated_at trigger on topics
CREATE OR REPLACE FUNCTION update_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topics_updated_at_trigger
BEFORE UPDATE ON topics
FOR EACH ROW EXECUTE FUNCTION update_topics_updated_at();

-- ============================================================================
-- STEP 2: Create the real concepts table (20-30 min session unit)
-- ============================================================================

CREATE TABLE IF NOT EXISTS concepts (
  id            text PRIMARY KEY,          -- '{curriculum_id}-{chapter_id}-{concept_id}'
  curriculum_id text NOT NULL,             -- 'class10-math-basic'
  chapter_id    text NOT NULL,             -- 'real_numbers'
  topic_id      text NOT NULL,             -- 'hcf_lcm'  (FK → topics.topic_id)
  concept_key   text NOT NULL,             -- 'relationship_hcf_lcm' (the original conceptId)
  name          text NOT NULL,             -- human-readable label
  language      text NOT NULL DEFAULT 'en',
  sort_order    int,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS concepts_curriculum_idx  ON concepts(curriculum_id);
CREATE INDEX IF NOT EXISTS concepts_chapter_idx     ON concepts(chapter_id);
CREATE INDEX IF NOT EXISTS concepts_topic_idx       ON concepts(curriculum_id, chapter_id, topic_id);

CREATE POLICY "concepts_readable_by_auth" ON concepts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_concepts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER concepts_updated_at_trigger
BEFORE UPDATE ON concepts
FOR EACH ROW EXECUTE FUNCTION update_concepts_updated_at();

-- ============================================================================
-- STEP 3: Re-add concept_id FK on child tables → now points to new concepts
-- (leave nullable — populated by data migration script)
-- ============================================================================

ALTER TABLE questions ADD COLUMN IF NOT EXISTS concept_id text REFERENCES concepts(id);
ALTER TABLE landmarks ADD COLUMN IF NOT EXISTS concept_id text REFERENCES concepts(id);
ALTER TABLE progress  ADD COLUMN IF NOT EXISTS concept_id text REFERENCES concepts(id);

CREATE INDEX IF NOT EXISTS questions_concept_idx ON questions(concept_id);
CREATE INDEX IF NOT EXISTS landmarks_concept_idx ON landmarks(concept_id);
CREATE INDEX IF NOT EXISTS progress_concept_idx  ON progress(concept_id);

-- ============================================================================
-- STEP 4: Grant permissions (needed for service_role writes)
-- ============================================================================
GRANT ALL ON TABLE topics    TO service_role, anon, authenticated;
GRANT ALL ON TABLE concepts  TO service_role, anon, authenticated;
