const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Read SQL schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing schema.sql...');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await supabase.rpc('exec_sql', { sql: statement });
          process.stdout.write('.');
        } catch (error) {
          // Some statements might fail if already exist, that's ok
          if (!error.message.includes('already exists')) {
            console.error(`\n⚠️  Warning on statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('\n\n✅ Database schema created successfully!');

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const tables = ['generations', 'generation_history', 'user_configs', 'knowledge_base', 'search_cache'];

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`❌ ${table}: Failed`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    }

    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Start generating!\n');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
