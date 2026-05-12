#!/usr/bin/env node
'use strict';

const admin = require('/Users/gauravrao/sprintup/functions/node_modules/firebase-admin');
const { createClient } = require('/Users/gauravrao/Zentri-2.0/node_modules/@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SERVICE_ACCOUNT_PATH = path.join(
  process.env.HOME,
  'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json'
);

// Parse .env.local manually
const ENV_PATH = '/Users/gauravrao/Zentri-2.0/.env.local';
const envContent = fs.readFileSync(ENV_PATH, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) envVars[m[1].trim()] = m[2].trim();
}

const SUPABASE_URL = envVars['VITE_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = envVars['VITE_SUPABASE_SERVICE_KEY'];

const SUBJECTS = ['mathematics_basic', 'mathematics_standard'];
const EXAM_ID = 'cbse_class_10';

// ---------------------------------------------------------------------------
// Init clients
// ---------------------------------------------------------------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
  });
}
const db = admin.firestore();
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function getAllFirestoreConcepts() {
  const concepts = [];

  for (const subjectId of SUBJECTS) {
    const chaptersRef = db
      .collection('exams')
      .doc(EXAM_ID)
      .collection('subjects')
      .doc(subjectId)
      .collection('chapters');

    const chaptersSnap = await chaptersRef.get();
    console.log(`\n[Firestore] Subject: ${subjectId} → ${chaptersSnap.size} chapters`);

    for (const chapterDoc of chaptersSnap.docs) {
      const chapterId = chapterDoc.id;
      const topicsRef = chaptersRef.doc(chapterId).collection('topics');
      const topicsSnap = await topicsRef.get();

      for (const topicDoc of topicsSnap.docs) {
        const topicId = topicDoc.id;
        const conceptsRef = topicsRef.doc(topicId).collection('concepts');
        const conceptsSnap = await conceptsRef.get();

        for (const conceptDoc of conceptsSnap.docs) {
          concepts.push({
            _subjectId: subjectId,
            _chapterId: chapterId,
            _topicId: topicId,
            _docId: conceptDoc.id,
            ...conceptDoc.data(),
          });
        }
      }
    }
  }

  return concepts;
}

async function getAllSupabaseConcepts() {
  const allRows = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('concepts')
      .select('*')
      .range(from, from + PAGE - 1);
    if (error) throw new Error('Supabase fetch error: ' + error.message);
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allRows;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  console.log('='.repeat(70));
  console.log('CONCEPTS AUDIT — Firestore vs Supabase');
  console.log('='.repeat(70));

  // 1. Fetch all Firestore concepts
  console.log('\n[1] Fetching Firestore concepts …');
  const firestoreConcepts = await getAllFirestoreConcepts();
  console.log(`\n    Total Firestore concepts: ${firestoreConcepts.length}`);

  // 2. Print a sample Firestore doc (all fields)
  if (firestoreConcepts.length > 0) {
    console.log('\n' + '─'.repeat(70));
    console.log('SAMPLE FIRESTORE CONCEPT DOC (first doc, all fields):');
    console.log('─'.repeat(70));
    console.log(JSON.stringify(firestoreConcepts[0], null, 2));
    console.log('─'.repeat(70));
  }

  // 3. Collect all Firestore field names across all docs
  const allFirestoreFields = new Set();
  for (const c of firestoreConcepts) {
    for (const k of Object.keys(c)) {
      if (!k.startsWith('_')) allFirestoreFields.add(k);
    }
  }
  console.log('\nAll Firestore concept fields seen across all docs:');
  console.log([...allFirestoreFields].sort().join(', '));

  // 4. Fetch all Supabase concepts
  console.log('\n[2] Fetching Supabase concepts …');
  const supabaseConcepts = await getAllSupabaseConcepts();
  console.log(`    Total Supabase concepts: ${supabaseConcepts.length}`);

  // Build Supabase lookup by id
  const supabaseById = new Map();
  for (const row of supabaseConcepts) {
    supabaseById.set(row.id, row);
  }

  // 5. Collect Supabase column names
  const supabaseColumns = supabaseConcepts.length > 0
    ? Object.keys(supabaseConcepts[0]).sort()
    : [];
  console.log('\nSupabase concepts columns:');
  console.log(supabaseColumns.join(', '));

  // 6. Core Firestore fields to compare
  const CORE_FIELDS = [
    'conceptId',
    'name',
    'description',
    'topicId',
    'sortOrder',
    'language',
    'estimatedDuration',
    'prerequisites',
    'learningObjectives',
    'difficulty',
  ];

  // 7. Walk Firestore concepts and match to Supabase
  let missingInSupabase = 0;
  let matched = 0;

  // field-level gap tracking
  const fieldPresentInFirestore = {}; // field → count of docs where field exists
  const fieldMissingInSupabase = {}; // field → count of matched docs where supabase col is null/undefined
  for (const f of CORE_FIELDS) {
    fieldPresentInFirestore[f] = 0;
    fieldMissingInSupabase[f] = 0;
  }

  const missingDocs = [];
  const fieldGapExamples = {}; // field → first example

  for (const concept of firestoreConcepts) {
    // Compute expected Supabase ID
    const conceptKey = concept.conceptId || concept._docId;
    // curriculum id format: we'll try a few patterns
    // pattern: {examId}-{subjectId}-{chapterId}-{conceptKey}
    // or maybe just {chapterId}-{conceptKey}
    // We'll try both and see what matches

    const chapterId = concept._chapterId;
    const subjectId = concept._subjectId;

    // Possible IDs to try
    const candidateIds = [
      `${EXAM_ID}-${subjectId}-${chapterId}-${conceptKey}`,
      `${chapterId}-${conceptKey}`,
      conceptKey,
      concept._docId,
    ];

    let sbRow = null;
    for (const cid of candidateIds) {
      if (supabaseById.has(cid)) {
        sbRow = supabaseById.get(cid);
        break;
      }
    }

    if (!sbRow) {
      missingInSupabase++;
      missingDocs.push({
        docId: concept._docId,
        subject: subjectId,
        chapter: chapterId,
        topic: concept._topicId,
        conceptId: conceptKey,
        triedIds: candidateIds,
      });
      continue;
    }

    matched++;

    // Field-level comparison
    for (const field of CORE_FIELDS) {
      if (concept[field] !== undefined) {
        fieldPresentInFirestore[field]++;

        // Map Firestore field → Supabase column (best-guess mapping)
        const sbField = field; // assume same name; adjust below
        const sbVal = sbRow[sbField];

        if (sbVal === null || sbVal === undefined || sbVal === '') {
          fieldMissingInSupabase[field]++;
          if (!fieldGapExamples[field]) {
            fieldGapExamples[field] = {
              firestoreValue: concept[field],
              supabaseRow: sbRow,
            };
          }
        }
      }
    }
  }

  // 8. Supabase concepts with no matching Firestore doc
  // Build a set of all conceptKeys from Firestore
  const firestoreConceptKeys = new Set();
  for (const c of firestoreConcepts) {
    const key = c.conceptId || c._docId;
    // store all candidate ids we'd generate
    firestoreConceptKeys.add(`${EXAM_ID}-${c._subjectId}-${c._chapterId}-${key}`);
    firestoreConceptKeys.add(`${c._chapterId}-${key}`);
    firestoreConceptKeys.add(key);
    firestoreConceptKeys.add(c._docId);
  }

  let missingInFirestore = 0;
  const missingInFirestoreDocs = [];
  for (const row of supabaseConcepts) {
    if (!firestoreConceptKeys.has(row.id)) {
      missingInFirestore++;
      missingInFirestoreDocs.push(row.id);
    }
  }

  // ---------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------
  console.log('\n' + '='.repeat(70));
  console.log('AUDIT REPORT');
  console.log('='.repeat(70));

  console.log(`\n📊 TOTALS`);
  console.log(`  Firestore concepts : ${firestoreConcepts.length}`);
  console.log(`  Supabase concepts  : ${supabaseConcepts.length}`);
  console.log(`  Matched            : ${matched}`);
  console.log(`  Missing in Supabase: ${missingInSupabase}`);
  console.log(`  Missing in Firestore (Supabase rows with no FS doc): ${missingInFirestore}`);

  console.log('\n📋 FIELD-LEVEL GAPS (matched docs only)');
  console.log('  Field                  | FS has it | SB null/missing | Gap %');
  console.log('  ' + '─'.repeat(66));
  for (const field of CORE_FIELDS) {
    const fsCount = fieldPresentInFirestore[field];
    const sbMissing = fieldMissingInSupabase[field];
    const gapPct = fsCount > 0 ? ((sbMissing / fsCount) * 100).toFixed(1) : 'N/A';
    const fieldPad = field.padEnd(22);
    console.log(`  ${fieldPad} | ${String(fsCount).padStart(9)} | ${String(sbMissing).padStart(15)} | ${gapPct}%`);
  }

  if (missingDocs.length > 0) {
    console.log('\n🔴 FIRESTORE CONCEPTS MISSING FROM SUPABASE (first 20):');
    for (const d of missingDocs.slice(0, 20)) {
      console.log(`  subject=${d.subject} chapter=${d.chapter} topic=${d.topic} conceptId=${d.conceptId}`);
      console.log(`    tried ids: ${d.triedIds.join(' | ')}`);
    }
    if (missingDocs.length > 20) {
      console.log(`  … and ${missingDocs.length - 20} more`);
    }
  }

  if (missingInFirestoreDocs.length > 0) {
    console.log('\n🟡 SUPABASE CONCEPTS WITH NO MATCHING FIRESTORE DOC (first 20):');
    for (const id of missingInFirestoreDocs.slice(0, 20)) {
      console.log(`  ${id}`);
    }
    if (missingInFirestoreDocs.length > 20) {
      console.log(`  … and ${missingInFirestoreDocs.length - 20} more`);
    }
  }

  if (Object.keys(fieldGapExamples).length > 0) {
    console.log('\n🔍 FIELD GAP EXAMPLES (first matched doc missing each field in Supabase):');
    for (const [field, ex] of Object.entries(fieldGapExamples)) {
      console.log(`\n  Field: ${field}`);
      console.log(`    Firestore value  : ${JSON.stringify(ex.firestoreValue)}`);
      console.log(`    Supabase row id  : ${ex.supabaseRow.id}`);
      console.log(`    Supabase col val : ${JSON.stringify(ex.supabaseRow[field])}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(70));

  process.exit(0);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
