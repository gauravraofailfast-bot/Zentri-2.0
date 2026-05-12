#!/usr/bin/env node
/**
 * backfill-firestore-gaps.cjs
 *
 * Backfills all data that exists in Firestore but was missing from Supabase:
 *
 * QUESTIONS:
 *   - answer              ← correctOptionId        (49 MCQ generated rows)
 *   - answer_explanation  ← solution.stepByStepExplanation (76 generated rows)
 *   - distractor_analysis ← distractorAnalysis[]   (49 generated MCQ rows)
 *   - source_question_id  ← sourceQuestionId       (78 generated rows)
 *   - source_question_text← sourceQuestionText     (78 generated rows)
 *   - report_count        ← reportCount            (292 PYQ rows)
 *   - attempt_count       ← attemptCount           (292 PYQ rows)
 *   - generation_count    ← generationCount        (292 PYQ rows)
 *   - assertion           ← assertion              (2 AssertionReason rows)
 *   - reason              ← reason                 (2 AssertionReason rows)
 *
 * CONCEPTS:
 *   - description  ← conceptDescription  (from Firestore concepts subcollection)
 *   - page_range   ← conceptPageRange    (from Firestore concepts subcollection)
 *   - sort_order   ← conceptOrder        (from Firestore concepts subcollection)
 *
 * Run: node scripts/backfill-firestore-gaps.cjs
 */

'use strict';

const admin  = require('/Users/gauravrao/sprintup/functions/node_modules/firebase-admin');
const { createClient } = require('../node_modules/@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

// ── Init ─────────────────────────────────────────────────────────────────────
const SA_PATH  = path.join(process.env.HOME, 'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json');
const ENV_PATH = path.join(__dirname, '../.env.local');
const env = Object.fromEntries(
  fs.readFileSync(ENV_PATH, 'utf-8').split('\n').filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf-8'))) });
const db = admin.firestore();
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_KEY);

const SUBJECTS  = ['mathematics_basic', 'mathematics_standard'];
const CURRICULUM = { mathematics_basic: 'class10-math-basic', mathematics_standard: 'class10-math-standard' };

function sep(t) { console.log('\n' + '─'.repeat(60) + '\n  ' + t + '\n' + '─'.repeat(60)); }

// ── Helper: update a Supabase row and log errors ──────────────────────────────
async function sbUpdate(table, id, payload) {
  const { error } = await sb.from(table).update(payload).eq('id', id);
  if (error) console.warn(`  ❌ ${table} ${id}: ${error.message}`);
  return !error;
}

// ── 1. QUESTIONS backfill ────────────────────────────────────────────────────
async function backfillQuestions(chapterIds) {
  sep('1. QUESTIONS backfill');

  const counters = {
    answer: 0, answer_explanation: 0, distractor_analysis: 0,
    source: 0, report_attempt_gen: 0, assertion_reason: 0,
    errors: 0, total: 0
  };

  for (const subj of SUBJECTS) {
    const currId = CURRICULUM[subj];

    for (const chId of chapterIds[subj]) {
      const qSnap = await db
        .collection('exams').doc('cbse_class_10')
        .collection('subjects').doc(subj)
        .collection('chapters').doc(chId)
        .collection('questions').get();

      for (const qDoc of qSnap.docs) {
        counters.total++;
        const fs = qDoc.data() || {};
        const isPYQ = fs.sourceType === 'PYQ';

        // Determine Supabase ID
        const sbId = isPYQ
          ? `${currId}-${chId}-${fs.year}_${fs.questionNumber}`
          : `${currId}-${chId}-${qDoc.id}`;

        const payload = {};

        // ── Generated question fields ──────────────────────────────────────
        if (!isPYQ) {
          // answer (correctOptionId)
          if (fs.correctOptionId) {
            payload.answer = fs.correctOptionId;
            counters.answer++;
          }
          // answer_explanation (solution.stepByStepExplanation)
          if (fs.solution?.stepByStepExplanation) {
            payload.answer_explanation = fs.solution.stepByStepExplanation;
            counters.answer_explanation++;
          }
          // distractor_analysis
          if (fs.distractorAnalysis?.length) {
            payload.distractor_analysis = fs.distractorAnalysis;
            counters.distractor_analysis++;
          }
          // source provenance
          if (fs.sourceQuestionId || fs.sourceQuestionText) {
            if (fs.sourceQuestionId) payload.source_question_id = fs.sourceQuestionId;
            if (fs.sourceQuestionText) payload.source_question_text = fs.sourceQuestionText;
            counters.source++;
          }
        }

        // ── PYQ engagement counters ────────────────────────────────────────
        if (isPYQ) {
          if (fs.reportCount !== undefined) payload.report_count     = fs.reportCount;
          if (fs.attemptCount !== undefined) payload.attempt_count   = fs.attemptCount;
          if (fs.generationCount !== undefined) payload.generation_count = fs.generationCount;
          if (fs.reportCount !== undefined || fs.attemptCount !== undefined)
            counters.report_attempt_gen++;
        }

        // ── AssertionReason parts ──────────────────────────────────────────
        if (fs.assertion) { payload.assertion = fs.assertion; }
        if (fs.reason)    { payload.reason    = fs.reason;    }
        if (fs.assertion || fs.reason) counters.assertion_reason++;

        // Apply update if there's anything to write
        if (Object.keys(payload).length > 0) {
          const ok = await sbUpdate('questions', sbId, payload);
          if (!ok) counters.errors++;
        }
      }
    }
  }

  console.log(`\n  Firestore questions processed: ${counters.total}`);
  console.log(`  answer backfilled:             ${counters.answer}`);
  console.log(`  answer_explanation backfilled: ${counters.answer_explanation}`);
  console.log(`  distractor_analysis backfilled:${counters.distractor_analysis}`);
  console.log(`  source provenance backfilled:  ${counters.source}`);
  console.log(`  report/attempt/gen backfilled: ${counters.report_attempt_gen}`);
  console.log(`  assertion/reason backfilled:   ${counters.assertion_reason}`);
  console.log(`  errors:                        ${counters.errors}`);
}

// ── 2. CONCEPTS backfill ─────────────────────────────────────────────────────
async function backfillConcepts(chapterIds) {
  sep('2. CONCEPTS backfill');

  // Load all Supabase concepts for lookup
  const { data: sbConcepts } = await sb.from('concepts').select('id, curriculum_id, chapter_id, concept_key');
  const sbLookup = {};
  for (const c of sbConcepts) {
    sbLookup[`${c.curriculum_id}::${c.chapter_id}::${c.concept_key}`] = c.id;
  }

  let matched = 0, updated = 0, notFound = 0, errors = 0;

  for (const subj of SUBJECTS) {
    const currId = CURRICULUM[subj];

    for (const chId of chapterIds[subj]) {
      const topicSnap = await db
        .collection('exams').doc('cbse_class_10')
        .collection('subjects').doc(subj)
        .collection('chapters').doc(chId)
        .collection('topics').get();

      for (const topicDoc of topicSnap.docs) {
        const conceptSnap = await topicDoc.ref.collection('concepts').get();

        for (const cDoc of conceptSnap.docs) {
          const fsData = cDoc.data() || {};
          const conceptKey = fsData.conceptId || cDoc.id;
          const sbId = sbLookup[`${currId}::${chId}::${conceptKey}`];

          if (!sbId) { notFound++; continue; }
          matched++;

          const payload = {};
          if (fsData.conceptDescription) payload.description = fsData.conceptDescription;
          if (fsData.conceptPageRange)   payload.page_range  = fsData.conceptPageRange;
          if (fsData.conceptOrder !== undefined) payload.sort_order = fsData.conceptOrder;

          if (Object.keys(payload).length > 0) {
            const ok = await sbUpdate('concepts', sbId, payload);
            if (ok) updated++; else errors++;
          }
        }
      }
    }
  }

  console.log(`\n  Firestore concepts scanned: ${matched + notFound}`);
  console.log(`  Matched to Supabase:        ${matched}`);
  console.log(`  Not found in Supabase:      ${notFound} (different taxonomy — expected)`);
  console.log(`  Updated with new data:      ${updated}`);
  console.log(`  Errors:                     ${errors}`);
}

// ── Verify ───────────────────────────────────────────────────────────────────
async function verify() {
  sep('VERIFICATION');

  const checks = [
    { label: 'questions.answer populated',              table: 'questions', col: 'answer' },
    { label: 'questions.answer_explanation populated',  table: 'questions', col: 'answer_explanation' },
    { label: 'questions.distractor_analysis populated', table: 'questions', col: 'distractor_analysis' },
    { label: 'questions.source_question_id populated',  table: 'questions', col: 'source_question_id' },
    { label: 'questions.report_count > 0',              table: 'questions', col: 'report_count' },
    { label: 'concepts.description populated',          table: 'concepts',  col: 'description' },
    { label: 'concepts.page_range populated',           table: 'concepts',  col: 'page_range' },
    { label: 'concepts.sort_order populated',           table: 'concepts',  col: 'sort_order' },
  ];

  for (const c of checks) {
    const { count: total } = await sb.from(c.table).select('*', { count: 'exact', head: true });
    const { count: filled } = await sb.from(c.table).select('*', { count: 'exact', head: true }).not(c.col, 'is', null);
    const icon = filled > 0 ? '✅' : '❌';
    console.log(`  ${icon}  ${c.label}: ${filled}/${total}`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔄  BACKFILL: Firestore gaps → Supabase\n');

  // Get chapter IDs from Supabase (already verified complete)
  const { data: chapters } = await sb.from('chapters').select('curriculum_id, chapter_id');
  const chapterIds = { mathematics_basic: [], mathematics_standard: [] };
  for (const ch of chapters) {
    const subj = ch.curriculum_id === 'class10-math-basic' ? 'mathematics_basic' : 'mathematics_standard';
    if (!chapterIds[subj].includes(ch.chapter_id)) chapterIds[subj].push(ch.chapter_id);
  }

  await backfillQuestions(chapterIds);
  await backfillConcepts(chapterIds);
  await verify();

  console.log('\n✅  Backfill complete.\n');
}

main().catch(err => { console.error('❌ Fatal:', err.message); process.exit(1); });
