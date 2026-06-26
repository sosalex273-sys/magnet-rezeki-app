import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// load backend .env explicitly so script works when run from workspace root
dotenv.config({ path: './backend/.env' });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(2);
}

const supabaseAdmin = createClient(url, key);

async function main(){
  try{
    console.log('Listing buckets (attempting supported methods)...');
    if (typeof supabaseAdmin.storage.listBuckets === 'function'){
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      if (error) throw error;
      console.log('buckets:', data);
      // ensure 'kyc' exists
      const exists = Array.isArray(data) && data.find(b => b.name === 'kyc');
      if (!exists) {
        console.log("'kyc' bucket not found — attempting to create it (public)");
        if (typeof supabaseAdmin.storage.createBucket === 'function'){
          const { data: created, error: createErr } = await supabaseAdmin.storage.createBucket('kyc', { public: true });
          if (createErr) throw createErr;
          console.log('Created bucket:', created);
        } else {
          console.log('Create bucket API not available on this client version.');
        }
      } else {
        console.log("'kyc' bucket already exists.");
      }
      return;
    }

    if (typeof supabaseAdmin.storage.list === 'function'){
      const { data, error } = await supabaseAdmin.storage.list();
      if (error) throw error;
      console.log('buckets(list):', data);
      const exists = Array.isArray(data) && data.find(b => (b?.name || b?.id) === 'kyc');
      if (!exists) {
        console.log("'kyc' bucket not found — attempting to create it (public)");
        if (typeof supabaseAdmin.storage.createBucket === 'function'){
          const { data: created, error: createErr } = await supabaseAdmin.storage.createBucket('kyc', { public: true });
          if (createErr) throw createErr;
          console.log('Created bucket:', created);
        } else {
          console.log('Create bucket API not available on this client version.');
        }
      } else {
        console.log("'kyc' bucket already exists.");
      }
      return;
    }

    // fallback: try to call `from('kyc').getPublicUrl` to detect bucket
    try{
      const path = 'test_probe.txt';
      const { data: publicData } = supabaseAdmin.storage.from('kyc').getPublicUrl(path);
      console.log('getPublicUrl response (bucket likely exists):', publicData);
      return;
    }catch(e){
      console.error('Could not probe bucket: ', e.message || e);
      process.exit(3);
    }
  }catch(err){
    console.error('Error listing buckets:', err.message || err);
    process.exit(1);
  }
}

main();
