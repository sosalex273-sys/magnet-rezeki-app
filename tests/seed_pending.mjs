const base = process.env.API_BASE_URL || 'http://localhost:5001';

const post = async (path, body) => {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res;
};

const run = async () => {
  const suffix = Math.random().toString(36).substring(7);
  const email = `test_ui_${suffix}@example.com`;
  const username = `user_ui_${suffix}`;

  console.log('[1/3] Register user...');
  const regRes = await post('/api/auth/register', { email, password: 'password123', username, name: 'UI Tester', phone: '08123456789' });
  const regData = await regRes.json();
  const userId = regData.user?.id || regData.user?.user_id;

  console.log('[2/3] Submit KYC...');
  await post('/api/kyc/submit', { user_id: userId, name: 'UI Tester', id_type: 'KTP', id_number: '12345678', id_image_url: 'id.jpg', selfie_image_url: 'selfie.jpg', address_proof_url: 'address.jpg' });

  console.log('[3/3] Create deposit...');
  await post('/api/deposits', { user_id: userId, amount: 250000, bank_name: 'BCA', account_number: '12345', account_name: 'UI Tester', notes: 'UI Test Deposit' });

  console.log('SEEDING PENDING DATA: SUCCESS');
};

run().catch(console.error);
