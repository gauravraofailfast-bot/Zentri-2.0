#!/usr/bin/env node
'use strict';

/**
 * chapters-audit.cjs
 * Compares Firestore subjects/chapters against Supabase curricula/chapters tables.
 */

const admin = require('/Users/gauravrao/sprintup/functions/node_modules/firebase-admin');
const { createClient } = require('/Users/gauravrao/Zentri-2.0/node_modules/@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// ── Config ────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.join(
  process.env.HOME,
  'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json'
);

const SUPABASE_URL = 'https://ynpkjsfnapbhwjmkrfzc.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucGtqc2ZuYXBiaHdqbWtyZnpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYxNywiZXhwIjoyMDkyNTA4NjE3fQ.1cnZApxRKTd7XeMT6Pee4ZfaCSRi-k0EFqTwiMo7MlM';

const SUBJECTS = ['mathematics_basic', 'mathematics_standard'];
const EXAM_ID = 'cbse_class_10';

// Supabase column names for reference
const SUPABASE_CURRICULA_COLS = ['id', 'course', 'subject', 'icon', 'sort_order'];
const SUPABASE_CHAPTERS_COLS = [
  'id',
  'curriculum_id',
  'chapter_id',
  'chapter_name',
  'chapter_order',
  'page_range',
];

// ── Init ──────────────────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────
function separator(title) {
  const line = '═'.repeat(70);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(`${line}`);
}

function subSep(title) {
  console.log(`\n  ── ${title} ${'─'.repeat(60 - title.length)}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Zentri — Chapters & Subjects Audit');
  console.log('Started:', new Date().toISOString());

  // ── 1. Fetch Firestore subjects ──────────────────────────────────────────
  separator('1. FIRESTORE SUBJECTS');

  const firestoreSubjects = [];
  for (const subjectId of SUBJECTS) {
    const ref = db.doc(`exams/${EXAM_ID}/subjects/${subjectId}`);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log(`  [WARN] Subject doc not found: ${subjectId}`);
      continue;
    }
    const data = snap.data();
    firestoreSubjects.push({ id: subjectId, ...data });

    subSep(`Subject: ${subjectId}`);
    console.log('  Document ID:', subjectId);
    console.log('  Fields:');
    for (const [k, v] of Object.entries(data)) {
      console.log(`    ${k}:`, JSON.stringify(v));
    }
  }

  // ── 2. Fetch Firestore chapters ──────────────────────────────────────────
  separator('2. FIRESTORE CHAPTERS (sample 2-3 per subject)');

  const firestoreChaptersBySubject = {};
  for (const subjectId of SUBJECTS) {
    const colRef = db.collection(`exams/${EXAM_ID}/subjects/${subjectId}/chapters`);
    const snap = await colRef.get();
    const chapters = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    firestoreChaptersBySubject[subjectId] = chapters;

    subSep(`Subject: ${subjectId}  (${chapters.length} total chapters)`);

    // Print ALL fields from first 3 docs
    const sample = chapters.slice(0, 3);
    sample.forEach((ch, i) => {
      console.log(`\n  [Chapter ${i + 1}] ID: ${ch.id}`);
      for (const [k, v] of Object.entries(ch)) {
        if (k === 'id') continue;
        console.log(`    ${k}:`, JSON.stringify(v));
      }
    });
  }

  // ── 3. Collect all unique Firestore field names ──────────────────────────
  separator('3. FIELD INVENTORY');

  const subjectFieldSet = new Set();
  firestoreSubjects.forEach((s) => Object.keys(s).forEach((k) => subjectFieldSet.add(k)));
  subjectFieldSet.delete('id'); // Firestore doc ID is not a stored field

  const chapterFieldSet = new Set();
  Object.values(firestoreChaptersBySubject)
    .flat()
    .forEach((ch) => Object.keys(ch).forEach((k) => chapterFieldSet.add(k)));
  chapterFieldSet.delete('id');

  subSep('Firestore subject fields (all)');
  console.log(' ', [...subjectFieldSet].join(', '));

  subSep('Firestore chapter fields (all)');
  console.log(' ', [...chapterFieldSet].join(', '));

  // ── 4. Fetch Supabase curricula ──────────────────────────────────────────
  separator('4. SUPABASE CURRICULA TABLE');

  const { data: curricula, error: curriculaErr } = await supabase
    .from('curricula')
    .select('*')
    .in('subject', SUBJECTS);

  if (curriculaErr) {
    console.log('  [ERROR]', curriculaErr.message);
  } else {
    console.log(`  Rows returned: ${curricula.length}`);
    curricula.forEach((row) => {
      console.log('  Row:', JSON.stringify(row));
    });
  }

  // ── 5. Fetch Supabase chapters ───────────────────────────────────────────
  separator('5. SUPABASE CHAPTERS TABLE');

  // Get curriculum IDs for the subjects we care about
  const curriculumIds = (curricula || []).map((c) => c.id);
  const subjectToCurriculumId = {};
  (curricula || []).forEach((c) => {
    subjectToCurriculumId[c.subject] = c.id;
  });

  const { data: sbChapters, error: chapErr } = await supabase
    .from('chapters')
    .select('*')
    .in('curriculum_id', curriculumIds.length ? curriculumIds : ['__none__']);

  if (chapErr) {
    console.log('  [ERROR]', chapErr.message);
  } else {
    console.log(`  Total rows: ${sbChapters.length}`);
    // Sample 3
    sbChapters.slice(0, 3).forEach((row, i) => {
      console.log(`  [Row ${i + 1}]:`, JSON.stringify(row));
    });
  }

  // ── 6. Gap analysis — subjects vs curricula ──────────────────────────────
  separator('6. GAP ANALYSIS — SUBJECTS vs CURRICULA');

  // Map Firestore subject fields → expected Supabase curricula cols
  // We define a manual mapping based on common naming conventions
  const subjectFieldToSBCol = {
    name: 'subject',
    displayName: 'subject',
    title: 'subject',
    icon: 'icon',
    iconUrl: 'icon',
    order: 'sort_order',
    sortOrder: 'sort_order',
    sort_order: 'sort_order',
    course: 'course',
    exam: 'course',
    examId: 'course',
  };

  subSep('Firestore subject fields → Supabase curricula mapping');
  const unmappedSubjectFields = [];
  for (const field of subjectFieldSet) {
    const mapped = subjectFieldToSBCol[field];
    if (mapped) {
      console.log(`  ✓  ${field.padEnd(25)} → curricula.${mapped}`);
    } else {
      console.log(`  ✗  ${field.padEnd(25)} → [NO SUPABASE EQUIVALENT — data lost]`);
      unmappedSubjectFields.push(field);
    }
  }

  subSep('Supabase curricula columns with NO data source from Firestore');
  const mappedSBCurriculaCols = new Set(Object.values(subjectFieldToSBCol));
  // Always exclude 'id' — it's generated
  const unmappedSBCurriculaCols = SUPABASE_CURRICULA_COLS.filter(
    (col) => col !== 'id' && !mappedSBCurriculaCols.has(col)
  );
  if (unmappedSBCurriculaCols.length === 0) {
    console.log('  All Supabase curricula columns have a Firestore source.');
  } else {
    unmappedSBCurriculaCols.forEach((col) => {
      console.log(`  ✗  curricula.${col}  → [NO Firestore source]`);
    });
  }

  // ── 7. Gap analysis — chapters ───────────────────────────────────────────
  separator('7. GAP ANALYSIS — CHAPTERS vs SUPABASE CHAPTERS');

  const chapterFieldToSBCol = {
    name: 'chapter_name',
    title: 'chapter_name',
    chapterName: 'chapter_name',
    chapter_name: 'chapter_name',
    order: 'chapter_order',
    chapterOrder: 'chapter_order',
    chapter_order: 'chapter_order',
    sortOrder: 'chapter_order',
    sort_order: 'chapter_order',
    pageRange: 'page_range',
    page_range: 'page_range',
    chapterId: 'chapter_id',
    chapter_id: 'chapter_id',
    subjectId: 'curriculum_id',
    subject_id: 'curriculum_id',
    curriculumId: 'curriculum_id',
    curriculum_id: 'curriculum_id',
  };

  subSep('Firestore chapter fields → Supabase chapters mapping');
  const unmappedChapterFields = [];
  for (const field of chapterFieldSet) {
    const mapped = chapterFieldToSBCol[field];
    if (mapped) {
      console.log(`  ✓  ${field.padEnd(25)} → chapters.${mapped}`);
    } else {
      console.log(`  ✗  ${field.padEnd(25)} → [NO SUPABASE EQUIVALENT — data lost]`);
      unmappedChapterFields.push(field);
    }
  }

  subSep('Supabase chapters columns with NO data source from Firestore');
  const mappedSBChapterCols = new Set(Object.values(chapterFieldToSBCol));
  const unmappedSBChapterCols = SUPABASE_CHAPTERS_COLS.filter(
    (col) => col !== 'id' && !mappedSBChapterCols.has(col)
  );
  if (unmappedSBChapterCols.length === 0) {
    console.log('  All Supabase chapters columns have a Firestore source.');
  } else {
    unmappedSBChapterCols.forEach((col) => {
      console.log(`  ✗  chapters.${col}  → [NO Firestore source]`);
    });
  }

  // ── 8. Chapter counts per subject ────────────────────────────────────────
  separator('8. CHAPTER COUNT COMPARISON (Firestore vs Supabase)');

  const sbChaptersByCurriculumId = {};
  (sbChapters || []).forEach((ch) => {
    if (!sbChaptersByCurriculumId[ch.curriculum_id]) {
      sbChaptersByCurriculumId[ch.curriculum_id] = [];
    }
    sbChaptersByCurriculumId[ch.curriculum_id].push(ch);
  });

  console.log(`\n  ${'Subject'.padEnd(30)} ${'Firestore'.padEnd(12)} ${'Supabase'.padEnd(12)} Status`);
  console.log(`  ${'─'.repeat(65)}`);
  for (const subjectId of SUBJECTS) {
    const fsCount = (firestoreChaptersBySubject[subjectId] || []).length;
    const currId = subjectToCurriculumId[subjectId];
    const sbCount = currId ? (sbChaptersByCurriculumId[currId] || []).length : 0;
    const status =
      fsCount === 0 && sbCount === 0
        ? 'BOTH EMPTY'
        : fsCount === sbCount
        ? 'MATCH ✓'
        : fsCount > sbCount
        ? `MISSING ${fsCount - sbCount} in Supabase`
        : `EXTRA ${sbCount - fsCount} in Supabase`;
    console.log(`  ${subjectId.padEnd(30)} ${String(fsCount).padEnd(12)} ${String(sbCount).padEnd(12)} ${status}`);
  }

  // ── 9. Summary ───────────────────────────────────────────────────────────
  separator('9. SUMMARY');

  console.log('\n  SUBJECTS / CURRICULA:');
  console.log(`    Firestore subjects scanned : ${firestoreSubjects.length}`);
  console.log(`    Supabase curricula rows    : ${(curricula || []).length}`);
  if (unmappedSubjectFields.length) {
    console.log(`    Firestore fields LOST in migration (${unmappedSubjectFields.length}): ${unmappedSubjectFields.join(', ')}`);
  } else {
    console.log('    No Firestore subject fields are lost — all map to Supabase.');
  }

  console.log('\n  CHAPTERS:');
  let totalFS = 0;
  let totalSB = 0;
  for (const subjectId of SUBJECTS) {
    totalFS += (firestoreChaptersBySubject[subjectId] || []).length;
    const currId = subjectToCurriculumId[subjectId];
    totalSB += currId ? (sbChaptersByCurriculumId[currId] || []).length : 0;
  }
  console.log(`    Firestore chapters total   : ${totalFS}`);
  console.log(`    Supabase chapters total    : ${totalSB}`);
  if (unmappedChapterFields.length) {
    console.log(`    Firestore fields LOST in migration (${unmappedChapterFields.length}): ${unmappedChapterFields.join(', ')}`);
  } else {
    console.log('    No Firestore chapter fields are lost — all map to Supabase.');
  }

  console.log('\nAudit complete:', new Date().toISOString());
  process.exit(0);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
