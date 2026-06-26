const base = process.env.API_BASE_URL || 'http://localhost:5001';

const post = async (path, body) => {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${JSON.stringify(data)}`);
  return data;
};

const get = async (path) => {
  const res = await fetch(`${base}${path}`);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${JSON.stringify(data)}`);
  return data;
};

const run = async () => {
  const stamp = Date.now();
  const email = `e2e_admin_${stamp}@mail.test`;
  const username = `e2e_admin_${stamp}`;
  const password = 'AdminFlow#123';

  console.log('[1/8] Register user...');
  const reg = await post('/api/auth/register', {
    email,
    password,
    name: 'E2E User',
    username,
    phone: '081234567890',
    country: 'ID',
    sponsor: null
  });
  const userId = reg?.user?.id;
  if (!userId) throw new Error('User ID tidak ditemukan dari response register');
  console.log(`      userId: ${userId}`);

  console.log('[2/8] Submit KYC...');
  await post('/api/kyc_submissions', {
    user_id: userId,
    full_name: 'E2E User',
    id_type: 'KTP',
    id_number: `KTP-${stamp}`,
    ktp_file_url: `https://example.com/ktp-${stamp}.jpg`,
    selfie_file_url: `https://example.com/selfie-${stamp}.jpg`
  });

  console.log('[3/8] Find pending KYC and approve...');
  const kycRows = await get('/api/admin/kyc_submissions');
  const targetKyc = [...(Array.isArray(kycRows) ? kycRows : [])]
    .filter((k) => String(k.user_id) === String(userId))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
  if (!targetKyc?.id) throw new Error('KYC submission untuk user baru tidak ditemukan');
  await post(`/api/admin/kyc/${targetKyc.id}/approve`, { notes: 'Approved by E2E script' });

  console.log('[4/8] Create deposit...');
  const expectedAmount = 125000;
  await post('/api/deposits', {
    user_id: userId,
    amount: expectedAmount
  });

  console.log('[5/8] Find pending deposit and verify...');
  const deposits = await get('/api/admin/deposits');
  const targetDeposit = [...(Array.isArray(deposits) ? deposits : [])]
    .filter((d) => String(d.user_id) === String(userId) && Number(d.amount) === expectedAmount)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
  if (!targetDeposit?.id) throw new Error('Deposit untuk user baru tidak ditemukan');
  await post(`/api/admin/deposits/${targetDeposit.id}/verify`, { notes: 'Verified by E2E script' });

  console.log('[6/8] Validate KYC state...');
  const kycAfter = await get('/api/admin/kyc_submissions');
  const approved = (Array.isArray(kycAfter) ? kycAfter : []).find((k) => String(k.id) === String(targetKyc.id));
  if (!approved || approved.status !== 'verified') throw new Error('Status KYC tidak berubah ke verified');

  console.log('[7/8] Validate deposit state...');
  const depositsAfter = await get('/api/admin/deposits');
  const verifiedDeposit = (Array.isArray(depositsAfter) ? depositsAfter : []).find((d) => String(d.id) === String(targetDeposit.id));
  if (!verifiedDeposit || verifiedDeposit.status !== 'verified') throw new Error('Status deposit tidak berubah ke verified');

  console.log('[8/8] Validate wallet credited...');
  const wallet = await get(`/api/wallet/${userId}`);
  const balance = Number(wallet?.balance || 0);
  if (Number.isNaN(balance) || balance < expectedAmount) {
    throw new Error(`Saldo wallet tidak sesuai. balance=${balance}, expected>=${expectedAmount}`);
  }

  console.log('');
  console.log('E2E STATEFUL FLOW: SUCCESS');
  console.log(`- user_id: ${userId}`);
  console.log(`- kyc_id: ${targetKyc.id}`);
  console.log(`- deposit_id: ${targetDeposit.id}`);
  console.log(`- wallet_balance: ${balance}`);
};

run().catch((err) => {
  console.error('E2E STATEFUL FLOW: FAILED');
  console.error(err.message || err);
  process.exit(1);
});
