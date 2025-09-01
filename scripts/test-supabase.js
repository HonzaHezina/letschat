/* Simple Node script to validate Supabase env and do a quick fetch. Run with: node scripts/test-supabase.js */
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(2);
}

const supabase = createClient(url, key);

(async () => {
  try {
    const TABLES = {
      CHATS: 'chats',
    };

    const { data, error } = await supabase.from(TABLES.CHATS).select('id').limit(1);
    if (error) {
      console.error('Supabase query error:', error);
      process.exit(3);
    }
    console.log('Supabase OK, sample rows:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(4);
  }
})();
