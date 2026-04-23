/**
 * Apply Supabase schema from 001_initial.sql
 * Uses PostgreSQL client to execute SQL directly
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse Supabase URL to get connection details
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Extract project ID from URL (format: https://{project-id}.supabase.co)
const projectId = supabaseUrl.split('//')[1].split('.')[0];

// Construct PostgreSQL connection string
// Supabase default is postgres://postgres:{password}@{host}:{port}/postgres
const connectionString = `postgresql://postgres:${supabaseServiceKey}@db.${projectId}.supabase.co:5432/postgres`;

async function applySchema() {
  console.log('🚀 Applying Supabase schema...\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  });

  try {
    // Connect
    console.log('🔗 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected\n');

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'supabase/migrations/001_initial.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📄 Schema SQL loaded');

    // Execute schema
    console.log('⚙️  Executing schema...\n');

    await client.query(schemaSql);

    console.log('✅ Schema applied successfully\n');

    // Verify tables
    console.log('🔍 Verifying tables...\n');

    const tables = ['profiles', 'concepts', 'landmarks', 'progress', 'entitlements', 'questions'];

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = result.rows[0].count;
        console.log(`✅ ${table}: exists (${count} rows)`);
      } catch (err) {
        console.log(`❌ ${table}: error (${err.message.substring(0, 50)})`);
      }
    }

    console.log('\n🎉 Schema application complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();
