#!/usr/bin/env node
/**
 * link-firestore-questions.cjs
 *
 * Fixes the 78 questions in Supabase with concept_id = NULL.
 *
 * ROOT CAUSE:
 *   remigrate-firestore.cjs read questions from chapters/{chapterId}/questions
 *   but hardcoded concept_id: null — ignoring the conceptId field on each doc.
 *
 * WHAT THIS DOES:
 *   1. Fetches all questions with concept_id IS NULL from Supabase
 *   2. For each, parses the Firestore document ID from the Supabase question ID
 *   3. Reads that Firestore document to get conceptId
 *   4. Maps conceptId → Supabase concepts row ID
 *   5. Updates questions.concept_id
 *
 * Run: node scripts/link-firestore-questions.cjs
 */

'use strict';

const admin = require('/Users/gauravrao/sprintup/functions/node_modules/firebase-admin');
const { createClient } = require('../node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIG
// ============================================================================

const SERVICE_ACCOUNT_PATH = path.join(
  process.env.HOME,
  'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json'
);
const ENV_PATH = path.join(__dirname, '../.env.local');

const CURRICULUM_TO_SUBJECT = {
  'class10-math-basic':    'mathematics_basic',
  'class10-math-standard': 'mathematics_standard',
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

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'))),
});
const firestore = admin.firestore();

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Parse the Firestore document ID from a Supabase question ID.
 * Format: {curriculumId}-{chapterId}-{firestoreDocId}
 * e.g.  class10-math-basic-arithmetic_progressions-5z7iceI2uszeSilD8ipj
 *
 * curriculumId is always 'class10-math-basic' or 'class10-math-standard' (fixed prefix)
 * chapterId comes next (snake_case, no hyphens)
 * firestoreDocId is the remainder
 */
function parseSupabaseId(id, curriculumId, chapterId) {
  const prefix = `${curriculumId}-${chapterId}-`;
  if (!id.startsWith(prefix)) return null;
  return id.slice(prefix.length);
}

// ============================================================================
// MAIN
// ============================================================================

async function linkQuestions() {
  console.log('\n🔗 Linking Firestore-origin questions → concepts\n');

  // 1. Fetch all unlinked questions from Supabase
  const { data: unlinked, error: fetchErr } = await supabase
    .from('questions')
    .select('id, curriculum_id, chapter_id, question_text')
    .is('concept_id', null);

  if (fetchErr) throw new Error('fetch unlinked: ' + fetchErr.message);
  console.log(`📋 ${unlinked.length} unlinked questions found\n`);

  // 2. Load all concepts from Supabase for fast lookup
  const { data: allConcepts, error: cErr } = await supabase
    .from('concepts')
    .select('id, curriculum_id, chapter_id, concept_key');
  if (cErr) throw new Error('fetch concepts: ' + cErr.message);

  // Map: `${curriculumId}::${chapterId}::${conceptKey}` → conceptRowId
  const conceptLookup = new Map();
  for (const c of allConcepts) {
    conceptLookup.set(`${c.curriculum_id}::${c.chapter_id}::${c.concept_key}`, c.id);
  }
  console.log(`📦 ${allConcepts.length} concept rows loaded for lookup\n`);

  let linked = 0;
  let skipped = 0;
  let errors = 0;

  // 3. For each unlinked question, fetch from Firestore to get conceptId
  for (const q of unlinked) {
    const subjectId = CURRICULUM_TO_SUBJECT[q.curriculum_id];
    if (!subjectId) { skipped++; continue; }

    const firestoreDocId = parseSupabaseId(q.id, q.curriculum_id, q.chapter_id);
    if (!firestoreDocId) {
      console.warn(`  ⚠️  Couldn't parse Firestore ID from: ${q.id}`);
      skipped++;
      continue;
    }

    // Fetch the Firestore question document
    const docRef = firestore
      .collection('exams').doc('cbse_class_10')
      .collection('subjects').doc(subjectId)
      .collection('chapters').doc(q.chapter_id)
      .collection('questions').doc(firestoreDocId);

    let firestoreDoc;
    try {
      firestoreDoc = await docRef.get();
    } catch (err) {
      console.warn(`  ⚠️  Firestore fetch failed for ${firestoreDocId}: ${err.message}`);
      errors++;
      continue;
    }

    if (!firestoreDoc.exists) {
      console.warn(`  ⚠️  Not found in Firestore: ${firestoreDocId} (${q.chapter_id})`);
      skipped++;
      continue;
    }

    const fsData = firestoreDoc.data();
    const conceptKey = fsData.conceptId || fsData.concept_id;

    if (!conceptKey) {
      console.warn(`  ⚠️  No conceptId in Firestore doc ${firestoreDocId}`);
      skipped++;
      continue;
    }

    // Look up the Supabase concepts row
    const conceptRowId = conceptLookup.get(`${q.curriculum_id}::${q.chapter_id}::${conceptKey}`);

    if (!conceptRowId) {
      // Concept key from Firestore doesn't exist in our concepts table yet — insert it
      const topicKey = fsData.topicId || fsData.topic_id || 'unknown';
      const newConceptId = `${q.curriculum_id}-${q.chapter_id}-${conceptKey}`;
      const newConceptName = conceptKey
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const { error: insertErr } = await supabase.from('concepts').upsert({
        id:            newConceptId,
        curriculum_id: q.curriculum_id,
        chapter_id:    q.chapter_id,
        topic_id:      topicKey,
        concept_key:   conceptKey,
        name:          newConceptName,
        language:      'en',
      }, { onConflict: 'id' });

      if (insertErr) {
        console.warn(`  ❌ Could not insert concept '${conceptKey}': ${insertErr.message}`);
        errors++;
        continue;
      }

      // Add to in-memory lookup so subsequent questions with same key get linked
      conceptLookup.set(`${q.curriculum_id}::${q.chapter_id}::${conceptKey}`, newConceptId);
      console.log(`  ➕ Created missing concept: ${newConceptId}`);
    }

    // Re-resolve after potential insert
    const resolvedConceptRowId = conceptLookup.get(`${q.curriculum_id}::${q.chapter_id}::${conceptKey}`);
    if (!resolvedConceptRowId) {
      skipped++;
      continue;
    }

    // Update Supabase
    const { error: updateErr } = await supabase
      .from('questions')
      .update({ concept_id: resolvedConceptRowId })
      .eq('id', q.id);

    if (updateErr) {
      console.warn(`  ❌ Update failed for ${q.id}: ${updateErr.message}`);
      errors++;
    } else {
      linked++;
      if (linked % 10 === 0) console.log(`  ✅ Linked ${linked}...`);
    }
  }

  console.log(`\n📊 RESULTS`);
  console.log('═'.repeat(50));
  console.log(`  Linked:  ${linked}`);
  console.log(`  Skipped: ${skipped} (missing conceptKey or concept row)`);
  console.log(`  Errors:  ${errors}`);

  // Final verification
  const { count: linkedTotal } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .not('concept_id', 'is', null);

  const { count: totalQ } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  console.log(`\n  questions with concept_id: ${linkedTotal} / ${totalQ}`);
  console.log(linkedTotal === totalQ
    ? '\n🎉 All questions linked!\n'
    : `\n⚠️  ${totalQ - linkedTotal} questions still unlinked.\n`
  );

  process.exit(0);
}

linkQuestions().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
