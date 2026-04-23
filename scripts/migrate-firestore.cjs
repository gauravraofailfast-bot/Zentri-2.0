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
    const conceptsToInsert = [];
    const questionsToInsert = [];

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

      // Get concepts
      try {
        const conceptsSnap = await chapterDoc.ref.collection('concepts').get();
        console.log(`     → ${conceptsSnap.size} concepts`);

        for (const conceptDoc of conceptsSnap.docs) {
          const conceptId = conceptDoc.id;
          const conceptData = conceptDoc.data();

          const concept = {
            id: `class10-math-${chapterId}-${conceptId}`,
            curriculum_id: 'class10-math',
            language: 'en',
            chapter_id: chapterId,
            topic_id: conceptData.topic_id || chapterId,
            name: conceptData.name || conceptId,
            description: conceptData.description || null,
            source_reference: conceptData.source_reference || `ncert-class10-${chapterId}`,
            prerequisites: conceptData.prerequisites || null,
            mastery_criteria: conceptData.mastery_criteria || null,
            common_misconceptions: conceptData.common_misconceptions || null,
          };

          conceptsToInsert.push(concept);
          conceptCount++;
        }
      } catch (err) {
        console.warn(`     ⚠️  Concepts error: ${err.message}`);
      }

      // Get PYQs
      try {
        const pyqsSnap = await chapterDoc.ref.collection('pyqs').get();
        console.log(`     → ${pyqsSnap.size} PYQs`);

        for (const pyqDoc of pyqsSnap.docs) {
          const pyqId = pyqDoc.id;
          const pyqData = pyqDoc.data();

          const question = {
            id: `class10-math-${chapterId}-${pyqId}`,
            curriculum_id: 'class10-math',
            chapter_id: chapterId,
            language: 'en',
            question_text: pyqData.question_text || pyqData.question || '',
            question_type: pyqData.question_type || 'mcq',
            options: pyqData.options || null,
            answer: pyqData.answer || null,
            answer_explanation: pyqData.answer_explanation || null,
            difficulty: pyqData.difficulty || 'medium',
            source: pyqData.source || 'pyq',
            year: pyqData.year || null,
          };

          questionsToInsert.push(question);
          pyqCount++;
        }
      } catch (err) {
        console.warn(`     ⚠️  PYQs error: ${err.message}`);
      }
      }
    }

    console.log(`\n✅ Extracted:`);
    console.log(`   • Chapters: ${chapterCount}`);
    console.log(`   • Concepts: ${conceptCount}`);
    console.log(`   • PYQs: ${pyqCount}\n`);

    // Insert to Supabase
    console.log('💾 Inserting into Supabase...\n');

    if (conceptsToInsert.length > 0) {
      console.log(`   Inserting ${conceptsToInsert.length} concepts...`);
      const { error: conceptError } = await supabase
        .from('concepts')
        .insert(conceptsToInsert);

      if (conceptError) {
        console.error(`   ❌ Error: ${conceptError.message}`);
        throw conceptError;
      }
      console.log(`   ✅ Concepts inserted`);
    }

    if (questionsToInsert.length > 0) {
      console.log(`   Inserting ${questionsToInsert.length} questions...`);
      const { error: questionError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionError) {
        console.error(`   ❌ Error: ${questionError.message}`);
        throw questionError;
      }
      console.log(`   ✅ Questions inserted`);
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
