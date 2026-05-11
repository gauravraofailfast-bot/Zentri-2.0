#!/usr/bin/env node
/**
 * map-concepts-to-topics.cjs
 *
 * PROBLEM:
 *   concepts.topic_id = JSON question-taxonomy IDs (e.g. 'nth_term', 'hcf_lcm')
 *   topics.topic_id   = Firestore/NCERT IDs (e.g. 'nth_term_ap', 'ap_fundamentals')
 *   → topic_id join is broken → theory unreachable
 *
 * FIX:
 *   Add a topics_row_id column to concepts that is a direct FK → topics.id
 *   Strategy per chapter:
 *     1. If only 1 Firestore topic in chapter → all concepts map to it
 *     2. If multiple → fuzzy-match JSON topic_id to closest Firestore topic_id
 *        using substring overlap score
 *
 * Run: node scripts/map-concepts-to-topics.cjs
 */

'use strict';

const { createClient } = require('../node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_KEY);

// ── Fuzzy matching helpers ──────────────────────────────────────────────────

/** Split a snake_case key into tokens */
function tokens(s) {
  return s.toLowerCase().split('_').filter(Boolean);
}

/** Score: how many tokens overlap (higher = better match) */
function overlapScore(a, b) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  return overlap / Math.max(ta.size, tb.size);
}

/** Given a JSON topic_id and list of Firestore topic entries, pick best match */
function bestMatch(jsonTopicId, firestoreTopics) {
  if (firestoreTopics.length === 1) return firestoreTopics[0]; // Only option
  let best = firestoreTopics[0];
  let bestScore = -1;
  for (const ft of firestoreTopics) {
    const score = overlapScore(jsonTopicId, ft.topic_id);
    if (score > bestScore) { bestScore = score; best = ft; }
  }
  return best;
}

// ── Step 1: Add topics_row_id column to concepts ────────────────────────────

async function ensureColumn() {
  // Try inserting a test value — if column doesn't exist Supabase will error
  const { data, error } = await supabase
    .from('concepts')
    .select('topics_row_id')
    .limit(1);

  if (error && error.message.includes('column "topics_row_id" does not exist')) {
    console.log('Column topics_row_id does not exist — needs to be added via SQL');
    return false;
  }
  return true;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🗺️  Mapping concepts → topics (adding topics_row_id FK)\n');

  // Check if column exists
  const colExists = await ensureColumn();
  if (!colExists) {
    console.log('\nRun this SQL in Supabase first:');
    console.log('  ALTER TABLE concepts ADD COLUMN IF NOT EXISTS topics_row_id text REFERENCES topics(id);');
    console.log('  CREATE INDEX IF NOT EXISTS concepts_topics_row_idx ON concepts(topics_row_id);');
    process.exit(1);
  }

  // Fetch all topics
  const { data: allTopics } = await supabase
    .from('topics')
    .select('id, curriculum_id, chapter_id, topic_id, theory');

  // Fetch all concepts
  const { data: allConcepts } = await supabase
    .from('concepts')
    .select('id, curriculum_id, chapter_id, topic_id, concept_key, topics_row_id');

  console.log(`Topics: ${allTopics.length} | Concepts: ${allConcepts.length}\n`);

  // Group topics by curriculum+chapter
  const topicsByChapter = {};
  for (const t of allTopics) {
    const key = `${t.curriculum_id}::${t.chapter_id}`;
    if (!topicsByChapter[key]) topicsByChapter[key] = [];
    topicsByChapter[key].push(t);
  }

  // Build updates: conceptId → topics.id
  const updates = [];
  const mappingLog = {}; // for human readability

  for (const c of allConcepts) {
    const key = `${c.curriculum_id}::${c.chapter_id}`;
    const chapterTopics = topicsByChapter[key];

    if (!chapterTopics || chapterTopics.length === 0) {
      console.warn(`  ⚠️  No topics found for ${key}`);
      continue;
    }

    const matched = bestMatch(c.topic_id, chapterTopics);
    const logKey = `${c.curriculum_id}::${c.chapter_id}::${c.topic_id}`;

    if (!mappingLog[logKey]) {
      mappingLog[logKey] = {
        jsonTopicId: c.topic_id,
        firestoreTopicId: matched.topic_id,
        firestoreTopicRowId: matched.id,
        theoryKeys: Object.keys(matched.theory || {}),
        chapter: c.chapter_id,
        curriculum: c.curriculum_id,
      };
    }

    if (c.topics_row_id !== matched.id) {
      updates.push({ id: c.id, topics_row_id: matched.id });
    }
  }

  // Print mapping for review
  console.log('📋 JSON topicId → Firestore topicId mapping:');
  const byChapter = {};
  for (const [k, v] of Object.entries(mappingLog)) {
    const ch = v.chapter;
    if (!byChapter[ch]) byChapter[ch] = [];
    byChapter[ch].push(v);
  }
  for (const [ch, mappings] of Object.entries(byChapter)) {
    // Only show once per curriculum
    const seen = new Set();
    const deduped = mappings.filter(m => {
      const key = m.jsonTopicId + '→' + m.firestoreTopicId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`\n  ${ch}:`);
    for (const m of deduped) {
      const theoryPreview = m.theoryKeys.slice(0, 3).join(', ');
      console.log(`    ${m.jsonTopicId.padEnd(40)} → ${m.firestoreTopicId} [${theoryPreview}]`);
    }
  }

  // Apply updates in batches
  console.log(`\n✏️  Applying ${updates.length} updates...`);
  const CHUNK = 100;
  let done = 0;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const chunk = updates.slice(i, i + CHUNK);
    for (const u of chunk) {
      const { error } = await supabase
        .from('concepts')
        .update({ topics_row_id: u.topics_row_id })
        .eq('id', u.id);
      if (error) console.warn(`  ❌ ${u.id}: ${error.message}`);
      else done++;
    }
  }
  console.log(`  ✅ Updated ${done} concept rows`);

  // Verify theory reachability via new column
  const { data: updatedConcepts } = await supabase
    .from('concepts')
    .select('id, topics_row_id');

  const topicMap = Object.fromEntries(allTopics.map(t => [t.id, t]));
  let reachable = 0;
  for (const c of updatedConcepts) {
    if (c.topics_row_id && topicMap[c.topics_row_id]?.theory) reachable++;
  }
  console.log(`\n  Concepts with theory reachable via topics_row_id: ${reachable} / ${updatedConcepts.length}`);

  // Question-level reachability
  const { data: linkedQ } = await supabase
    .from('questions')
    .select('concept_id')
    .not('concept_id', 'is', null);

  const conceptMapById = Object.fromEntries(updatedConcepts.map(c => [c.id, c]));
  let qReachable = 0;
  for (const q of linkedQ) {
    const c = conceptMapById[q.concept_id];
    if (c?.topics_row_id && topicMap[c.topics_row_id]?.theory) qReachable++;
  }
  console.log(`  Questions that can reach theory: ${qReachable} / ${linkedQ.length}`);
  console.log(qReachable === linkedQ.length ? '\n🎉 All linked questions can reach theory!\n' : `\n⚠️  ${linkedQ.length - qReachable} still cannot\n`);
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
