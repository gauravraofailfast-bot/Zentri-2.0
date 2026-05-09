#!/usr/bin/env node
/**
 * Patches the missing median_grouped_data theory into Supabase.
 *
 * Theory extracted by Claude directly from NCERT Statistics Chapter 13
 * (jemh113.pdf, pages 188–197 — Section 13.4 Median of Grouped Data).
 *
 * Concepts covered (as per questions JSON conceptIds):
 *   - class_mark
 *   - median_class
 *   - median_calculation
 *
 * Run: node scripts/patch-median-theory.cjs
 */

'use strict';

const { createClient } = require('../node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIG
// ============================================================================

const ENV_PATH = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l.includes('=')).map(l => {
    const idx = l.indexOf('=');
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
  })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_KEY);

const CURRICULA = ['class10-math-basic', 'class10-math-standard'];
const CHAPTER_ID = 'statistics';
const TOPIC_ID = 'median_grouped_data';

// ============================================================================
// THEORY — extracted from NCERT Class 10 Maths Chapter 13, Section 13.4
// ============================================================================

const theory = {
  class_mark: {
    definition: "The class mark (or mid-point) of a class interval is the average of its upper and lower class limits, used to represent all observations falling in that class.",
    explanation: "In grouped data, the exact values of individual observations are not known. It is assumed that the frequency of each class interval is centred around its mid-point. This mid-point is called the class mark. Class marks serve as the representative values (xᵢ) for each class and are used in calculating mean by the Direct Method and Assumed Mean Method.",
    steps: [
      "Step 1: Identify the upper class limit and lower class limit of the class interval.",
      "Step 2: Add them together and divide by 2.",
      "Step 3: Use this class mark as the representative value xᵢ for that class in calculations."
    ],
    formulas: [
      "Class mark = (Upper class limit + Lower class limit) / 2"
    ],
    diagramHints: [
      "Table 13.3 in NCERT shows class marks for each interval in the example of marks obtained by 30 students — refer to it to see how class marks are determined and used in mean calculations."
    ]
  },

  median_class: {
    definition: "The median class is the class interval whose cumulative frequency is greater than (and nearest to) n/2, where n is the total number of observations.",
    explanation: "To find the median of grouped data, a cumulative frequency table is first constructed. Since grouped data is continuous, the median is a value inside a class interval — not a single observation. We calculate n/2 and locate the first class whose cumulative frequency meets or exceeds n/2. This class is called the median class, and the actual median lies somewhere within it.",
    steps: [
      "Step 1: Prepare a cumulative frequency table (less than type) for the grouped data.",
      "Step 2: Calculate n/2, where n is the total number of observations (Σfᵢ).",
      "Step 3: Scan the cumulative frequency column and find the first class whose cumulative frequency is greater than and nearest to n/2.",
      "Step 4: That class interval is the median class."
    ],
    formulas: [
      "Median class: the class interval whose cumulative frequency first exceeds n/2"
    ],
    diagramHints: [
      "Table 13.15 in NCERT (Section 13.4) shows a combined frequency and cumulative frequency table — the median class is identified by scanning the cf column for the value just above n/2.",
      "On a less-than ogive (cumulative frequency curve), draw a horizontal line from n/2 on the y-axis to the curve; the x-coordinate of that point gives the median class boundary."
    ]
  },

  median_calculation: {
    definition: "The median of grouped data is the value that divides the entire distribution into two equal halves, calculated using interpolation within the median class.",
    explanation: "Once the median class is identified, the exact median is found using an interpolation formula. The formula assumes that observations within the median class are uniformly distributed. It uses the lower limit of the median class (l), the cumulative frequency of the class preceding it (cf), the frequency of the median class (f), and the class size (h). An important empirical relationship between the three measures of central tendency is: 3 Median = Mode + 2 Mean.",
    steps: [
      "Step 1: Construct a cumulative frequency table.",
      "Step 2: Find n/2.",
      "Step 3: Identify the median class (cf ≥ n/2).",
      "Step 4: Note: l = lower limit of median class, cf = cumulative frequency of class preceding the median class, f = frequency of median class, h = class size.",
      "Step 5: Substitute values into the formula: Median = l + ((n/2 − cf) / f) × h.",
      "Step 6: Compute the result."
    ],
    formulas: [
      "Median = l + ((n/2 − cf) / f) × h",
      "where: l = lower limit of median class, n = total number of observations, cf = cumulative frequency of class preceding the median class, f = frequency of the median class, h = class size (assuming equal class sizes)",
      "Empirical relationship: 3 Median = Mode + 2 Mean"
    ],
    diagramHints: [
      "Table 13.16 in NCERT (Example 7) shows how the frequency and cumulative frequency table is built from a less-than type distribution before applying the median formula.",
      "The less-than ogive (Fig. 13.6 in NCERT) can be used to read the median graphically — the point on the curve corresponding to n/2 on the y-axis gives the median on the x-axis."
    ]
  }
};

// ============================================================================
// MAIN
// ============================================================================

async function patch() {
  console.log('\n🩹 Patching median_grouped_data theory → Supabase\n');

  let patched = 0;

  for (const curriculumId of CURRICULA) {
    const id = `${curriculumId}-${CHAPTER_ID}-${TOPIC_ID}`;

    const { error } = await supabase
      .from('concepts')
      .update({ theory })
      .eq('id', id);

    if (error) {
      console.error(`❌ Failed for ${id}: ${error.message}`);
      process.exit(1);
    }

    console.log(`  ✅ Patched: ${id}`);
    patched++;
  }

  // Verify
  const { data, error: verifyErr } = await supabase
    .from('concepts')
    .select('id, theory')
    .in('id', CURRICULA.map(c => `${c}-${CHAPTER_ID}-${TOPIC_ID}`));

  if (verifyErr) {
    console.error('❌ Verify error:', verifyErr.message);
    process.exit(1);
  }

  console.log('\n📊 Verification:');
  for (const row of data) {
    const conceptCount = Object.keys(row.theory || {}).length;
    console.log(`  ${row.id}: theory has ${conceptCount} concepts`);
  }

  // Final NULL check
  const { count: nullCount } = await supabase
    .from('concepts')
    .select('*', { count: 'exact', head: true })
    .is('theory', null);

  console.log(`\n  NULL theory rows remaining: ${nullCount}`);
  console.log(nullCount === 0 ? '\n🎉 All concepts now have theory!\n' : '\n⚠️  Some NULL theory rows remain.\n');
  process.exit(0);
}

patch().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
