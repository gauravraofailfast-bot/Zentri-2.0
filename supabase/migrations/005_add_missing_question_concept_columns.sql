-- Migration 005: Add missing columns from Firestore data audit
--
-- GAPS FOUND:
--   questions: answer/answer_explanation null for all generated questions;
--              distractor_analysis, source_question_id, source_question_text,
--              report_count, attempt_count, generation_count, assertion, reason
--              all missing entirely
--   concepts:  description, page_range columns missing entirely;
--              sort_order exists but 0/273 populated

-- ============================================================================
-- QUESTIONS: Add missing columns
-- ============================================================================

-- Provenance for GENERATED_FROM_PYQ questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS source_question_id   text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS source_question_text text;

-- Answer data (was in Firestore as correctOptionId / solution.stepByStepExplanation)
-- answer and answer_explanation columns already exist but are null — no ADD needed

-- Distractor analysis (per-option wrong-answer explanations for MCQs)
-- Structure: [{optionId, errorType, explanation}]
ALTER TABLE questions ADD COLUMN IF NOT EXISTS distractor_analysis  jsonb;

-- Engagement counters (from Firestore)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS report_count     int NOT NULL DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS attempt_count    int NOT NULL DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS generation_count int NOT NULL DEFAULT 0;

-- AssertionReason question parts (2 questions have these as separate Firestore fields)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS assertion text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS reason    text;

-- ============================================================================
-- CONCEPTS: Add missing columns
-- ============================================================================

ALTER TABLE concepts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE concepts ADD COLUMN IF NOT EXISTS page_range  text;

-- ============================================================================
-- GRANT (ensure service_role can write to updated tables)
-- ============================================================================

GRANT ALL ON TABLE questions TO service_role, anon, authenticated;
GRANT ALL ON TABLE concepts  TO service_role, anon, authenticated;
