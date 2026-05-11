#!/usr/bin/env node
/**
 * fix-concept-topic-ids.cjs
 *
 * PROBLEM:
 *   concepts.topic_id was set from local JSON files (e.g. 'nth_term', 'hcf_lcm')
 *   topics.topic_id came from Firestore document IDs (e.g. 'nth_term_ap', 'ap_fundamentals')
 *   Result: only 10/143 concept topic_ids match the topics table → theory unreachable
 *
 * FIX:
 *   Walk Firestore hierarchy: subjects → chapters → topics → concepts
 *   Build: conceptKey + chapterId + subjectId → Firestore topicId
 *   Update concepts.topic_id with the correct Firestore-sourced topic_id
 *
 * Run: node scripts/fix-concept-topic-ids.cjs
 */

'use strict';

const admin = require('/Users/gauravrao/sprintup/functions/node_modules/firebase-admin');
const { createClient } = require('../node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(
  process.env.HOME,
  'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json'
);
const ENV_PATH = path.join(__dirname, '../.env.local');

const SUBJECT_TO_CURRICULUM = {
  mathematics_basic:    'class10-math-basic',
  mathematics_standard: 'class10-math-standard',
};

// Init
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
const db = admin.firestore();

async function main() {
  console.log('\n🔧 Fixing concepts.topic_id to match Firestore topic document IDs\n');

  // ── 1. Walk Firestore: subjects → chapters → topics → concepts
  //    Build map: `{curriculumId}::{chapterId}::{conceptKey}` → firestoreTopicId
  const conceptToTopic = new Map(); // key → topicId

  const subjectsSnap = await db.collection('exams').doc('cbse_class_10').collection('subjects').get();

  for (const subjectDoc of subjectsSnap.docs) {
    const subjectId = subjectDoc.id;
    const curriculumId = SUBJECT_TO_CURRICULUM[subjectId];
    if (!curriculumId) continue;

    console.log(`📖 ${subjectId}`);

    const chaptersSnap = await subjectDoc.ref.collection('chapters').get();

    for (const chapterDoc of chaptersSnap.docs) {
      const chapterId = chapterDoc.id;
      const topicsSnap = await chapterDoc.ref.collection('topics').get();

      for (const topicDoc of topicsSnap.docs) {
        const firestoreTopicId = topicDoc.id;
        const conceptsSnap = await topicDoc.ref.collection('concepts').get();

        for (const conceptDoc of conceptsSnap.docs) {
          const conceptData = conceptDoc.data();
          const conceptKey = conceptData.conceptId || conceptDoc.id;
          const mapKey = `${curriculumId}::${chapterId}::${conceptKey}`;
          conceptToTopic.set(mapKey, firestoreTopicId);
        }
      }
    }
  }

  console.log(`\n📦 Firestore concept→topic map built: ${conceptToTopic.size} entries`);

  // ── 2. Fetch all concepts from Supabase
  const { data: concepts, error } = await supabase
    .from('concepts')
    .select('id, curriculum_id, chapter_id, concept_key, topic_id');
  if (error) throw new Error('fetch concepts: ' + error.message);

  console.log(`📋 ${concepts.length} concept rows to check\n`);

  // ── 3. For each concept, look up the correct Firestore topicId and update if different
  let updated = 0;
  let alreadyCorrect = 0;
  let notFound = 0;
  const notFoundList = [];

  for (const c of concepts) {
    const mapKey = `${c.curriculum_id}::${c.chapter_id}::${c.concept_key}`;
    const correctTopicId = conceptToTopic.get(mapKey);

    if (!correctTopicId) {
      notFound++;
      notFoundList.push(`${c.curriculum_id}/${c.chapter_id}/${c.concept_key}`);
      continue;
    }

    if (c.topic_id === correctTopicId) {
      alreadyCorrect++;
      continue;
    }

    // Update to the correct Firestore topicId
    const { error: updateErr } = await supabase
      .from('concepts')
      .update({ topic_id: correctTopicId })
      .eq('id', c.id);

    if (updateErr) {
      console.error(`  ❌ Failed to update ${c.id}: ${updateErr.message}`);
    } else {
      updated++;
    }
  }

  console.log('📊 RESULTS');
  console.log('═'.repeat(50));
  console.log(`  Updated:         ${updated}`);
  console.log(`  Already correct: ${alreadyCorrect}`);
  console.log(`  Not in Firestore: ${notFound}`);

  if (notFoundList.length > 0) {
    console.log('\n  Not found in Firestore hierarchy:');
    notFoundList.forEach(k => console.log('    ⚠️ ', k));
  }

  // ── 4. Verify theory reachability after fix
  const { data: allConcepts } = await supabase
    .from('concepts')
    .select('id, curriculum_id, chapter_id, topic_id');

  const { data: allTopics } = await supabase
    .from('topics')
    .select('curriculum_id, chapter_id, topic_id');

  const topicSet = new Set(allTopics.map(t => `${t.curriculum_id}::${t.chapter_id}::${t.topic_id}`));
  const reachableConceptIds = new Set(
    allConcepts
      .filter(c => topicSet.has(`${c.curriculum_id}::${c.chapter_id}::${c.topic_id}`))
      .map(c => c.id)
  );

  const { data: linkedQ } = await supabase
    .from('questions')
    .select('concept_id')
    .not('concept_id', 'is', null);

  const reachable = linkedQ.filter(q => reachableConceptIds.has(q.concept_id)).length;

  console.log(`\n✅ Theory reachability after fix: ${reachable} / ${linkedQ.length} questions`);
  console.log(reachable === linkedQ.length
    ? '🎉 All linked questions can reach theory!\n'
    : `⚠️  ${linkedQ.length - reachable} questions still cannot reach theory\n`
  );
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
