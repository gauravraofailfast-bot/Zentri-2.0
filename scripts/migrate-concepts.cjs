#!/usr/bin/env node
/**
 * migrate-concepts.cjs
 *
 * Populates the new `concepts` table and links questions.concept_id.
 *
 * Source:  /Users/gauravrao/sprintup/functions/data/mathematics_basic.json
 *          /Users/gauravrao/sprintup/functions/data/mathematics_standard.json
 *
 * What it does:
 *   1. Reads all unique conceptId → {topicId, chapterId} from both JSONs
 *   2. Inserts one concepts row per (curriculum × conceptKey)
 *   3. Updates questions.concept_id with the correct FK
 *
 * Concept ID format: '{curriculum_id}-{chapter_id}-{concept_key}'
 * e.g. 'class10-math-basic-real_numbers-relationship_hcf_lcm'
 *
 * Run: node scripts/migrate-concepts.cjs
 */

'use strict';

const { createClient } = require('../node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIG
// ============================================================================

const ENV_PATH = path.join(__dirname, '../.env.local');
const BASIC_JSON    = '/Users/gauravrao/sprintup/functions/data/mathematics_basic.json';
const STANDARD_JSON = '/Users/gauravrao/sprintup/functions/data/mathematics_standard.json';

const CURRICULUM_MAP = {
  mathematics_basic:    'class10-math-basic',
  mathematics_standard: 'class10-math-standard',
};

// ============================================================================
// INIT
// ============================================================================

const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_KEY);

// ============================================================================
// HELPERS
// ============================================================================

function toLabel(snakeCase) {
  return snakeCase
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function upsertBatch(table, rows) {
  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase
      .from(table)
      .upsert(rows.slice(i, i + CHUNK), { onConflict: 'id' });
    if (error) throw new Error(`upsert ${table}: ${error.message}`);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function migrate() {
  console.log('\n🚀 Starting concepts data migration\n');

  // ── 1. Load source JSONs ──────────────────────────────────────────────────
  const sources = [
    { file: BASIC_JSON,    subject: 'mathematics_basic'    },
    { file: STANDARD_JSON, subject: 'mathematics_standard' },
  ];

  // ── 2. Build concept rows + question→concept mapping ─────────────────────
  // concepts:  Map<conceptRowId, row>
  // qUpdates:  Map<questionRowId, conceptRowId>

  const conceptRows = new Map();
  const qUpdates    = new Map(); // questionRowId → conceptRowId

  for (const { file, subject } of sources) {
    const curriculumId = CURRICULUM_MAP[subject];
    const { questions } = JSON.parse(fs.readFileSync(file, 'utf-8'));

    console.log(`📂 ${subject}: ${questions.length} questions`);

    for (const q of questions) {
      const conceptKey = q.conceptId || q.concept_id;
      const topicId    = q.topicId   || q.topic_id;
      const chapterId  = q.chapterId || q.chapter_id;

      if (!conceptKey || !topicId || !chapterId) continue;

      const conceptRowId = `${curriculumId}-${chapterId}-${conceptKey}`;

      if (!conceptRows.has(conceptRowId)) {
        conceptRows.set(conceptRowId, {
          id:            conceptRowId,
          curriculum_id: curriculumId,
          chapter_id:    chapterId,
          topic_id:      topicId,
          concept_key:   conceptKey,
          name:          toLabel(conceptKey),
          language:      'en',
        });
      }

      // Build the question row ID (same formula as remigrate-firestore.cjs)
      // Format: {curriculumId}-{chapterId}-{year}_{questionNumber}  OR  -firestoreId
      // We match by curriculum_id + chapter_id + question content instead:
      // Store for lookup after we fetch existing question IDs
      if (!qUpdates.has(`${curriculumId}::${chapterId}::${q.questionText}`)) {
        qUpdates.set(`${curriculumId}::${chapterId}::${q.questionText}`, conceptRowId);
      }
    }
  }

  console.log(`\n📦 ${conceptRows.size} unique concept rows to insert\n`);

  // ── 3. Upsert concepts ────────────────────────────────────────────────────
  const rows = [...conceptRows.values()];
  await upsertBatch('concepts', rows);
  console.log(`  ✅ Inserted ${rows.length} concept rows`);

  // ── 4. Update questions.concept_id ───────────────────────────────────────
  console.log('\n🔗 Linking questions → concepts...');

  // Fetch all questions (id, curriculum_id, chapter_id, question_text)
  const { data: allQuestions, error: qErr } = await supabase
    .from('questions')
    .select('id, curriculum_id, chapter_id, question_text');

  if (qErr) throw new Error(`fetch questions: ${qErr.message}`);

  let linked = 0;
  let unlinked = 0;

  for (const q of allQuestions) {
    const lookupKey = `${q.curriculum_id}::${q.chapter_id}::${q.question_text}`;
    const conceptRowId = qUpdates.get(lookupKey);

    if (!conceptRowId) {
      unlinked++;
      continue;
    }

    const { error } = await supabase
      .from('questions')
      .update({ concept_id: conceptRowId })
      .eq('id', q.id);

    if (error) {
      console.warn(`  ⚠️  Failed to link ${q.id}: ${error.message}`);
      unlinked++;
    } else {
      linked++;
    }
  }

  console.log(`  ✅ Linked:   ${linked} questions`);
  console.log(`  ⚠️  Unlinked: ${unlinked} questions`);

  // ── 5. Verify ─────────────────────────────────────────────────────────────
  console.log('\n📊 VERIFICATION');
  console.log('═'.repeat(50));

  const { count: totalConcepts } = await supabase
    .from('concepts')
    .select('*', { count: 'exact', head: true });

  const { count: totalTopics } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true });

  const { count: linkedQ } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .not('concept_id', 'is', null);

  const { count: totalQ } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  console.log(`  topics    : ${totalTopics}  (expected 78)`);
  console.log(`  concepts  : ${totalConcepts}  (expected ${rows.length})`);
  console.log(`  questions with concept_id: ${linkedQ} / ${totalQ}`);

  const pass = totalTopics === 78 && totalConcepts === rows.length && linkedQ === totalQ;
  console.log('\n' + '═'.repeat(50));
  console.log(pass ? '🎉 Migration complete!\n' : '⚠️  Check unlinked rows above.\n');

  process.exit(pass ? 0 : 1);
}

migrate().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
