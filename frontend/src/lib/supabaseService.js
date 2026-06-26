import { supabase } from './supabaseClient';

// NOTE: These helpers are minimal stubs. Add error handling and validation as needed.

export async function uploadFile(bucket, path, file) {
  if (!file) return { error: 'no-file' };
  const filePath = `${path}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, { cacheControl: '3600', upsert: false });
  return { data, error };
}

export async function createKYC({ user_id, full_name, id_number, ktpFile, selfieFile }) {
  // Upload files to 'kyc' bucket and insert row into 'kyc_submissions' table
  const results = {};
  if (ktpFile) {
    const r1 = await uploadFile('kyc', `kyc/${user_id}`, ktpFile);
    results.ktp = r1;
  }
  if (selfieFile) {
    const r2 = await uploadFile('kyc', `kyc/${user_id}`, selfieFile);
    results.selfie = r2;
  }

  const { data, error } = await supabase.from('kyc_submissions').insert([{ 
    user_id,
    full_name,
    id_number,
    id_type: 'KTP',
    ktp_file_url: results.ktp?.data?.path || null,
    selfie_file_url: results.selfie?.data?.path || null,
    status: 'pending'
  }]);
  return { data, error, uploads: results };
}

export async function createDeposit({ user_id, amount, method, metadata = {} }) {
  const code = `DEP-${Date.now()}`;
  const { data, error } = await supabase.from('deposits').insert([{ 
    user_id,
    amount,
    payment_method: method,
    bank_name: metadata.bank_name || null,
    account_number: metadata.account_number || null,
    account_name: metadata.account_name || null,
    code,
    status: 'pending'
  }]);
  return { data, error };
}

export async function createWithdrawal({ user_id, amount, bank, account_number, account_name }) {
  const { data, error } = await supabase.from('withdrawals').insert([{ 
    user_id,
    amount,
    bank_name: bank,
    account_number,
    account_name,
    wallet_address: null,
    crypto_type: null,
    status: 'pending'
  }]);
  return { data, error };
}

export async function fetchFAQs() {
  const { data, error } = await supabase.from('faqs').select('*').order('id', { ascending: true });
  return { data, error };
}

export async function fetchNews() {
  const { data, error } = await supabase.from('news_articles').select('*').order('published_at', { ascending: false });
  return { data, error };
}

export async function fetchTestimonials() {
  const { data, error } = await supabase.from('testimonials').select('*').order('id', { ascending: false });
  return { data, error };
}

export default {
  uploadFile,
  createKYC,
  createDeposit,
  createWithdrawal,
  fetchFAQs,
  fetchNews,
  fetchTestimonials
};
