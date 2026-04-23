/**
 * Sprint 0: Firestore → Supabase migration
 * Migrates NCERT concepts + PYQs from Firestore (cbse_class_10) to Supabase
 *
 * Usage:
 *   1. Set FIREBASE_SERVICE_ACCOUNT_JSON env var to path of service account JSON
 *   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY
 *   3. npx ts-node scripts/migrate-firestore.ts
 */

import * as admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Load environment
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
  process.env.HOME + "/Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json";

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account JSON not found at ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Firebase init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// Supabase init
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// TYPES
// ============================================================================

interface FirestoreConcept {
  name: string;
  description?: string;
  mastery_criteria?: any;
  common_misconceptions?: any;
  prerequisites?: string[];
  [key: string]: any;
}

interface FirestorePYQ {
  question: string;
  question_text?: string;
  options?: any[];
  answer?: string;
  answer_explanation?: string;
  difficulty?: string;
  source?: string;
  year?: number;
  [key: string]: any;
}

interface ConceptRecord {
  id: string;
  curriculum_id: string;
  language: string;
  chapter_id: string;
  topic_id?: string;
  name: string;
  description?: string;
  source_reference: string;
  prerequisites?: string[];
  mastery_criteria?: any;
  common_misconceptions?: any;
}

interface QuestionRecord {
  id: string;
  curriculum_id: string;
  chapter_id: string;
  concept_id?: string;
  language: string;
  question_text: string;
  question_type?: string;
  options?: any[];
  answer?: string;
  answer_explanation?: string;
  difficulty?: string;
  source?: string;
  year?: number;
}

// ============================================================================
// MIGRATION
// ============================================================================

async function migrateFirestoreToSupabase() {
  console.log("🚀 Starting Firestore → Supabase migration...\n");

  try {
    const conceptsToInsert: ConceptRecord[] = [];
    const questionsToInsert: QuestionRecord[] = [];

    let chapterCount = 0;
    let conceptCount = 0;
    let pyqCount = 0;

    // Get all chapters under cbse_class_10
    const chaptersSnap = await firestore
      .collection("exams")
      .doc("cbse_class_10")
      .collection("chapters")
      .get();

    console.log(`📚 Found ${chaptersSnap.size} chapters\n`);

    for (const chapterDoc of chaptersSnap.docs) {
      const chapterId = chapterDoc.id; // e.g., 'ch8'
      const chapterData = chapterDoc.data();
      chapterCount++;

      console.log(`   Chapter: ${chapterId}`);

      // Get concepts in this chapter
      try {
        const conceptsSnap = await chapterDoc.ref.collection("concepts").get();
        console.log(`     → ${conceptsSnap.size} concepts`);

        for (const conceptDoc of conceptsSnap.docs) {
          const conceptId = conceptDoc.id;
          const conceptData = conceptDoc.data() as FirestoreConcept;

          const concept: ConceptRecord = {
            id: `class10-math-${chapterId}-${conceptId}`,
            curriculum_id: "class10-math",
            language: "en",
            chapter_id: chapterId,
            topic_id: conceptData.topic_id || chapterId,
            name: conceptData.name || conceptId,
            description: conceptData.description,
            source_reference: conceptData.source_reference || `ncert-class10-${chapterId}`,
            prerequisites: conceptData.prerequisites,
            mastery_criteria: conceptData.mastery_criteria,
            common_misconceptions: conceptData.common_misconceptions,
          };

          conceptsToInsert.push(concept);
          conceptCount++;
        }
      } catch (err) {
        console.warn(`     ⚠️  Error reading concepts: ${(err as Error).message}`);
      }

      // Get PYQs in this chapter
      try {
        const pyqsSnap = await chapterDoc.ref.collection("pyqs").get();
        console.log(`     → ${pyqsSnap.size} PYQs`);

        for (const pyqDoc of pyqsSnap.docs) {
          const pyqId = pyqDoc.id;
          const pyqData = pyqDoc.data() as FirestorePYQ;

          const question: QuestionRecord = {
            id: `class10-math-${chapterId}-${pyqId}`,
            curriculum_id: "class10-math",
            chapter_id: chapterId,
            language: "en",
            question_text: pyqData.question_text || pyqData.question || "",
            question_type: pyqData.question_type || "mcq",
            options: pyqData.options,
            answer: pyqData.answer,
            answer_explanation: pyqData.answer_explanation,
            difficulty: pyqData.difficulty || "medium",
            source: pyqData.source || "pyq",
            year: pyqData.year,
          };

          questionsToInsert.push(question);
          pyqCount++;
        }
      } catch (err) {
        console.warn(`     ⚠️  Error reading PYQs: ${(err as Error).message}`);
      }
    }

    console.log(`\n✅ Extracted data:`);
    console.log(`   • Chapters: ${chapterCount}`);
    console.log(`   • Concepts: ${conceptCount}`);
    console.log(`   • PYQs: ${pyqCount}\n`);

    // Insert to Supabase
    console.log("💾 Inserting into Supabase...\n");

    if (conceptsToInsert.length > 0) {
      console.log(`   Inserting ${conceptsToInsert.length} concepts...`);
      const { error: conceptError } = await supabase
        .from("concepts")
        .insert(conceptsToInsert);

      if (conceptError) {
        console.error(`   ❌ Concept insert error: ${conceptError.message}`);
        throw conceptError;
      }
      console.log(`   ✅ Concepts inserted`);
    }

    if (questionsToInsert.length > 0) {
      console.log(`   Inserting ${questionsToInsert.length} questions...`);
      const { error: questionError } = await supabase
        .from("questions")
        .insert(questionsToInsert);

      if (questionError) {
        console.error(`   ❌ Question insert error: ${questionError.message}`);
        throw questionError;
      }
      console.log(`   ✅ Questions inserted`);
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`   📊 Total: ${conceptCount} concepts + ${pyqCount} questions`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Migration failed:`, error);
    process.exit(1);
  }
}

// Run
migrateFirestoreToSupabase();
