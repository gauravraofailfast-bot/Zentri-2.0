# Zentri-2.0 — Database Schema Reference

> **Last updated:** May 2026  
> **Database:** Supabase (Postgres) — project `ynpkjsfnapbhwjmkrfzc`  
> **Source of truth:** `supabase/migrations/001–004_*.sql`

---

## Data Hierarchy

```
curricula
  └── chapters
        └── topics          ← Firestore/NCERT topic groupings (theory lives here)
              └── concepts  ← 20-30 min student session unit (questions live here)
                    └── questions
                    └── landmarks
                    └── progress
```

---

## Theory Access Path

```
questions.concept_id
    → concepts.id
    → concepts.topics_row_id         ← direct FK (use this, not topic_id)
    → topics.id
    → topics.theory[concept_key]     ← JSONB slice keyed by concept_key
```

> ⚠️  **Do NOT join via `topic_id` text columns** — `concepts.topic_id` uses JSON
> question-taxonomy IDs (e.g. `nth_term`) while `topics.topic_id` uses Firestore/NCERT
> IDs (e.g. `nth_term_ap`). They are different naming systems. Use `topics_row_id` instead.

---

## Tables

### `curricula`
Lookup table for exam subjects. Seeded, rarely changes.

| Column | Type | Notes |
|---|---|---|
| `id` ⭐ | text PK | e.g. `class10-math-standard`, `class10-math-basic` |
| `course` | text | e.g. `Class 10` |
| `subject` | text | e.g. `Mathematics (Standard)` |
| `icon` | text | UI icon name |
| `sort_order` | int | Display order |

---

### `chapters`
One row per chapter per curriculum.

| Column | Type | Notes |
|---|---|---|
| `id` ⭐ | text PK | `{curriculum_id}-{chapter_id}` e.g. `class10-math-basic-real_numbers` |
| `curriculum_id` | text | FK → `curricula.id` |
| `chapter_id` | text | Snake-case key e.g. `real_numbers`, `statistics` |
| `chapter_name` | text | Human-readable e.g. `Real Numbers` |
| `chapter_order` | int | NCERT chapter order |
| `page_range` | text | e.g. `1-20` |
| `created_at` | timestamptz | |

---

### `topics`
Firestore/NCERT topic groupings within a chapter. **Theory lives here.**

| Column | Type | Notes |
|---|---|---|
| `id` ⭐ | text PK | `{curriculum_id}-{chapter_id}-{topic_id}` |
| `curriculum_id` | text | e.g. `class10-math-basic` |
| `chapter_id` | text | e.g. `arithmetic_progressions` |
| `topic_id` | text | Firestore topic doc ID e.g. `nth_term_ap`, `heights_and_distances` |
| `name` | text | Human-readable e.g. `nth Term of an AP` |
| `description` | text | Optional |
| `source_reference` | text | NCERT page range |
| `language` | text | Default `en` |
| `theory` | **jsonb** | NCERT theory content — keyed by concept_key (see below) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

**`theory` JSONB structure:**
```json
{
  "<concept_key>": {
    "definition":    "...",
    "explanation":   "...",
    "steps":         ["Step 1: ...", "Step 2: ..."],
    "formulas":      ["formula string"],
    "diagramHints":  ["hint string"]
  }
}
```
Example keys: `an_formula`, `sn_formula`, `median_class`, `hcf_lcm_relationship`

**Counts:** 78 rows (39 per curriculum), all have theory.

---

### `concepts`
The smallest completable student unit — a 20-30 min session covering one skill with PYQs.

| Column | Type | Notes |
|---|---|---|
| `id` ⭐ | text PK | `{curriculum_id}-{chapter_id}-{concept_key}` |
| `curriculum_id` | text | e.g. `class10-math-basic` |
| `chapter_id` | text | e.g. `arithmetic_progressions` |
| `topic_id` | text | ⚠️ JSON taxonomy ID — **orphaned, do not use for joins** |
| `topics_row_id` | text | **FK → `topics.id`** — use this to reach theory |
| `concept_key` | text | Skill identifier e.g. `arithmetic_sequence`, `median_class` |
| `name` | text | Human-readable e.g. `Arithmetic Sequence` |
| `language` | text | Default `en` |
| `sort_order` | int | Optional display order |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

**Counts:** 273 rows. All have `topics_row_id` set → theory reachable for all.

---

### `questions`
Previous Year Questions (PYQs) from CBSE board exams.

| Column | Type | Notes |
|---|---|---|
| `id` ⭐ | text PK | `{curriculum_id}-{chapter_id}-{year}_{qNum}` or `-{firestoreId}` |
| `curriculum_id` | text | e.g. `class10-math-standard` |
| `chapter_id` | text | e.g. `statistics` |
| `concept_id` | text | **FK → `concepts.id`** — links to the skill this question tests |
| `language` | text | Default `en` |
| `question_text` | text | Full question text |
| `question_type` | text | `mcq`, `short-answer`, `long-answer` |
| `options` | jsonb | MCQ options: `[{text, isCorrect}]` |
| `answer` | text | Answer key |
| `answer_explanation` | text | Step-by-step solution |
| `difficulty` | text | `easy`, `medium`, `hard` |
| `source` | text | `PYQ`, `ncert`, etc. |
| `year` | int | Board exam year e.g. `2023` |
| `marks` | int | Mark allocation |
| `cognitive_skill` | text | e.g. `recall`, `apply`, `analyse` |
| `estimated_solve_time_sec` | int | |
| `tags` | text[] | |
| `topic_hint` | text | Hint shown to student |
| `question_number` | text | Original question number |
| `created_at` | timestamptz | |

**Counts:** 370 total, 368 have `concept_id` set (2 have no conceptId in source Firestore).

---

### `landmarks`
Game mechanics/missions within a concept session.

| Column | Type | Notes |
|---|---|---|
| `id` ⭐ | text PK | |
| `curriculum_id` | text | |
| `biome_id` | text | Game world region e.g. `pink-city` |
| `concept_id` | text | **FK → `concepts.id`** |
| `mechanic_type` | text | e.g. `drag-angle-release`, `tap-identify` |
| `mechanic_config` | jsonb | Props passed to mechanic component |
| `vibe_notes` | text | Design intent notes |
| `sort_order` | int | |
| `created_at` | timestamptz | |

**Counts:** 5 seeded rows.

---

### `progress`
Per-user, per-concept mastery tracking.

| Column | Type | Notes |
|---|---|---|
| `user_id` ⭐ | uuid | FK → `profiles.id` (auth.users) |
| `concept_id` ⭐ | text | FK → `concepts.id` — composite PK with user_id |
| `curriculum_id` | text | |
| `mastery_level` | int | 0–5 |
| `last_practiced` | timestamptz | |
| `next_due` | timestamptz | Spaced repetition next review date |
| `attempts` | int | Total attempts |
| `correct` | int | Correct answers |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

**Counts:** 0 rows (no live users yet).

---

### `profiles`
Extends `auth.users` with app-specific fields.

| Column | Type | Notes |
|---|---|---|
| `id` ⭐ | uuid PK | FK → `auth.users.id` |
| `display_name` | text | |
| `free_chapter_id` | text | User's chosen free chapter (paywall) |
| `selected_language` | text | Default `en` |
| `created_at` | timestamptz | |

---

### `entitlements`
Paywall tiers. Currently unused (all users are on free tier).

| Column | Type | Notes |
|---|---|---|
| `user_id` ⭐ | uuid | FK → `profiles.id` |
| `curriculum_id` ⭐ | text | Composite PK |
| `tier` | text | `horizon`, `wayfarer`, `caravan`, `cartographer` |
| `free_chapter_id` | text | Which chapter is unlocked free |
| `expires_at` | timestamptz | Subscription expiry |
| `created_at` | timestamptz | |

---

## Key Indexes

| Table | Index | Columns |
|---|---|---|
| `topics` | `topics_curriculum_idx` | `(curriculum_id, language)` |
| `topics` | `topics_chapter_idx` | `(chapter_id)` |
| `concepts` | `concepts_curriculum_idx` | `(curriculum_id)` |
| `concepts` | `concepts_chapter_idx` | `(chapter_id)` |
| `concepts` | `concepts_topic_idx` | `(curriculum_id, chapter_id, topic_id)` |
| `concepts` | `concepts_topics_row_idx` | `(topics_row_id)` |
| `questions` | `questions_curriculum_idx` | `(curriculum_id, chapter_id)` |
| `questions` | `questions_concept_idx` | `(concept_id)` |
| `landmarks` | `landmarks_curriculum_idx` | `(curriculum_id, biome_id)` |
| `landmarks` | `landmarks_concept_idx` | `(concept_id)` |
| `progress` | `progress_user_idx` | `(user_id)` |
| `progress` | `progress_next_due_idx` | `(user_id, next_due)` WHERE next_due IS NOT NULL |

---

## RLS Policies Summary

| Table | Policy |
|---|---|
| `curricula` | Readable by all (public) |
| `chapters` | Readable by authenticated |
| `topics` | Readable by authenticated |
| `concepts` | Readable by authenticated |
| `questions` | Readable by authenticated |
| `landmarks` | Readable by authenticated |
| `progress` | User reads/writes own rows only |
| `profiles` | User reads/updates own row only |
| `entitlements` | User reads own rows only |

---

## Data Counts (as of May 2026)

| Table | Rows | Notes |
|---|---|---|
| `curricula` | 2 | `class10-math-basic`, `class10-math-standard` |
| `chapters` | 28 | 14 per curriculum |
| `topics` | 78 | 39 per curriculum — all 78 have theory |
| `concepts` | 273 | 258 from JSON + 13 from Firestore-only questions |
| `questions` | 370 | 368 linked to concepts (2 have no conceptId in Firestore) |
| `landmarks` | 5 | Seeded game mechanics |
| `progress` | 0 | No live users yet |
| `profiles` | 0 | No live users yet |
| `entitlements` | 0 | No live users yet |

---

## Known Data Quirks

1. **`concepts.topic_id` is orphaned** — set from JSON taxonomy (`nth_term`, `hcf_lcm`), doesn't match `topics.topic_id` Firestore IDs (`nth_term_ap`, `ap_fundamentals`). Use `topics_row_id` for all topic joins.

2. **2 questions have no `concept_id`** — IDs `class10-math-basic-real_numbers-3akkdUvuQhW9zyzHBqbn` and `class10-math-basic-real_numbers-cxQhKFZeMrYL1kUsD1KB`. These have no `conceptId` field in the Firestore source document.

3. **Question ID formats vary** — questions from CBSE papers use `{curriculum}-{chapter}-{year}_{qNum}` while Firestore-migrated questions use `{curriculum}-{chapter}-{firestoreDocId}`.

4. **Theory granularity** — theory JSONB keys are NCERT section concepts (`an_formula`, `hcf_lcm_relationship`), not always 1:1 with question concept_keys. A concept's theory slice is accessed via `topics.theory[concept_key]` using the `concepts.concept_key` value.

---

## Standard Query Patterns

**Get theory for a question:**
```sql
SELECT
  t.theory -> c.concept_key AS theory_slice
FROM questions q
JOIN concepts c ON c.id = q.concept_id
JOIN topics   t ON t.id = c.topics_row_id
WHERE q.id = $1;
```

**Get all questions for a concept with theory:**
```sql
SELECT
  q.*,
  t.theory -> c.concept_key AS theory
FROM concepts c
JOIN topics    t ON t.id = c.topics_row_id
JOIN questions q ON q.concept_id = c.id
WHERE c.id = $1
ORDER BY q.year DESC;
```

**Get all concepts in a chapter (for a study session):**
```sql
SELECT
  c.id, c.concept_key, c.name,
  t.theory -> c.concept_key AS theory
FROM concepts c
JOIN topics t ON t.id = c.topics_row_id
WHERE c.curriculum_id = $1
  AND c.chapter_id = $2
ORDER BY c.sort_order NULLS LAST;
```

**Get user progress with mastery:**
```sql
SELECT
  c.name, c.concept_key,
  p.mastery_level, p.next_due, p.correct, p.attempts
FROM progress p
JOIN concepts c ON c.id = p.concept_id
WHERE p.user_id = $1
  AND c.curriculum_id = $2
ORDER BY p.next_due ASC NULLS LAST;
```
