'use strict';

/**
 * topics-audit.cjs
 * Compares every Firestore topic doc against its Supabase counterpart.
 * Reports field-level gaps, missing rows, and theory key differences.
 */

const admin = require('/Users/gauravrao/sprintup/functions/node_modules/firebase-admin');
const { createClient } = require('/Users/gauravrao/Zentri-2.0/node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.join(
  process.env.HOME,
  'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json'
);

const SUPABASE_URL = 'https://ynpkjsfnapbhwjmkrfzc.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucGtqc2ZuYXBiaHdqbWtyZnpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYxNywiZXhwIjoyMDkyNTA4NjE3fQ.1cnZApxRKTd7XeMT6Pee4ZfaCSRi-k0EFqTwiMo7MlM';

const SUBJECTS = ['mathematics_basic', 'mathematics_standard'];
const EXAM_ID = 'cbse_class_10';

// Supabase curriculum IDs per subject — adjust if they differ
// We'll discover them dynamically from Supabase
const CURRICULUM_ID_MAP = {};  // filled at runtime

// ── Init Firebase ────────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sprintup-eecbe',
});
const db = admin.firestore();

// ── Init Supabase ────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Helpers ──────────────────────────────────────────────────────────────────
function hr(char = '─', len = 80) {
  return char.repeat(len);
}

function printSection(title) {
  console.log('\n' + hr('═'));
  console.log(`  ${title}`);
  console.log(hr('═'));
}

function printSubSection(title) {
  console.log('\n' + hr('-'));
  console.log(`  ${title}`);
  console.log(hr('-'));
}

// ── Step 1: Fetch all Firestore topics ───────────────────────────────────────
async function fetchFirestoreTopics() {
  printSection('STEP 1 — Fetching Firestore topics');
  const allTopics = [];

  for (const subjectId of SUBJECTS) {
    console.log(`\n  Subject: ${subjectId}`);
    const chaptersSnap = await db
      .collection(`exams/${EXAM_ID}/subjects/${subjectId}/chapters`)
      .get();

    console.log(`    Chapters found: ${chaptersSnap.size}`);

    for (const chapterDoc of chaptersSnap.docs) {
      const chapterId = chapterDoc.id;
      const topicsSnap = await db
        .collection(`exams/${EXAM_ID}/subjects/${subjectId}/chapters/${chapterId}/topics`)
        .get();

      console.log(`      Chapter ${chapterId}: ${topicsSnap.size} topics`);

      for (const topicDoc of topicsSnap.docs) {
        allTopics.push({
          subjectId,
          chapterId,
          topicId: topicDoc.id,
          data: topicDoc.data(),
        });
      }
    }
  }

  console.log(`\n  Total Firestore topics: ${allTopics.length}`);
  return allTopics;
}

// ── Step 2: Print sample Firestore topic ─────────────────────────────────────
function printSampleFirestoreTopic(topics) {
  printSection('STEP 2 — Sample Firestore topic (ALL fields)');
  // Pick the first topic that has a "theory" field, or just first topic
  const withTheory = topics.find(t => t.data.theory);
  const sample = withTheory || topics[0];
  if (!sample) {
    console.log('  No topics found!');
    return;
  }
  console.log(`\n  Path: exams/${EXAM_ID}/subjects/${sample.subjectId}/chapters/${sample.chapterId}/topics/${sample.topicId}`);
  console.log(`  Fields present: ${Object.keys(sample.data).join(', ')}`);
  console.log('\n  Full doc:');
  const data = sample.data;
  for (const [key, val] of Object.entries(data)) {
    if (key === 'theory' && typeof val === 'object') {
      console.log(`    ${key}: [object with keys: ${Object.keys(val).join(', ')}]`);
      // Show a snippet of theory keys/lengths
      for (const [tk, tv] of Object.entries(val)) {
        const preview = typeof tv === 'string'
          ? tv.substring(0, 80).replace(/\n/g, '\\n') + (tv.length > 80 ? '…' : '')
          : JSON.stringify(tv).substring(0, 80);
        console.log(`        ${tk}: "${preview}"`);
      }
    } else if (typeof val === 'string') {
      console.log(`    ${key}: "${val.substring(0, 100).replace(/\n/g, '\\n')}${val.length > 100 ? '…' : ''}"`);
    } else {
      console.log(`    ${key}: ${JSON.stringify(val).substring(0, 150)}`);
    }
  }
}

// ── Step 3: Discover Supabase curriculum IDs ─────────────────────────────────
async function discoverCurriculumIds() {
  printSection('STEP 3 — Discovering Supabase curriculum IDs');
  const { data, error } = await supabase
    .from('curricula')
    .select('id, subject_id, name')
    .order('id');

  if (error) {
    console.error('  ERROR fetching curricula:', error.message);
    return;
  }

  console.log(`  Curricula rows: ${data.length}`);
  for (const row of data) {
    console.log(`    id=${row.id}  subject_id=${row.subject_id}  name=${row.name}`);
  }

  // Map subject_id -> curriculum id for subjects we care about
  for (const subject of SUBJECTS) {
    const match = data.find(r => r.subject_id === subject || r.id.includes(subject));
    if (match) {
      CURRICULUM_ID_MAP[subject] = match.id;
      console.log(`  Mapped ${subject} -> ${match.id}`);
    } else {
      console.log(`  WARNING: No curriculum found for subject=${subject}`);
    }
  }
}

// ── Step 4: Fetch ALL Supabase topics ────────────────────────────────────────
async function fetchAllSupabaseTopics() {
  printSection('STEP 4 — Fetching ALL Supabase topics');
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('id');

  if (error) {
    console.error('  ERROR fetching Supabase topics:', error.message);
    return [];
  }

  console.log(`  Total Supabase topics: ${data.length}`);

  // Print column names from first row
  if (data.length > 0) {
    console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
  }

  return data;
}

// ── Step 5: Compare each Firestore topic vs Supabase ────────────────────────
function buildExpectedSupabaseId(subjectId, chapterId, topicId) {
  const curriculumId = CURRICULUM_ID_MAP[subjectId];
  if (!curriculumId) return `UNKNOWN-${chapterId}-${topicId}`;
  return `${curriculumId}-${chapterId}-${topicId}`;
}

function compareTheory(fsTheory, sbTheory) {
  const result = { match: true, details: [] };

  const fsKeys = fsTheory && typeof fsTheory === 'object' ? Object.keys(fsTheory) : [];
  const sbKeys = sbTheory && typeof sbTheory === 'object' ? Object.keys(sbTheory) : [];

  const onlyInFs = fsKeys.filter(k => !sbKeys.includes(k));
  const onlyInSb = sbKeys.filter(k => !fsKeys.includes(k));
  const inBoth = fsKeys.filter(k => sbKeys.includes(k));

  if (onlyInFs.length) {
    result.match = false;
    result.details.push(`Theory keys only in Firestore: ${onlyInFs.join(', ')}`);
  }
  if (onlyInSb.length) {
    result.match = false;
    result.details.push(`Theory keys only in Supabase: ${onlyInSb.join(', ')}`);
  }

  // Check for content differences in shared keys
  for (const key of inBoth) {
    const fsVal = typeof fsTheory[key] === 'string' ? fsTheory[key].trim() : JSON.stringify(fsTheory[key]);
    const sbVal = typeof sbTheory[key] === 'string' ? sbTheory[key].trim() : JSON.stringify(sbTheory[key]);
    if (fsVal !== sbVal) {
      result.match = false;
      result.details.push(`Theory key "${key}" differs — FS len=${fsVal.length}, SB len=${sbVal.length}`);
    }
  }

  return result;
}

async function runComparison(fsTopics, sbTopicsArr) {
  printSection('STEP 5 — Field-by-field comparison');

  // Build a lookup map for Supabase topics
  const sbMap = {};
  for (const row of sbTopicsArr) {
    sbMap[row.id] = row;
  }

  const sbIdsMatched = new Set();

  // Track stats
  let totalFs = fsTopics.length;
  let matched = 0;
  let missingInSb = 0;
  let theoryMismatches = 0;
  let fieldGaps = 0;

  const missingRows = [];
  const gapRows = [];
  const theoryIssues = [];

  // Define which Firestore fields we expect in Supabase (rough mapping)
  const FS_TO_SB_FIELD_MAP = {
    name: 'name',
    description: 'description',
    theory: 'theory',
    sourceReference: 'source_reference',
    language: 'language',
    order: 'order',
    chapterId: 'chapter_id',
    subjectId: 'subject_id',
  };

  for (const fsItem of fsTopics) {
    const { subjectId, chapterId, topicId, data } = fsItem;
    const expectedId = buildExpectedSupabaseId(subjectId, chapterId, topicId);
    const sbRow = sbMap[expectedId];

    if (!sbRow) {
      missingInSb++;
      missingRows.push({ subjectId, chapterId, topicId, expectedId });
      continue;
    }

    sbIdsMatched.add(expectedId);
    matched++;

    // Field-by-field comparison
    const fsFields = Object.keys(data);
    const sbFields = Object.keys(sbRow);
    const gaps = [];

    // Check each Firestore field
    for (const fsField of fsFields) {
      if (fsField === 'theory') {
        // Special handling below
        continue;
      }
      const sbField = FS_TO_SB_FIELD_MAP[fsField];
      if (!sbField) {
        gaps.push(`FS field "${fsField}" has no known Supabase mapping`);
        continue;
      }
      if (!(sbField in sbRow)) {
        gaps.push(`FS field "${fsField}" → SB column "${sbField}" does NOT exist in Supabase schema`);
      } else if (sbRow[sbField] === null || sbRow[sbField] === undefined || sbRow[sbField] === '') {
        gaps.push(`FS field "${fsField}" is populated but Supabase "${sbField}" is null/empty`);
      }
    }

    // Theory comparison
    const fsHasTheory = 'theory' in data && data.theory !== null && data.theory !== undefined;
    const sbHasTheory = 'theory' in sbRow && sbRow.theory !== null && sbRow.theory !== undefined;

    if (fsHasTheory && !sbHasTheory) {
      gaps.push('FS has theory, Supabase theory is NULL');
    } else if (!fsHasTheory && sbHasTheory) {
      gaps.push('FS has NO theory, but Supabase has theory');
    } else if (fsHasTheory && sbHasTheory) {
      const theoryComp = compareTheory(data.theory, sbRow.theory);
      if (!theoryComp.match) {
        gaps.push(...theoryComp.details.map(d => `Theory mismatch: ${d}`));
        theoryIssues.push({ subjectId, chapterId, topicId, expectedId, details: theoryComp.details });
        theoryMismatches++;
      }
    }

    if (gaps.length > 0) {
      fieldGaps++;
      gapRows.push({ subjectId, chapterId, topicId, expectedId, gaps });
    }
  }

  // Supabase topics with no Firestore match
  const sbOnlyIds = [];
  for (const sbId of Object.keys(sbMap)) {
    if (!sbIdsMatched.has(sbId)) {
      sbOnlyIds.push(sbId);
    }
  }

  // ── Print detailed gap report ──────────────────────────────────────────────
  printSubSection('Topics MISSING in Supabase (Firestore has them, Supabase does not)');
  if (missingRows.length === 0) {
    console.log('  None — all Firestore topics have a matching Supabase row.');
  } else {
    for (const r of missingRows) {
      console.log(`  MISSING: expectedId="${r.expectedId}"  (subject=${r.subjectId}, chapter=${r.chapterId}, topic=${r.topicId})`);
    }
  }

  printSubSection('Topics in Supabase with NO matching Firestore doc');
  if (sbOnlyIds.length === 0) {
    console.log('  None — all Supabase topics correspond to a Firestore doc.');
  } else {
    for (const id of sbOnlyIds.slice(0, 50)) {
      console.log(`  SUPABASE-ONLY: id="${id}"`);
    }
    if (sbOnlyIds.length > 50) {
      console.log(`  ... and ${sbOnlyIds.length - 50} more`);
    }
  }

  printSubSection('Field-level gaps (Firestore field populated, Supabase column null/missing)');
  if (gapRows.length === 0) {
    console.log('  No field-level gaps found!');
  } else {
    for (const r of gapRows) {
      console.log(`\n  Topic: ${r.expectedId}`);
      for (const g of r.gaps) {
        console.log(`    GAP: ${g}`);
      }
    }
  }

  printSubSection('Theory key mismatches (detail)');
  if (theoryIssues.length === 0) {
    console.log('  No theory mismatches!');
  } else {
    for (const t of theoryIssues) {
      console.log(`\n  Topic: ${t.expectedId}`);
      for (const d of t.details) {
        console.log(`    ${d}`);
      }
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  printSection('SUMMARY');
  console.log(`  Total Firestore topics:               ${totalFs}`);
  console.log(`  Matched in Supabase:                  ${matched}`);
  console.log(`  Missing in Supabase (FS only):        ${missingInSb}`);
  console.log(`  In Supabase but not in Firestore:     ${sbOnlyIds.length}`);
  console.log(`  Topics with field-level gaps:         ${fieldGaps}`);
  console.log(`  Topics with theory mismatches:        ${theoryMismatches}`);
}

// ── Step 6: Print theory field structure from a sample ──────────────────────
async function printTheoryStructure(fsTopics, sbTopicsArr) {
  printSection('STEP 6 — Theory field structure deep-dive');

  const withFsTheory = fsTopics.filter(t => t.data.theory);
  console.log(`  Firestore topics with theory: ${withFsTheory.length} / ${fsTopics.length}`);

  if (withFsTheory.length > 0) {
    const sample = withFsTheory[0];
    const expectedId = buildExpectedSupabaseId(sample.subjectId, sample.chapterId, sample.topicId);
    console.log(`\n  Sample FS theory topic: ${expectedId}`);
    console.log(`  FS theory keys: ${Object.keys(sample.data.theory).join(', ')}`);

    // Show all theory key types and value lengths
    for (const [k, v] of Object.entries(sample.data.theory)) {
      const type = typeof v;
      const len = type === 'string' ? v.length : Array.isArray(v) ? v.length : JSON.stringify(v).length;
      console.log(`    ${k}: type=${type}, len=${len}`);
      if (type === 'string') {
        console.log(`      preview: "${v.substring(0, 120).replace(/\n/g, '\\n')}${v.length > 120 ? '…' : ''}"`);
      } else if (Array.isArray(v) && v.length > 0) {
        console.log(`      first item: ${JSON.stringify(v[0]).substring(0, 120)}`);
      }
    }
  }

  // Supabase theory sample
  const sbWithTheory = sbTopicsArr.filter(r => r.theory !== null && r.theory !== undefined);
  console.log(`\n  Supabase topics with theory: ${sbWithTheory.length} / ${sbTopicsArr.length}`);

  if (sbWithTheory.length > 0) {
    const sample = sbWithTheory[0];
    console.log(`\n  Sample SB theory topic: ${sample.id}`);
    const theory = sample.theory;
    if (typeof theory === 'object' && theory !== null) {
      console.log(`  SB theory keys: ${Object.keys(theory).join(', ')}`);
      for (const [k, v] of Object.entries(theory)) {
        const type = typeof v;
        const len = type === 'string' ? v.length : Array.isArray(v) ? v.length : JSON.stringify(v).length;
        console.log(`    ${k}: type=${type}, len=${len}`);
        if (type === 'string') {
          console.log(`      preview: "${v.substring(0, 120).replace(/\n/g, '\\n')}${v.length > 120 ? '…' : ''}"`);
        } else if (Array.isArray(v) && v.length > 0) {
          console.log(`      first item: ${JSON.stringify(v[0]).substring(0, 120)}`);
        }
      }
    } else {
      console.log(`  SB theory value type: ${typeof theory}`);
      console.log(`  SB theory preview: ${JSON.stringify(theory).substring(0, 200)}`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(hr('═'));
  console.log('  ZENTRI — TOPICS AUDIT: Firestore vs Supabase');
  console.log(`  Run at: ${new Date().toISOString()}`);
  console.log(hr('═'));

  try {
    const fsTopics = await fetchFirestoreTopics();
    printSampleFirestoreTopic(fsTopics);
    await discoverCurriculumIds();
    const sbTopics = await fetchAllSupabaseTopics();
    await runComparison(fsTopics, sbTopics);
    await printTheoryStructure(fsTopics, sbTopics);
  } catch (err) {
    console.error('\nFATAL ERROR:', err);
    process.exit(1);
  }

  console.log('\n' + hr('═'));
  console.log('  Audit complete.');
  console.log(hr('═'));
  process.exit(0);
}

main();
