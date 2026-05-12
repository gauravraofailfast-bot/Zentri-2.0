#!/usr/bin/env node
/**
 * full-audit.cjs
 * Complete field-level audit: Firestore → Supabase across all collections.
 * Run: node scripts/audit/full-audit.cjs
 */
'use strict';

const admin = require('/Users/gauravrao/sprintup/functions/node_modules/firebase-admin');
const { createClient } = require('../../node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ── Init ─────────────────────────────────────────────────────────────────────
const SA_PATH = path.join(process.env.HOME, 'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json');
const ENV_PATH = path.join(__dirname, '../../.env.local');
const env = Object.fromEntries(
  fs.readFileSync(ENV_PATH, 'utf-8').split('\n').filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf-8'))) });
const db = admin.firestore();
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_KEY);

const SUBJECTS = ['mathematics_basic', 'mathematics_standard'];
const CURRICULUM = { mathematics_basic: 'class10-math-basic', mathematics_standard: 'class10-math-standard' };

function sep(title) { console.log('\n' + '═'.repeat(70)); console.log('  ' + title); console.log('═'.repeat(70)); }
function sub(title) { console.log('\n  ── ' + title + ' ──'); }

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getAllChapterIds() {
  // Returns { subjectId: [chapterId, ...] }
  const result = {};
  for (const subj of SUBJECTS) {
    const snap = await db.collection('exams').doc('cbse_class_10').collection('subjects').doc(subj).collection('chapters').get();
    result[subj] = snap.docs.map(d => d.id);
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUBJECTS / CURRICULA
// ─────────────────────────────────────────────────────────────────────────────
async function auditSubjects() {
  sep('1. SUBJECTS → curricula');

  const { data: sbRows } = await sb.from('curricula').select('*');
  console.log('\nSupabase curricula rows:', sbRows.length);
  sbRows.forEach(r => console.log('  ', JSON.stringify(r)));

  for (const subj of SUBJECTS) {
    const doc = await db.collection('exams').doc('cbse_class_10').collection('subjects').doc(subj).get();
    console.log(`\nFirestore subject "${subj}" fields:`, JSON.stringify(doc.data(), null, 2));
  }

  sub('Gap analysis');
  console.log('  Firestore subject fields: id (doc id), name, description, icon, sortOrder, course, language, etc.');
  console.log('  Supabase curricula cols:  id, course, subject, icon, sort_order');
  console.log('  → Check if Firestore has fields not captured in Supabase above ^^^');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CHAPTERS
// ─────────────────────────────────────────────────────────────────────────────
async function auditChapters(chapterIds) {
  sep('2. CHAPTERS');
  const { data: sbChapters } = await sb.from('chapters').select('*');
  console.log('\nSupabase chapters:', sbChapters.length);

  let fsTotal = 0;
  const fsMissing = [];   // in Firestore, not Supabase
  const sbMissing = [];   // in Supabase, not Firestore

  // Sample one Firestore chapter doc to see all fields
  let samplePrinted = false;

  for (const subj of SUBJECTS) {
    const currId = CURRICULUM[subj];
    for (const chId of chapterIds[subj]) {
      const doc = await db.collection('exams').doc('cbse_class_10').collection('subjects').doc(subj).collection('chapters').doc(chId).get();
      fsTotal++;
      if (!samplePrinted) {
        console.log('\nSample Firestore chapter doc fields:');
        console.log(JSON.stringify(doc.data(), null, 2));
        samplePrinted = true;
      }
      const sbId = `${currId}-${chId}`;
      const sbRow = sbChapters.find(r => r.id === sbId);
      if (!sbRow) fsMissing.push(sbId);
      else {
        // Field-level comparison
        const fsData = doc.data() || {};
        const gaps = [];
        if (fsData.chapterName && !sbRow.chapter_name) gaps.push('chapter_name');
        if (fsData.chapterOrder !== undefined && !sbRow.chapter_order) gaps.push('chapter_order');
        if (fsData.pageRange && !sbRow.page_range) gaps.push('page_range');
        if (fsData.description && !sbRow.description) gaps.push('description (no column in SB)');
        if (fsData.language && !sbRow.language) gaps.push('language (no column in SB)');
        if (fsData.totalMarks !== undefined) gaps.push('totalMarks (no column in SB)');
        if (fsData.totalQuestions !== undefined) gaps.push('totalQuestions (no column in SB)');
        if (fsData.examPattern) gaps.push('examPattern (no column in SB)');
        if (gaps.length) console.log(`  Field gaps in ${sbId}:`, gaps.join(', '));
      }
    }
  }

  // Check Supabase rows not in Firestore
  for (const r of sbChapters) {
    const parts = r.id.split('-');
    const subj = r.curriculum_id === 'class10-math-basic' ? 'mathematics_basic' : 'mathematics_standard';
    if (!chapterIds[subj]?.includes(r.chapter_id)) sbMissing.push(r.id);
  }

  sub('Chapter summary');
  console.log(`  Firestore chapters: ${fsTotal} | Supabase chapters: ${sbChapters.length}`);
  if (fsMissing.length) console.log('  In Firestore NOT in Supabase:', fsMissing);
  if (sbMissing.length) console.log('  In Supabase NOT in Firestore:', sbMissing);
  if (!fsMissing.length && !sbMissing.length) console.log('  ✅ All chapters present in both');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TOPICS (theory)
// ─────────────────────────────────────────────────────────────────────────────
async function auditTopics(chapterIds) {
  sep('3. TOPICS (theory)');
  const { data: sbTopics } = await sb.from('topics').select('*');
  const sbMap = Object.fromEntries(sbTopics.map(t => [t.id, t]));
  console.log('\nSupabase topics:', sbTopics.length);

  let fsTotal = 0;
  const fsMissing = [];
  const fieldGapCounts = {};
  let samplePrinted = false;

  for (const subj of SUBJECTS) {
    const currId = CURRICULUM[subj];
    for (const chId of chapterIds[subj]) {
      const topicSnap = await db.collection('exams').doc('cbse_class_10').collection('subjects').doc(subj).collection('chapters').doc(chId).collection('topics').get();
      for (const topicDoc of topicSnap.docs) {
        fsTotal++;
        const fsData = topicDoc.data() || {};
        if (!samplePrinted) {
          console.log('\nSample Firestore topic doc fields:');
          console.log(JSON.stringify(Object.keys(fsData).reduce((o, k) => {
            o[k] = typeof fsData[k] === 'object' && fsData[k] !== null ? `[${typeof fsData[k]}]` : fsData[k];
            return o;
          }, {}), null, 2));
          // Print theory structure
          if (fsData.theory) {
            const tKeys = Object.keys(fsData.theory);
            console.log(`  theory keys (${tKeys.length}):`, tKeys.slice(0, 5), tKeys.length > 5 ? '...' : '');
            const firstKey = tKeys[0];
            if (firstKey) console.log('  theory[0] structure:', JSON.stringify(Object.keys(fsData.theory[firstKey] || {})));
          }
          samplePrinted = true;
        }

        const sbId = `${currId}-${chId}-${topicDoc.id}`;
        const sbRow = sbMap[sbId];
        if (!sbRow) {
          fsMissing.push(sbId);
        } else {
          // Field gaps
          if (fsData.name && !sbRow.name) bump(fieldGapCounts, 'name');
          if (fsData.description && !sbRow.description) bump(fieldGapCounts, 'description');
          if (fsData.sourceReference && !sbRow.source_reference) bump(fieldGapCounts, 'source_reference');
          if (fsData.language && !sbRow.language) bump(fieldGapCounts, 'language');
          if (fsData.theory && !sbRow.theory) bump(fieldGapCounts, 'theory');
          // Check for fields in Firestore with no Supabase column
          if (fsData.sortOrder !== undefined) bump(fieldGapCounts, 'sortOrder→NO_SB_COL');
          if (fsData.prerequisites) bump(fieldGapCounts, 'prerequisites→NO_SB_COL');
          if (fsData.learningObjectives) bump(fieldGapCounts, 'learningObjectives→NO_SB_COL');
          if (fsData.estimatedDuration !== undefined) bump(fieldGapCounts, 'estimatedDuration→NO_SB_COL');
          if (fsData.difficulty) bump(fieldGapCounts, 'difficulty→NO_SB_COL');
          if (fsData.keyFormulas) bump(fieldGapCounts, 'keyFormulas→NO_SB_COL');
          if (fsData.ncertExercises) bump(fieldGapCounts, 'ncertExercises→NO_SB_COL');
        }
      }
    }
  }

  sub('Topics summary');
  console.log(`  Firestore topics: ${fsTotal} | Supabase topics: ${sbTopics.length}`);
  if (fsMissing.length) { console.log(`  In Firestore NOT in Supabase (${fsMissing.length}):`); fsMissing.forEach(id => console.log('    ', id)); }
  if (Object.keys(fieldGapCounts).length) {
    console.log('  Field gaps:');
    Object.entries(fieldGapCounts).forEach(([k, v]) => console.log(`    ${k}: ${v} docs affected`));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CONCEPTS
// ─────────────────────────────────────────────────────────────────────────────
async function auditConcepts(chapterIds) {
  sep('4. CONCEPTS');
  const { data: sbConcepts } = await sb.from('concepts').select('*');
  console.log('\nSupabase concepts:', sbConcepts.length);

  // Build lookup: curriculum+chapter+conceptKey → sbRow
  const sbLookup = {};
  for (const c of sbConcepts) sbLookup[`${c.curriculum_id}::${c.chapter_id}::${c.concept_key}`] = c;

  let fsTotal = 0;
  const fsMissing = [];
  const fieldGapCounts = {};
  let samplePrinted = false;
  const fsConceptKeys = new Set();

  for (const subj of SUBJECTS) {
    const currId = CURRICULUM[subj];
    for (const chId of chapterIds[subj]) {
      const topicSnap = await db.collection('exams').doc('cbse_class_10').collection('subjects').doc(subj).collection('chapters').doc(chId).collection('topics').get();
      for (const topicDoc of topicSnap.docs) {
        const conceptSnap = await topicDoc.ref.collection('concepts').get();
        for (const cDoc of conceptSnap.docs) {
          fsTotal++;
          const fsData = cDoc.data() || {};
          const conceptKey = fsData.conceptId || cDoc.id;
          fsConceptKeys.add(`${currId}::${chId}::${conceptKey}`);

          if (!samplePrinted) {
            console.log('\nSample Firestore concept doc fields:');
            console.log(JSON.stringify(fsData, null, 2));
            samplePrinted = true;
          }

          const sbRow = sbLookup[`${currId}::${chId}::${conceptKey}`];
          if (!sbRow) {
            fsMissing.push(`${currId}/${chId}/${conceptKey}`);
          } else {
            if (fsData.conceptName && !sbRow.name) bump(fieldGapCounts, 'name');
            if (fsData.conceptDescription) bump(fieldGapCounts, 'description→NO_SB_COL');
            if (fsData.conceptPageRange) bump(fieldGapCounts, 'conceptPageRange→NO_SB_COL');
            if (fsData.conceptOrder !== undefined && sbRow.sort_order === null) bump(fieldGapCounts, 'sort_order_null');
            if (fsData.difficulty) bump(fieldGapCounts, 'difficulty→NO_SB_COL');
            if (fsData.prerequisites) bump(fieldGapCounts, 'prerequisites→NO_SB_COL');
            if (fsData.learningObjectives) bump(fieldGapCounts, 'learningObjectives→NO_SB_COL');
            if (fsData.estimatedDuration) bump(fieldGapCounts, 'estimatedDuration→NO_SB_COL');
          }
        }
      }
    }
  }

  // Supabase concepts not matched by any Firestore doc
  const sbOrphans = sbConcepts.filter(c => !fsConceptKeys.has(`${c.curriculum_id}::${c.chapter_id}::${c.concept_key}`));

  sub('Concepts summary');
  console.log(`  Firestore concepts: ${fsTotal} | Supabase concepts: ${sbConcepts.length}`);
  console.log(`  Matched: ${fsTotal - fsMissing.length} | In FS not SB: ${fsMissing.length} | In SB not FS: ${sbOrphans.length}`);
  if (fsMissing.length) { console.log(`\n  Firestore concepts missing from Supabase:`); fsMissing.forEach(k => console.log('    ⚠️ ', k)); }
  if (sbOrphans.length) {
    console.log(`\n  Supabase concepts with no Firestore doc (${sbOrphans.length}) — first 10:`);
    sbOrphans.slice(0, 10).forEach(c => console.log('    ', c.id));
    if (sbOrphans.length > 10) console.log(`    ... and ${sbOrphans.length - 10} more`);
  }
  if (Object.keys(fieldGapCounts).length) {
    console.log('\n  Field gaps (on matched rows):');
    Object.entries(fieldGapCounts).forEach(([k, v]) => console.log(`    ${k}: ${v} docs affected`));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────
async function auditQuestions(chapterIds) {
  sep('5. QUESTIONS');
  const { data: sbQuestions } = await sb.from('questions').select('*');
  console.log('\nSupabase questions:', sbQuestions.length);

  // Build lookup by id
  const sbById = Object.fromEntries(sbQuestions.map(q => [q.id, q]));

  let fsTotal = 0;
  const fsMissing = [];          // FS docs not in SB
  const fieldGapCounts = {};     // fields present in FS but null/missing in SB
  const sbMatched = new Set();
  let samplePYQ = false, sampleGen = false;

  for (const subj of SUBJECTS) {
    const currId = CURRICULUM[subj];
    for (const chId of chapterIds[subj]) {
      const qSnap = await db.collection('exams').doc('cbse_class_10').collection('subjects').doc(subj).collection('chapters').doc(chId).collection('questions').get();

      for (const qDoc of qSnap.docs) {
        fsTotal++;
        const fsData = qDoc.data() || {};
        const isPYQ = fsData.sourceType === 'PYQ';

        if (isPYQ && !samplePYQ) {
          console.log('\nSample Firestore PYQ doc:');
          console.log(JSON.stringify(fsData, null, 2));
          samplePYQ = true;
        }
        if (!isPYQ && !sampleGen) {
          console.log('\nSample Firestore GENERATED doc:');
          console.log(JSON.stringify(fsData, null, 2));
          sampleGen = true;
        }

        // Determine expected Supabase ID
        let sbId;
        if (isPYQ) {
          sbId = `${currId}-${chId}-${fsData.year}_${fsData.questionNumber}`;
        } else {
          sbId = `${currId}-${chId}-${qDoc.id}`;
        }

        const sbRow = sbById[sbId];
        if (!sbRow) {
          fsMissing.push({ fsId: qDoc.id, expectedSbId: sbId, sourceType: fsData.sourceType });
        } else {
          sbMatched.add(sbId);
          // Field-level comparison — check every meaningful Firestore field
          if (fsData.questionText && !sbRow.question_text) bump(fieldGapCounts, 'question_text');
          if (fsData.questionType && !sbRow.question_type) bump(fieldGapCounts, 'question_type');
          if (fsData.marks && !sbRow.marks) bump(fieldGapCounts, 'marks');
          if (fsData.cognitiveSkill && !sbRow.cognitive_skill) bump(fieldGapCounts, 'cognitive_skill');
          if (fsData.estimatedSolveTimeSec && !sbRow.estimated_solve_time_sec) bump(fieldGapCounts, 'estimated_solve_time_sec');
          if (fsData.year && !sbRow.year) bump(fieldGapCounts, 'year');
          if (fsData.questionNumber && !sbRow.question_number) bump(fieldGapCounts, 'question_number');
          if (fsData.topicHint && !sbRow.topic_hint) bump(fieldGapCounts, 'topic_hint');
          if (fsData.tags && sbRow.tags === null) bump(fieldGapCounts, 'tags');
          if (fsData.conceptId && !sbRow.concept_id) bump(fieldGapCounts, 'concept_id');

          // MCQ options format check
          if (fsData.options && sbRow.options) {
            const fsIsObj = Array.isArray(fsData.options) && typeof fsData.options[0] === 'object';
            const sbIsObj = Array.isArray(sbRow.options) && typeof sbRow.options[0] === 'object';
            if (fsIsObj !== sbIsObj) bump(fieldGapCounts, 'options_format_mismatch');
          }

          // Fields in FS that have NO Supabase column at all
          if (fsData.correctOptionId !== undefined) {
            if (!sbRow.answer) bump(fieldGapCounts, 'correctOptionId→answer(null)');
          }
          if (fsData.solution?.stepByStepExplanation) {
            if (!sbRow.answer_explanation) bump(fieldGapCounts, 'solution→answer_explanation(null)');
          }
          if (fsData.distractorAnalysis) bump(fieldGapCounts, 'distractorAnalysis→NO_SB_COL');
          if (fsData.sourceQuestionId) bump(fieldGapCounts, 'sourceQuestionId→NO_SB_COL');
          if (fsData.sourceQuestionText) bump(fieldGapCounts, 'sourceQuestionText→NO_SB_COL');
          if (fsData.reportCount !== undefined) bump(fieldGapCounts, 'reportCount→NO_SB_COL');
          if (fsData.attemptCount !== undefined) bump(fieldGapCounts, 'attemptCount→NO_SB_COL');
          if (fsData.generationCount !== undefined) bump(fieldGapCounts, 'generationCount→NO_SB_COL');
          if (fsData.assertion) bump(fieldGapCounts, 'assertion→NO_SB_COL');
          if (fsData.reason) bump(fieldGapCounts, 'reason→NO_SB_COL');
          if (fsData.examId) bump(fieldGapCounts, 'examId→NO_SB_COL(curriculum_id covers it)');
        }
      }
    }
  }

  const sbOrphans = sbQuestions.filter(q => !sbMatched.has(q.id));

  sub('Questions summary');
  console.log(`  Firestore: ${fsTotal} | Supabase: ${sbQuestions.length}`);
  console.log(`  Matched: ${sbMatched.size} | In FS not SB: ${fsMissing.length} | In SB not FS: ${sbOrphans.length}`);

  if (fsMissing.length) {
    console.log(`\n  Firestore questions missing from Supabase (${fsMissing.length}):`);
    fsMissing.slice(0, 20).forEach(m => console.log(`    FS: ${m.fsId}  Expected SB: ${m.expectedSbId}  (${m.sourceType})`));
    if (fsMissing.length > 20) console.log(`    ... and ${fsMissing.length - 20} more`);
  }
  if (sbOrphans.length) {
    console.log(`\n  Supabase questions with no Firestore match (${sbOrphans.length}) — first 10:`);
    sbOrphans.slice(0, 10).forEach(q => console.log('    ', q.id, '|', q.source));
  }

  sub('Field gaps on matched questions');
  Object.entries(fieldGapCounts).sort((a,b) => b[1]-a[1]).forEach(([k, v]) => {
    const tag = k.includes('NO_SB_COL') ? '🔴 NO COLUMN' : k.includes('null') ? '🟡 COL EXISTS BUT NULL' : '🟢 DATA ISSUE';
    console.log(`  ${tag}  ${k}: ${v} rows`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Util
// ─────────────────────────────────────────────────────────────────────────────
function bump(obj, key) { obj[key] = (obj[key] || 0) + 1; }

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍  FULL FIRESTORE → SUPABASE AUDIT');
  console.log('    Date:', new Date().toISOString());

  const chapterIds = await getAllChapterIds();
  console.log('\nFirestore chapters found:');
  Object.entries(chapterIds).forEach(([subj, ids]) => console.log(`  ${subj}: ${ids.length} → [${ids.join(', ')}]`));

  await auditSubjects();
  await auditChapters(chapterIds);
  await auditTopics(chapterIds);
  await auditConcepts(chapterIds);
  await auditQuestions(chapterIds);

  sep('AUDIT COMPLETE');
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });
