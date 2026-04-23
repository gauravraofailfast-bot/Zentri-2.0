#!/usr/bin/env node

/**
 * Sprint 0: Firestore → Supabase migration
 * Migrates NCERT concepts + PYQs from Firestore (cbse_class_10) to Supabase
 */

const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
  path.join(process.env.HOME, 'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json');

console.log(`📂 Looking for service account at: ${serviceAccountPath}`);

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account JSON not found`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Firebase init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// Supabase init
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// MIGRATION
// ============================================================================

async function migrate() {
  console.log('\n🚀 Starting Firestore → Supabase migration...\n');

  try {
    // Use Maps to deduplicate by ID (same topic can appear in both math_basic + math_standard)
    const conceptsMap = new Map();
    const questionsMap = new Map();

    let chapterCount = 0;
    let conceptCount = 0;
    let pyqCount = 0;

    // Get all subjects under cbse_class_10, then their chapters
    const subjectsSnap = await firestore
      .collection('exams')
      .doc('cbse_class_10')
      .collection('subjects')
      .get();

    console.log(`📚 Found ${subjectsSnap.size} subjects\n`);

    for (const subjectDoc of subjectsSnap.docs) {
      const subjectId = subjectDoc.id;
      console.log(`📖 Subject: ${subjectId}\n`);

      // Get chapters for this subject
      const chaptersSnap = await subjectDoc.ref.collection('chapters').get();

      for (const chapterDoc of chaptersSnap.docs) {
        const chapterId = chapterDoc.id;
        chapterCount++;

        console.log(`   Chapter: ${chapterId}`);

      // Get topics (these are concepts)
      try {
        const topicsSnap = await chapterDoc.ref.collection('topics').get();
        console.log(`     → ${topicsSnap.size} topics`);

        for (const topicDoc of topicsSnap.docs) {
          const topicId = topicDoc.id;
          const topicData = topicDoc.data();

          const concept = {
            id: `class10-math-${chapterId}-${topicId}`,
            curriculum_id: 'class10-math',
            language: 'en',
            chapter_id: chapterId,
            topic_id: topicId,
            name: topicData.name || topicId,
            description: topicData.description || null,
            source_reference: topicData.source_reference || `ncert-class10-${chapterId}`,
            prerequisites: topicData.prerequisites || null,
            mastery_criteria: topicData.mastery_criteria || null,
            common_misconceptions: topicData.common_misconceptions || null,
          };

          if (!conceptsMap.has(concept.id)) {
            conceptsMap.set(concept.id, concept);
            conceptCount++;
          }
        }
      } catch (err) {
        console.warn(`     ⚠️  Topics error: ${err.message}`);
      }

      // Get questions (PYQs)
      try {
        const questionsSnap = await chapterDoc.ref.collection('questions').get();
        console.log(`     → ${questionsSnap.size} questions`);

        for (const questionDoc of questionsSnap.docs) {
          const questionId = questionDoc.id;
          const questionData = questionDoc.data();

          const question = {
            id: `class10-math-${chapterId}-${questionId}`,
            curriculum_id: 'class10-math',
            chapter_id: chapterId,
            language: 'en',
            question_text: questionData.question_text || questionData.question || '',
            question_type: questionData.question_type || 'mcq',
            options: questionData.options || null,
            answer: questionData.answer || null,
            answer_explanation: questionData.answer_explanation || null,
            difficulty: questionData.difficulty || 'medium',
            source: questionData.source || 'pyq',
            year: questionData.year || null,
          };

          if (!questionsMap.has(question.id)) {
            questionsMap.set(question.id, question);
            pyqCount++;
          }
        }
      } catch (err) {
        console.warn(`     ⚠️  Questions error: ${err.message}`);
      }
      }
    }

    const conceptsToInsert = Array.from(conceptsMap.values());
    const questionsToInsert = Array.from(questionsMap.values());

    console.log(`\n✅ Extracted (deduplicated):`);
    console.log(`   • Chapters: ${chapterCount}`);
    console.log(`   • Concepts: ${conceptCount}`);
    console.log(`   • PYQs: ${pyqCount}\n`);

    // Insert to Supabase
    console.log('💾 Inserting into Supabase...\n');

    if (conceptsToInsert.length > 0) {
      console.log(`   Upserting ${conceptsToInsert.length} concepts...`);
      // Batch in chunks of 100 to avoid payload limits
      for (let i = 0; i < conceptsToInsert.length; i += 100) {
        const chunk = conceptsToInsert.slice(i, i + 100);
        const { error: conceptError } = await supabase
          .from('concepts')
          .upsert(chunk, { onConflict: 'id' });
        if (conceptError) {
          console.error(`   ❌ Error at chunk ${i}: ${conceptError.message}`);
          throw conceptError;
        }
      }
      console.log(`   ✅ Concepts upserted`);
    }

    if (questionsToInsert.length > 0) {
      console.log(`   Upserting ${questionsToInsert.length} questions...`);
      // Batch in chunks of 100 to avoid payload limits
      for (let i = 0; i < questionsToInsert.length; i += 100) {
        const chunk = questionsToInsert.slice(i, i + 100);
        const { error: questionError } = await supabase
          .from('questions')
          .upsert(chunk, { onConflict: 'id' });
        if (questionError) {
          console.error(`   ❌ Error at chunk ${i}: ${questionError.message}`);
          throw questionError;
        }
      }
      console.log(`   ✅ Questions upserted`);
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`   📊 Total: ${conceptCount} concepts + ${pyqCount} questions\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Migration failed:`, error.message);
    process.exit(1);
  }
}

migrate();
