-- Migration 003: Add theory JSONB column to concepts table
-- Theory is shared across curricula (same content for basic and standard)
-- median_grouped_data topic is left NULL (Gemini quota ran out during extraction)

ALTER TABLE concepts ADD COLUMN IF NOT EXISTS theory jsonb;
