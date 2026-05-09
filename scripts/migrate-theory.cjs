#!/usr/bin/env node
/**
 * Theory migration: Parse theory txt file → Supabase concepts.theory column
 *
 * Source:  /Users/gauravrao/Downloads/Class X Theory cards.txt
 * Target:  concepts table, theory JSONB column
 *
 * Theory is identical for both curricula (basic + standard), so we upsert
 * both concept rows for each chapter+topic pair.
 *
 * Run from: /Users/gauravrao/Zentri-2.0/
 *   node scripts/migrate-theory.cjs
 *
 * NOTE: median_grouped_data theory is NULL (Gemini quota ran out during extraction).
 */

'use strict';

const { createClient } = require('../node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIG
// ============================================================================

const THEORY_FILE = path.join(process.env.HOME, 'Downloads/Class X Theory cards.txt');
const ENV_PATH = path.join(__dirname, '../.env.local');

const CURRICULA = ['class10-math-basic', 'class10-math-standard'];

// ============================================================================
// INIT
// ============================================================================

const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_KEY);

// ============================================================================
// PARSE THEORY FILE
// Returns: Map<`${chapterId}::${topicId}`, theoryObject>
// ============================================================================

function parseTheoryFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const theoryMap = new Map(); // key: `${chapterId}::${topicId}`
  let currentChapter = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Track current chapter
    const chapterMatch = line.match(/📘 Reading PDF for chapter: (\S+)/);
    if (chapterMatch) {
      currentChapter = chapterMatch[1];
      i++;
      continue;
    }

    // Look for "Theory saved for topic:" to find the topicId
    // The JSON block appears BEFORE this line, so we need to scan backwards
    // Strategy: find the ``` json block that precedes each "saved" line

    // Find JSON blocks preceded by "Response for <topicKey>:"
    const responseMatch = line.match(/^Response for (\S+): ```json/);
    if (responseMatch && currentChapter) {
      const topicKey = responseMatch[1]; // e.g. "heights_and_distances"
      i++;

      // Collect JSON lines until closing ```
      const jsonLines = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        jsonLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      const jsonStr = jsonLines.join('\n');
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.warn(`  ⚠️  JSON parse error for ${topicKey}: ${e.message}`);
        continue;
      }

      const key = `${currentChapter}::${topicKey}`;
      if (!theoryMap.has(key)) {
        theoryMap.set(key, parsed.theory);
        console.log(`  📖 Parsed: ${currentChapter} / ${topicKey}`);
      }
      continue;
    }

    i++;
  }

  return theoryMap;
}

// ============================================================================
// MAIN
// ============================================================================

async function migrate() {
  console.log('\n🚀 Starting theory migration: txt file → Supabase\n');

  // Step 1: Parse theory file
  console.log('📂 Parsing theory file...');
  const theoryMap = parseTheoryFile(THEORY_FILE);
  console.log(`\n✅ Parsed ${theoryMap.size} unique chapter/topic theory entries\n`);

  // Step 2: Build upsert rows
  // concept IDs follow: `${curriculumId}-${chapterId}-${topicId}`
  const rows = [];

  for (const [key, theoryContent] of theoryMap.entries()) {
    const [chapterId, topicId] = key.split('::');

    for (const curriculumId of CURRICULA) {
      rows.push({
        id: `${curriculumId}-${chapterId}-${topicId}`,
        theory: theoryContent,
      });
    }
  }

  console.log(`📦 Upserting ${rows.length} concept rows (${theoryMap.size} topics × ${CURRICULA.length} curricula)...\n`);

  // Step 3: UPDATE theory on existing concept rows (concepts already exist from Firestore migration)
  const CHUNK = 50;
  let successCount = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);

    for (const row of chunk) {
      const { error } = await supabase
        .from('concepts')
        .update({ theory: row.theory })
        .eq('id', row.id);

      if (error) {
        console.error(`❌ Update error for ${row.id}: ${error.message}`);
        throw error;
      }
      successCount++;
    }
  }

  console.log(`  ✅ Updated theory on ${successCount} concept rows`);

  // Step 4: Check for concepts that didn't get theory (NULL theory)
  console.log('\n🔍 Checking for concepts with NULL theory...');
  const { data: nullRows, error: nullErr } = await supabase
    .from('concepts')
    .select('id, curriculum_id, chapter_id, topic_id')
    .is('theory', null);

  if (nullErr) {
    console.error(`❌ Check error: ${nullErr.message}`);
  } else {
    const unique = [...new Set(nullRows.map(r => `${r.chapter_id}/${r.topic_id}`))];
    console.log(`  ${nullRows.length} concept rows have NULL theory (${unique.length} unique topics):`);
    unique.forEach(u => console.log(`    - ${u}`));
  }

  // Step 5: Summary
  const { count: totalConcepts } = await supabase
    .from('concepts')
    .select('*', { count: 'exact', head: true });

  const { count: withTheory } = await supabase
    .from('concepts')
    .select('*', { count: 'exact', head: true })
    .not('theory', 'is', null);

  console.log('\n📊 MIGRATION SUMMARY');
  console.log('═'.repeat(50));
  console.log(`  Total concepts in Supabase : ${totalConcepts}`);
  console.log(`  Concepts WITH theory       : ${withTheory}`);
  console.log(`  Concepts with NULL theory  : ${totalConcepts - withTheory}`);
  console.log(`  Theory entries parsed      : ${theoryMap.size}`);

  const allGood = withTheory === theoryMap.size * CURRICULA.length;
  console.log('\n' + '═'.repeat(50));
  if (allGood) {
    console.log('🎉 Theory migration complete!\n');
  } else {
    console.log('⚠️  Some concepts may not have matched. Check NULL list above.\n');
  }

  process.exit(allGood ? 0 : 1);
}

migrate().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
