#!/usr/bin/env node
/**
 * Seed landmarks into Supabase from the curriculum manifest YAML.
 * This is the one-way bridge: YAML (design-time) → Supabase (runtime).
 *
 * Run: node scripts/seed-landmarks.cjs
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('🌱 Seeding landmarks into Supabase...\n')

  // Load manifest
  const manifestPath = path.join(__dirname, '../curricula/class10-math/en/manifest.yaml')
  const raw = fs.readFileSync(manifestPath, 'utf-8')
  const manifest = yaml.load(raw)

  const curriculum_id = manifest.curriculum // 'class10-math'
  const landmarksToUpsert = []

  let sort = 0
  for (const biome of manifest.biomes) {
    const biome_id = biome.id
    const landmarks = biome.landmarks ?? []
    console.log(`📍 Biome: ${biome_id} (${biome.location}) — ${landmarks.length} landmarks`)

    for (const lm of landmarks) {
      landmarksToUpsert.push({
        id: lm.id,
        curriculum_id,
        biome_id,
        concept_id: lm.concept_id || null,
        mechanic_type: lm.mechanic,
        mechanic_config: lm.mechanic_config || {},
        vibe_notes: biome.description || null,
        sort_order: sort++,
      })
      console.log(`   · ${lm.id} → ${lm.mechanic}`)
    }
  }

  console.log(`\n💾 Upserting ${landmarksToUpsert.length} landmarks...\n`)

  const { error } = await supabase
    .from('landmarks')
    .upsert(landmarksToUpsert, { onConflict: 'id' })

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log(`✅ ${landmarksToUpsert.length} landmarks seeded!`)

  // Verify
  const { data, error: verifyErr } = await supabase
    .from('landmarks')
    .select('id, biome_id, mechanic_type')
    .eq('curriculum_id', curriculum_id)

  if (verifyErr) {
    console.error('❌ Verify error:', verifyErr.message)
  } else {
    console.log('\n📊 Landmark summary:')
    const byBiome = {}
    for (const row of data) {
      byBiome[row.biome_id] = (byBiome[row.biome_id] || 0) + 1
    }
    for (const [biome, count] of Object.entries(byBiome)) {
      console.log(`   ${biome}: ${count} landmark(s)`)
    }
    console.log(`\n🎉 Total: ${data.length} landmarks in Supabase`)
  }

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
