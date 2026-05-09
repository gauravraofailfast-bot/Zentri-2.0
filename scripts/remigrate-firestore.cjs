#!/usr/bin/env node
/**
 * Clean re-migration: SprintUp Firestore → Zentri Supabase
 *
 * Fixes the 3 bugs in the original script:
 *   1. Wrong field name: uses questionText (camelCase) not question_text/question
 *   2. Subject split: creates separate rows for math_standard and math_basic
 *   3. Missing questions: reads all 370 questions across both subjects
 *
 * Run from: /Users/gauravrao/sprintup/functions/
 *   NODE_PATH=node_modules node remigrate-to-supabase.cjs
 */

'use strict';

const admin = require('./node_modules/firebase-admin');
const { createClient } = require('/Users/gauravrao/Zentri-2.0/node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIG
// ============================================================================

const SERVICE_ACCOUNT_PATH = path.join(process.env.HOME, 'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json');
const ENV_PATH = '/Users/gauravrao/Zentri-2.0/.env.local';

const SUBJECT_TO_CURRICULUM = {
  mathematics_standard: 'class10-math-standard',
  mathematics_basic: 'class10-math-basic',
};

// Expected counts for verification
const EXPECTED = {
  'class10-math-standard': { chapters: 14, concepts: 39, questions: 159 },
  'class10-math-basic':    { chapters: 14, concepts: 39, questions: 211 },
};

// ============================================================================
// INIT
// ============================================================================

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`❌ Service account not found: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

// Parse env file
const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firestore = admin.firestore();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// HELPERS
// ============================================================================

async function upsertBatch(table, rows, conflictKey = 'id') {
  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: conflictKey });
    if (error) {
      console.error(`❌ upsert error on ${table} chunk ${i}: ${error.message}`);
      throw error;
    }
  }
}

function makeQuestionId(curriculumId, chapterId, year, questionNumber, firestoreId) {
  if (year && questionNumber != null) {
    const qn = String(questionNumber).replace(/[^a-zA-Z0-9]/g, '_');
    return `${curriculumId}-${chapterId}-${year}_${qn}`;
  }
  // Fallback: use firestore doc ID to guarantee uniqueness
  return `${curriculumId}-${chapterId}-${firestoreId}`;
}

// ============================================================================
// MAIN
// ============================================================================

async function migrate() {
  console.log('\n🚀 Starting clean re-migration: Firestore → Supabase\n');

  const summary = {};

  const subjectsSnap = await firestore
    .collection('exams')
    .doc('cbse_class_10')
    .collection('subjects')
    .get();

  console.log(`📚 Found ${subjectsSnap.size} subjects in Firestore\n`);

  for (const subjectDoc of subjectsSnap.docs) {
    const subjectId = subjectDoc.id;
    const curriculumId = SUBJECT_TO_CURRICULUM[subjectId];

    if (!curriculumId) {
      console.log(`⚠️  Skipping unknown subject: ${subjectId}`);
      continue;
    }

    console.log(`\n📖 Subject: ${subjectId} → curriculum: ${curriculumId}`);
    console.log('─'.repeat(60));

    const chaptersToInsert = [];
    const conceptsToInsert = [];
    const questionsToInsert = [];

    const chaptersSnap = await subjectDoc.ref.collection('chapters').get();
    console.log(`   ${chaptersSnap.size} chapters found`);

    for (const chapterDoc of chaptersSnap.docs) {
      const chapterId = chapterDoc.id;
      const chapterData = chapterDoc.data();

      // Chapter row
      chaptersToInsert.push({
        id: `${curriculumId}-${chapterId}`,
        curriculum_id: curriculumId,
        chapter_id: chapterId,
        chapter_name: chapterData.chapterName || chapterId,
        chapter_order: chapterData.chapterOrder || null,
        page_range: chapterData.chapterPageRange || null,
      });

      // Topics → concepts
      try {
        const topicsSnap = await chapterDoc.ref.collection('topics').get();
        for (const topicDoc of topicsSnap.docs) {
          const topicId = topicDoc.id;
          const t = topicDoc.data();
          conceptsToInsert.push({
            id: `${curriculumId}-${chapterId}-${topicId}`,
            curriculum_id: curriculumId,
            language: 'en',
            chapter_id: chapterId,
            topic_id: t.topicId || topicId,
            name: t.topicName || topicId,
            description: t.topicDescription || null,
            source_reference: t.topicPageRange || null,
          });
        }
      } catch (err) {
        console.warn(`   ⚠️  Topics error in ${chapterId}: ${err.message}`);
      }

      // Questions
      try {
        const questionsSnap = await chapterDoc.ref.collection('questions').get();
        for (const questionDoc of questionsSnap.docs) {
          const q = questionDoc.data();
          const qId = makeQuestionId(
            curriculumId, chapterId,
            q.year, q.questionNumber, questionDoc.id
          );
          questionsToInsert.push({
            id: qId,
            curriculum_id: curriculumId,
            chapter_id: chapterId,
            language: 'en',
            // THE CRITICAL FIX: use questionText (camelCase), not question_text/question
            question_text: q.questionText || '',
            question_type: q.questionType || null,
            options: q.options || null,
            source: q.sourceType || 'PYQ',
            year: q.year || null,
            marks: q.marks || null,
            cognitive_skill: q.cognitiveSkill || null,
            estimated_solve_time_sec: q.estimatedSolveTimeSec || null,
            tags: q.tags || null,
            topic_hint: q.topicHint || null,
            question_number: q.questionNumber != null ? String(q.questionNumber) : null,
            concept_id: null, // Will link to concepts in a future phase
          });
        }
      } catch (err) {
        console.warn(`   ⚠️  Questions error in ${chapterId}: ${err.message}`);
      }
    }

    console.log(`   → Inserting ${chaptersToInsert.length} chapters...`);
    await upsertBatch('chapters', chaptersToInsert);

    console.log(`   → Inserting ${conceptsToInsert.length} concepts...`);
    await upsertBatch('concepts', conceptsToInsert);

    console.log(`   → Inserting ${questionsToInsert.length} questions...`);
    await upsertBatch('questions', questionsToInsert);

    summary[curriculumId] = {
      chapters: chaptersToInsert.length,
      concepts: conceptsToInsert.length,
      questions: questionsToInsert.length,
    };

    console.log(`   ✅ Done: ${chaptersToInsert.length} chapters, ${conceptsToInsert.length} concepts, ${questionsToInsert.length} questions`);
  }

  // ============================================================================
  // SUMMARY + VERIFICATION
  // ============================================================================

  console.log('\n\n📊 MIGRATION SUMMARY');
  console.log('═'.repeat(60));

  let allPass = true;

  for (const [currId, counts] of Object.entries(summary)) {
    const expected = EXPECTED[currId];
    console.log(`\n${currId}:`);

    for (const [key, actual] of Object.entries(counts)) {
      const exp = expected ? expected[key] : '?';
      const pass = expected ? actual === exp : true;
      if (!pass) allPass = false;
      const icon = pass ? '✅' : '❌';
      console.log(`  ${icon} ${key}: ${actual} (expected ${exp})`);
    }
  }

  // Verify question_text population
  console.log('\n🔍 Verifying question_text population...');
  const { count: totalQ } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });
  const { count: nonEmptyQ } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .not('question_text', 'is', null)
    .neq('question_text', '');

  console.log(`  Total questions: ${totalQ} (expected 370)`);
  console.log(`  Non-empty question_text: ${nonEmptyQ} (expected ≥368)`);

  if (totalQ !== 370) allPass = false;
  if (nonEmptyQ < 368) allPass = false;

  console.log('\n' + '═'.repeat(60));
  if (allPass) {
    console.log('🎉 All counts match! Migration complete.\n');
  } else {
    console.log('⚠️  Some counts don\'t match. Check the output above.\n');
  }

  process.exit(allPass ? 0 : 1);
}

migrate().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
