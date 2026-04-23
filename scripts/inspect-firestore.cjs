const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(process.env.HOME, 'Downloads/sprintup-eecbe-firebase-adminsdk-fbsvc-1a7f1d53de.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

async function inspect() {
  console.log('🔍 Inspecting Firestore structure...\n');

  try {
    // List all collections at root
    console.log('Root collections:');
    const collections = await firestore.listCollections();
    for (const col of collections) {
      console.log(`  - ${col.id}`);
    }

    console.log('\n');

    // Check exams collection
    console.log('Exams collection:');
    const examsSnap = await firestore.collection('exams').get();
    console.log(`  Total docs: ${examsSnap.size}`);
    examsSnap.forEach((doc) => {
      console.log(`  - ${doc.id}:`, Object.keys(doc.data()).slice(0, 3));
    });

    console.log('\n');

    // Check specific exam document
    console.log('cbse_class_10 sub-collections:');
    const examDoc = firestore.collection('exams').doc('cbse_class_10');
    const subColls = await examDoc.listCollections();
    for (const col of subColls) {
      const count = (await col.get()).size;
      console.log(`  - ${col.id}: ${count} documents`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspect();
