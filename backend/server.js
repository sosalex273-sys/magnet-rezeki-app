import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hasSupabaseConfig = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
const supabase = hasSupabaseConfig
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : null;
const supabaseAdmin = hasSupabaseConfig && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;
const dbClient = supabaseAdmin || supabase;

const mockDb = globalThis.__BPROJECT_MOCK_DB || {
  users: [],
  investments: [],
  wallets: [],
  withdrawals: [],
  transactions: [],
  kycSubmissions: [],
  bonuses: [],
  profits: [],
  faqs: [],
  news: [],
  testimonials: [],
  payments: [],
  download_items: [],
  files: []
};

globalThis.__BPROJECT_MOCK_DB = mockDb;

const createToken = (payload, secret) => jwt.sign(payload, secret, { expiresIn: '24h' });

const ensureWallet = (userId) => {
  let wallet = mockDb.wallets.find((item) => item.user_id === userId);

  if (!wallet) {
    wallet = {
      id: randomUUID(),
      user_id: userId,
      balance: 0,
      virtual_balance: 0,
      total_profit: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.wallets.push(wallet);
  }

  return wallet;
};

const getMockUser = (id) => mockDb.users.find((user) => user.id === id);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    supabaseConfigured: hasSupabaseConfig,
    testMode: !hasSupabaseConfig
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, username, phone, country, sponsor } = req.body;

    if (!hasSupabaseConfig) {
      const existingUser = mockDb.users.find((user) => user.email === email || user.username === username);

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const userId = randomUUID();
      const user = {
        id: userId,
        email,
        name,
        username,
        phone,
        country,
        sponsor,
        balance: 0,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockDb.users.push(user);
      ensureWallet(userId);

      return res.status(201).json({
        message: 'User registered successfully (test mode)',
        user: { id: userId, email }
      });
    }

    const authClient = supabaseAdmin || supabase;
    const { data: authData, error: authError } = supabaseAdmin
      ? await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            username,
            phone,
            country,
            sponsor
          }
        })
      : await authClient.auth.signUp({
          email,
          password
        });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData?.user?.id || authData?.user?.id;

    const { error: profileError } = await dbClient.from('users').insert({
      id: userId,
      email,
      name,
      username,
      phone,
      country,
      sponsor,
      balance: 0,
      is_active: false
    });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    const { error: walletError } = await dbClient.from('wallets').insert({
      user_id: userId,
      balance: 0,
      virtual_balance: 0,
      total_profit: 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    if (walletError) {
      return res.status(400).json({ error: walletError.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: authData.user.id, email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!hasSupabaseConfig) {
      const user = mockDb.users.find((item) => item.email === email);

      if (!user) {
        return res.status(401).json({ error: 'User not found. Please register first.' });
      }

      const wallet = ensureWallet(user.id);

      return res.json({
        message: 'Login successful (test mode)',
        access_token: createToken(
          { id: user.id, email: user.email, role: 'user', testMode: true },
          process.env.JWT_SECRET || 'dev_secret_key'
        ),
        user: {
          ...user,
          balance: wallet.balance,
          virtual_balance: wallet.virtual_balance,
          total_profit: wallet.total_profit
        }
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const { data: userProfile } = await dbClient
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login successful',
      access_token: data.session.access_token,
      user: userProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(
      { id: 'admin_user', username: ADMIN_USERNAME, role: 'admin' },
      process.env.JWT_SECRET || 'admin_secret_key'
    );

    res.json({
      message: 'Admin login successful',
      access_token: token,
      admin: {
        id: 'admin_user',
        username: ADMIN_USERNAME,
        name: 'Administrator',
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!hasSupabaseConfig) {
      const user = getMockUser(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ ...user, ...ensureWallet(id) });
    }

    const { data, error } = await dbClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/investments', async (req, res) => {
  try {
    const { user_id, plan, amount, crypto_type } = req.body;

    if (!hasSupabaseConfig) {
      const investment = {
        id: randomUUID(),
        user_id,
        plan,
        amount,
        crypto_type,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockDb.investments.push(investment);
      return res.status(201).json({ message: 'Investment created (test mode)', data: [investment] });
    }

    const { data, error } = await dbClient
      .from('investments')
      .insert({
        user_id,
        plan,
        amount,
        crypto_type,
        status: 'active',
        created_at: new Date()
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Investment created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/investments/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!hasSupabaseConfig) {
      return res.json(mockDb.investments.filter((investment) => investment.user_id === user_id));
    }

    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user_id);

    if (error) {
      return res.status(404).json({ error: 'No investments found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wallet/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!hasSupabaseConfig) {
      return res.json(ensureWallet(user_id));
    }

    const { data, error } = await dbClient
      .from('wallets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!hasSupabaseConfig) {
      const transactions = (mockDb.transactions || [])
        .filter((transaction) => transaction.user_id === user_id)
        .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));

      return res.json(transactions);
    }

    const { data, error } = await dbClient
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(404).json({ error: 'No transactions found' });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: add balance to user's wallet (manual)
app.post('/api/admin/wallets/:user_id/add', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { amount, description } = req.body;

    const parsed = Number(amount);
    if (!parsed || Number.isNaN(parsed) || parsed <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!hasSupabaseConfig) {
      const wallet = ensureWallet(user_id);
      wallet.balance = (wallet.balance || 0) + parsed;
      wallet.updated_at = new Date().toISOString();

      // record deposit transaction in mockDb
      mockDb.transactions = mockDb.transactions || [];
      mockDb.transactions.push({
        id: randomUUID(),
        user_id,
        type: 'deposit',
        amount: parsed,
        description: description || 'Admin manual credit (Deposit)',
        created_at: new Date().toISOString()
      });

      return res.json({ message: 'Balance and Profit added (test mode)', wallet });
    }

    // Supabase flow: update wallets table and insert transaction record
    const { data: existingWallet, error: selectErr } = await dbClient
      .from('wallets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (selectErr && selectErr.code !== 'PGRST116') {
      // PGRST116 is "No rows found" in some cases; fallthrough to create
    }

    if (!existingWallet) {
      const { data: created, error: createErr } = await dbClient
        .from('wallets')
        .insert({ user_id, balance: parsed, virtual_balance: 0, total_profit: 0, created_at: new Date(), updated_at: new Date() });

      if (createErr) return res.status(400).json({ error: createErr.message });

      await dbClient.from('transactions').insert({ user_id, type: 'deposit', amount: parsed, description: description || 'Admin manual credit (Deposit)', created_at: new Date() });

      return res.json({ message: 'Balance added', wallet: created[0] });
    }

    const newBalance = (existingWallet.balance || 0) + parsed;
    const { data: updated, error: updateErr } = await dbClient
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date() })
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    await dbClient.from('transactions').insert({ user_id, type: 'deposit', amount: parsed, description: description || 'Admin manual credit (Deposit)', created_at: new Date() });

    res.json({ message: 'Balance added', wallet: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: add profit to user's wallet
app.post('/api/admin/profits/add', async (req, res) => {
  try {
    const { user_id, amount, description } = req.body;

    const parsed = Number(amount);
    if (!parsed || Number.isNaN(parsed) || parsed <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!hasSupabaseConfig) {
      const wallet = ensureWallet(user_id);
      wallet.balance = (wallet.balance || 0) + parsed;
      wallet.total_profit = (wallet.total_profit || 0) + parsed;
      wallet.updated_at = new Date().toISOString();

      const user = getMockUser(user_id);
      if (user) {
        user.total_profit = (user.total_profit || 0) + parsed;
      }

      mockDb.transactions = mockDb.transactions || [];
      mockDb.transactions.push({
        id: randomUUID(),
        user_id,
        type: 'profit',
        amount: parsed,
        description: description || 'Admin manual credit (Profit)',
        created_at: new Date().toISOString()
      });

      return res.json({ message: 'Profit added (test mode)', wallet });
    }

    // Supabase flow
    const { data: existingWallet, error: selectErr } = await dbClient
      .from('wallets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!existingWallet) {
      const { data: created, error: createErr } = await dbClient
        .from('wallets')
        .insert({ user_id, balance: parsed, virtual_balance: 0, total_profit: parsed, created_at: new Date(), updated_at: new Date() });

      if (createErr) return res.status(400).json({ error: createErr.message });

      await dbClient.from('transactions').insert({ user_id, type: 'profit', amount: parsed, description: description || 'Admin manual credit (Profit)', created_at: new Date() });

      await dbClient.from('users').update({ total_profit: parsed }).eq('id', user_id);

      return res.json({ message: 'Profit added', wallet: created[0] });
    }

    const newBalance = (existingWallet.balance || 0) + parsed;
    const newTotalProfit = (existingWallet.total_profit || 0) + parsed;
    const { data: updated, error: updateErr } = await dbClient
      .from('wallets')
      .update({ balance: newBalance, total_profit: newTotalProfit, updated_at: new Date() })
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    await dbClient.from('transactions').insert({ user_id, type: 'profit', amount: parsed, description: description || 'Admin manual credit (Profit)', created_at: new Date() });

    const { data: userRecord } = await dbClient.from('users').select('total_profit').eq('id', user_id).single();
    if (userRecord) {
      await dbClient.from('users').update({ total_profit: (userRecord.total_profit || 0) + parsed }).eq('id', user_id);
    }

    res.json({ message: 'Profit added', wallet: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get all profits
app.get('/api/admin/profits', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      const profits = (mockDb.transactions || [])
        .filter((t) => t.type === 'profit')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.json(profits);
    }

    const { data, error } = await dbClient
      .from('transactions')
      .select('*')
      .eq('type', 'profit')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: add bonus to user's wallet
app.post('/api/admin/bonuses/add', async (req, res) => {
  try {
    const { user_id, amount, description } = req.body;

    const parsed = Number(amount);
    if (!parsed || Number.isNaN(parsed) || parsed <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!hasSupabaseConfig) {
      const wallet = ensureWallet(user_id);
      wallet.balance = (wallet.balance || 0) + parsed;
      wallet.updated_at = new Date().toISOString();

      mockDb.transactions = mockDb.transactions || [];
      mockDb.transactions.push({
        id: randomUUID(),
        user_id,
        type: 'bonus',
        amount: parsed,
        description: description || 'Admin manual credit (Bonus)',
        created_at: new Date().toISOString()
      });

      return res.json({ message: 'Bonus added (test mode)', wallet });
    }

    // Supabase flow
    const { data: existingWallet, error: selectErr } = await dbClient
      .from('wallets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!existingWallet) {
      const { data: created, error: createErr } = await dbClient
        .from('wallets')
        .insert({ user_id, balance: parsed, virtual_balance: 0, total_profit: 0, created_at: new Date(), updated_at: new Date() });

      if (createErr) return res.status(400).json({ error: createErr.message });

      await dbClient.from('transactions').insert({ user_id, type: 'bonus', amount: parsed, description: description || 'Admin manual credit (Bonus)', created_at: new Date() });

      return res.json({ message: 'Bonus added', wallet: created[0] });
    }

    const newBalance = (existingWallet.balance || 0) + parsed;
    const { data: updated, error: updateErr } = await dbClient
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date() })
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    await dbClient.from('transactions').insert({ user_id, type: 'bonus', amount: parsed, description: description || 'Admin manual credit (Bonus)', created_at: new Date() });

    res.json({ message: 'Bonus added', wallet: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get all bonuses
app.get('/api/admin/bonuses', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      const bonuses = (mockDb.transactions || [])
        .filter((t) => t.type === 'bonus')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.json(bonuses);
    }

    const { data, error } = await dbClient
      .from('transactions')
      .select('*')
      .eq('type', 'bonus')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/withdrawals', async (req, res) => {
  try {
    const { user_id, amount, wallet_address, crypto_type } = req.body;

    if (!hasSupabaseConfig) {
      const withdrawal = {
        id: randomUUID(),
        user_id,
        amount,
        wallet_address,
        crypto_type,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockDb.withdrawals.push(withdrawal);
      return res.status(201).json({ message: 'Withdrawal request created (test mode)', data: [withdrawal] });
    }

    const { data, error } = await dbClient
      .from('withdrawals')
      .insert({
        user_id,
        amount,
        wallet_address,
        crypto_type,
        status: 'pending',
        created_at: new Date()
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Withdrawal request created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/referrals/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!hasSupabaseConfig) {
      return res.json(mockDb.users.filter((user) => user.sponsor === user_id));
    }

    const { data, error } = await dbClient
      .from('users')
      .select('*')
      .eq('sponsor', user_id);

    if (error) {
      return res.status(404).json({ error: 'No referrals found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin summary: aggregate basic metrics
app.get('/api/admin/summary', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.users = mockDb.users || [];
      mockDb.transactions = mockDb.transactions || [];
      mockDb.wallets = mockDb.wallets || [];
      mockDb.kycSubmissions = mockDb.kycSubmissions || [];

      const totalUsers = mockDb.users.length;
      const totalDeposits = mockDb.transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + Number(t.amount || 0), 0);
      const totalWithdrawals = mockDb.transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + Number(t.amount || 0), 0);
      const totalProfit = mockDb.transactions.filter(t => t.type === 'profit').reduce((s, t) => s + Number(t.amount || 0), 0);
      const totalWallet = mockDb.wallets.reduce((s, w) => s + Number(w.balance || 0), 0);
      const kycPending = mockDb.kycSubmissions.filter(k => k.status === 'pending').length;
      const kycVerified = mockDb.kycSubmissions.filter(k => k.status === 'verified').length;

      return res.json({ totalUsers, totalDeposits, totalWithdrawals, totalProfit, totalWallet, kycPending, kycVerified });
    }

    // Supabase aggregation - multiple queries
    const [{ data: users }, { data: deposits }, { data: withdrawals }, { data: profits }, { data: wallets }, { data: kycPending }, { data: kycVerified }] = await Promise.all([
      dbClient.from('users').select('id'),
      dbClient.from('transactions').select('amount').eq('type', 'deposit'),
      dbClient.from('transactions').select('amount').eq('type', 'withdrawal'),
      dbClient.from('transactions').select('amount').eq('type', 'profit'),
      dbClient.from('wallets').select('balance'),
      dbClient.from('kyc_submissions').select('id').eq('status', 'pending'),
      dbClient.from('kyc_submissions').select('id').eq('status', 'verified')
    ]);

    const totalUsers = Array.isArray(users) ? users.length : 0;
    const totalDeposits = Array.isArray(deposits) ? deposits.reduce((s, r) => s + Number(r.amount || 0), 0) : 0;
    const totalWithdrawals = Array.isArray(withdrawals) ? withdrawals.reduce((s, r) => s + Number(r.amount || 0), 0) : 0;
    const totalProfit = Array.isArray(profits) ? profits.reduce((s, r) => s + Number(r.amount || 0), 0) : 0;
    const totalWallet = Array.isArray(wallets) ? wallets.reduce((s, r) => s + Number(r.balance || 0), 0) : 0;
    const kycPendingCount = Array.isArray(kycPending) ? kycPending.length : 0;
    const kycVerifiedCount = Array.isArray(kycVerified) ? kycVerified.length : 0;

    res.json({ totalUsers, totalDeposits, totalWithdrawals, totalProfit, totalWallet, kycPending: kycPendingCount, kycVerified: kycVerifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// KYC submission (user)
app.post('/api/kyc_submissions', async (req, res) => {
  try {
    const {
      user_id,
      id_type,
      id_number,
      full_name,
      name,
      id_image_url,
      ktp_file_url,
      selfie_image_url,
      selfie_file_url,
      address_proof_url
    } = req.body;

    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const normalizedFullName = full_name || name || 'Unknown User';
    const normalizedKtpUrl = ktp_file_url || id_image_url || null;
    const normalizedSelfieUrl = selfie_file_url || selfie_image_url || null;

    if (!hasSupabaseConfig) {
      mockDb.kycSubmissions = mockDb.kycSubmissions || [];
      const submission = {
        id: randomUUID(),
        user_id,
        full_name: normalizedFullName,
        id_type,
        id_number,
        id_image_url: normalizedKtpUrl,
        ktp_file_url: normalizedKtpUrl,
        selfie_image_url: normalizedSelfieUrl,
        selfie_file_url: normalizedSelfieUrl,
        address_proof_url: address_proof_url || null,
        status: 'pending',
        notes: null,
        reviewed_by: null,
        reviewed_date: null,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      mockDb.kycSubmissions.push(submission);
      return res.status(201).json({ message: 'KYC submitted (test mode)', data: submission });
    }

    const payload = {
      user_id,
      full_name: normalizedFullName,
      id_type,
      id_number,
      ktp_file_url: normalizedKtpUrl,
      selfie_file_url: normalizedSelfieUrl,
      status: 'pending',
      notes: null,
      reviewed_at: null,
      submitted_at: new Date(),
      created_at: new Date()
    };

    const { data, error } = await dbClient.from('kyc_submissions').insert(payload).select();
    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'KYC submitted', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: list KYC submissions
app.get('/api/admin/kyc_submissions', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.kycSubmissions = mockDb.kycSubmissions || [];
      return res.json(mockDb.kycSubmissions);
    }

    const { data, error } = await dbClient.from('kyc_submissions').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    const rows = (data || []).map((item) => ({
      ...item,
      name: item.full_name || null,
      memberName: item.full_name || null,
      id_image_url: item.id_image_url || item.ktp_file_url || null,
      selfie_image_url: item.selfie_image_url || item.selfie_file_url || null,
      reviewed_date: item.reviewed_date || item.reviewed_at || null,
      submittedDate: item.submittedDate || item.submitted_at || item.created_at
    }));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: approve KYC
app.post('/api/admin/kyc/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, admin_id } = req.body;

    if (!hasSupabaseConfig) {
      mockDb.kycSubmissions = mockDb.kycSubmissions || [];
      const idx = mockDb.kycSubmissions.findIndex((k) => k.id === id);
      if (idx === -1) return res.status(404).json({ error: 'KYC not found' });
      mockDb.kycSubmissions[idx] = { ...mockDb.kycSubmissions[idx], status: 'verified', notes: notes || null, reviewed_by: 'admin', reviewed_date: new Date().toISOString() };
      return res.json({ message: 'KYC approved (test mode)', data: mockDb.kycSubmissions[idx] });
    }

    const { data, error } = await dbClient
      .from('kyc_submissions')
      .update({ status: 'verified', notes: notes || null, reviewed_at: new Date() })
      .eq('id', id)
      .select();
    if (error) return res.status(400).json({ error: error.message });
    
    await logAction(admin_id, 'APPROVE_KYC', data[0].user_id, { kyc_id: id, notes });
    
    res.json({ message: 'KYC approved', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: reject KYC
app.post('/api/admin/kyc/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, admin_id } = req.body;

    if (!hasSupabaseConfig) {
      mockDb.kycSubmissions = mockDb.kycSubmissions || [];
      const idx = mockDb.kycSubmissions.findIndex((k) => k.id === id);
      if (idx === -1) return res.status(404).json({ error: 'KYC not found' });
      mockDb.kycSubmissions[idx] = { ...mockDb.kycSubmissions[idx], status: 'rejected', notes: notes || null, reviewed_by: 'admin', reviewed_date: new Date().toISOString() };
      return res.json({ message: 'KYC rejected (test mode)', data: mockDb.kycSubmissions[idx] });
    }

    const { data, error } = await dbClient
      .from('kyc_submissions')
      .update({ status: 'rejected', notes: notes || null, reviewed_at: new Date() })
      .eq('id', id)
      .select();
    if (error) return res.status(400).json({ error: error.message });
    
    await logAction(admin_id, 'REJECT_KYC', data[0].user_id, { kyc_id: id, notes });

    res.json({ message: 'KYC rejected', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload KYC file (base64) to Supabase Storage (bucket: 'kyc')
app.post('/api/kyc_upload', async (req, res) => {
  try {
    const { filename, content_base64, content_type, user_id } = req.body;
    if (!filename || !content_base64) return res.status(400).json({ error: 'Missing file data' });

    if (!hasSupabaseConfig || !supabaseAdmin) {
      // return mock url
      const mockUrl = `/mock_storage/kyc/${user_id || 'unknown'}/${filename}`;
      return res.json({ url: mockUrl });
    }

    const buffer = Buffer.from(content_base64, 'base64');
    const path = `kyc/${user_id || 'unknown'}/${Date.now()}_${filename}`;

    const { data, error } = await supabaseAdmin.storage.from('kyc').upload(path, buffer, { contentType: content_type || 'application/octet-stream' });
    if (error) return res.status(400).json({ error: error.message || error });

    const { data: publicData } = supabaseAdmin.storage.from('kyc').getPublicUrl(path);
    const publicUrl = publicData?.publicUrl || null;

    res.json({ url: publicUrl, raw: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: members management
app.get('/api/admin/members', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.users = mockDb.users || [];
      return res.json(mockDb.users.slice().reverse());
    }

    const { data, error } = await dbClient.from('users').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    if (!hasSupabaseConfig) {
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Member not found' });
      mockDb.users[idx] = { ...mockDb.users[idx], ...payload, updated_at: new Date().toISOString() };
      return res.json({ message: 'Member updated (test mode)', data: mockDb.users[idx] });
    }

    const { data, error } = await dbClient.from('users').update(payload).eq('id', id).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Member updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!hasSupabaseConfig) {
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Member not found' });
      const deleted = mockDb.users.splice(idx, 1)[0];
      return res.json({ message: 'Member deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('users').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/members/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!hasSupabaseConfig) {
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Member not found' });
      mockDb.users[idx].is_active = Boolean(is_active);
      mockDb.users[idx].updated_at = new Date().toISOString();
      return res.json({ message: 'Member status updated (test mode)', data: mockDb.users[idx] });
    }

    const { data, error } = await dbClient.from('users').update({ is_active: Boolean(is_active) }).eq('id', id).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Member status updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deposits: user flow and admin verification
app.post('/api/deposits', async (req, res) => {
  try {
    const { user_id, amount, reference } = req.body;
    const parsed = Number(amount);
    if (!user_id || !parsed || Number.isNaN(parsed) || parsed <= 0) return res.status(400).json({ error: 'Invalid deposit data' });

    if (!hasSupabaseConfig) {
      mockDb.transactions = mockDb.transactions || [];
      const tx = { id: randomUUID(), user_id, type: 'deposit', amount: parsed, reference: reference || null, status: 'pending', created_at: new Date().toISOString() };
      mockDb.transactions.push(tx);
      return res.status(201).json({ message: 'Deposit created (test mode)', data: tx });
    }

    const depositPayload = {
      user_id,
      amount: parsed,
      payment_method: 'manual',
      bank_name: null,
      account_number: null,
      account_name: null,
      code: `DEP-${Date.now()}`,
      status: 'pending',
      proof_url: reference || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    const { data, error } = await dbClient.from('deposits').insert(depositPayload).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Deposit created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/deposits', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.transactions = mockDb.transactions || [];
      const deposits = mockDb.transactions.filter(t => t.type === 'deposit').slice().reverse();
      return res.json(deposits);
    }

    const { data, error } = await dbClient.from('deposits').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    const mapped = (data || []).map((d) => ({
      id: d.id,
      user_id: d.user_id,
      amount: Number(d.amount || 0),
      code: d.code,
      bank_name: d.bank_name,
      account_number: d.account_number,
      account_name: d.account_name,
      proof_url: d.proof_url,
      created_at: d.created_at,
      status: d.status === 'confirmed' ? 'verified' : d.status
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/deposits/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;

    let txData = null;
    let amount = 0;

    if (!hasSupabaseConfig) {
      const idx = mockDb.transactions.findIndex((t) => t.id === id && t.type === 'deposit');
      if (idx === -1) return res.status(404).json({ error: 'Deposit not found' });
      
      mockDb.transactions[idx].status = 'verified';
      txData = mockDb.transactions[idx];
      amount = Number(txData.amount);

      const wallet = ensureWallet(txData.user_id);
      wallet.balance = (wallet.balance || 0) + amount;
      wallet.updated_at = new Date().toISOString();
      
      return res.json({ message: 'Deposit verified (test mode)' });
    }

    // Supabase flow
    const { data: deposit, error: fetchErr } = await dbClient
      .from('deposits')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !deposit) return res.status(404).json({ error: 'Deposit not found' });
    if (deposit.status === 'confirmed' || deposit.status === 'verified') {
      return res.status(400).json({ error: 'Deposit already verified' });
    }

    txData = deposit;
    amount = Number(deposit.amount);

    // Update deposit status to 'confirmed' (as per schema check constraint)
    const { error: updateErr } = await dbClient
      .from('deposits')
      .update({ status: 'confirmed', confirmed_at: new Date(), updated_at: new Date() })
      .eq('id', id);

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    // credit wallet
    const { data: existingWallet } = await dbClient.from('wallets').select('*').eq('user_id', txData.user_id).single();
    if (!existingWallet) {
      await dbClient.from('wallets').insert({ user_id: txData.user_id, balance: amount, virtual_balance: 0, total_profit: 0, created_at: new Date(), updated_at: new Date() });
    } else {
      const newBalance = (existingWallet.balance || 0) + amount;
      await dbClient.from('wallets').update({ balance: newBalance, updated_at: new Date() }).eq('user_id', txData.user_id);
    }

    // Add transaction record (no 'status' column in schema)
    await dbClient.from('transactions').insert({
      user_id: txData.user_id,
      type: 'deposit',
      amount: amount,
      description: `Deposit confirmed: ${txData.code || id}`,
      reference_table: 'deposits',
      reference_id: id,
      created_at: new Date()
    });

    await logAction(admin_id, 'VERIFY_DEPOSIT', txData.user_id, { deposit_id: id, amount });

    res.json({ message: 'Deposit verified' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/deposits/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, admin_id } = req.body;

    if (!hasSupabaseConfig) {
      const idx = mockDb.transactions.findIndex((t) => t.id === id && t.type === 'deposit');
      if (idx === -1) return res.status(404).json({ error: 'Deposit not found' });
      mockDb.transactions[idx].status = 'rejected';
      mockDb.transactions[idx].notes = notes;
      return res.json({ message: 'Deposit rejected (test mode)' });
    }

    const { error } = await dbClient.from('deposits').update({ status: 'rejected', updated_at: new Date() }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    
    await logAction(admin_id, 'REJECT_DEPOSIT', null, { deposit_id: id, notes });

    res.json({ message: 'Deposit rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: delete deposit
app.delete('/api/admin/deposits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!hasSupabaseConfig) {
      mockDb.transactions = mockDb.transactions || [];
      const idx = mockDb.transactions.findIndex(t => t.id === id && t.type === 'deposit');
      if (idx === -1) return res.status(404).json({ error: 'Deposit not found' });
      const deleted = mockDb.transactions.splice(idx, 1)[0];
      return res.json({ message: 'Deposit deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('deposits').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Deposit deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: bonuses
app.get('/api/admin/bonuses', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.bonuses = mockDb.bonuses || [];
      return res.json(mockDb.bonuses.slice().reverse());
    }

    const { data, error } = await dbClient.from('bonuses').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/bonuses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!hasSupabaseConfig) {
      mockDb.bonuses = mockDb.bonuses || [];
      const idx = mockDb.bonuses.findIndex(b => String(b.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'Bonus not found' });
      const deleted = mockDb.bonuses.splice(idx, 1)[0];
      return res.json({ message: 'Bonus deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('bonuses').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Bonus deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: profits
app.get('/api/admin/profits', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.profits = mockDb.profits || [];
      return res.json(mockDb.profits.slice().reverse());
    }

    const { data, error } = await dbClient.from('profits').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: investments management
app.get('/api/admin/investments', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.investments = mockDb.investments || [];
      return res.json(mockDb.investments.slice().reverse());
    }

    const { data, error } = await dbClient.from('investments').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/investments', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.username || !payload.amount) return res.status(400).json({ error: 'Invalid payload' });

    if (!hasSupabaseConfig) {
      mockDb.investments = mockDb.investments || [];
      const inv = { id: randomUUID(), ...payload, status: 'active', created_at: new Date().toISOString() };
      mockDb.investments.push(inv);
      return res.status(201).json({ message: 'Investment created (test mode)', data: inv });
    }

    const { data, error } = await dbClient.from('investments').insert({ ...payload, status: 'active', created_at: new Date() }).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Investment created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/investments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!hasSupabaseConfig) {
      mockDb.investments = mockDb.investments || [];
      const idx = mockDb.investments.findIndex(i => String(i.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'Investment not found' });
      const deleted = mockDb.investments.splice(idx, 1)[0];
      return res.json({ message: 'Investment deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('investments').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/profits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!hasSupabaseConfig) {
      mockDb.profits = mockDb.profits || [];
      const idx = mockDb.profits.findIndex(b => String(b.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'Profit not found' });
      const deleted = mockDb.profits.splice(idx, 1)[0];
      return res.json({ message: 'Profit deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('profits').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Profit deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: FAQ manager
app.get('/api/admin/faqs', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.faqs = mockDb.faqs || [];
      return res.json(mockDb.faqs.slice().reverse());
    }

    const { data, error } = await dbClient.from('faqs').select('*').order('id', { ascending: false });
    if (error) return res.json([]);
    res.json(data || []);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/admin/faqs', async (req, res) => {
  try {
    const { question, answer, published = true } = req.body || {};
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required' });

    if (!hasSupabaseConfig) {
      mockDb.faqs = mockDb.faqs || [];
      const item = {
        id: mockDb.faqs.length ? Math.max(...mockDb.faqs.map((f) => Number(f.id) || 0)) + 1 : 1,
        question,
        answer,
        published: Boolean(published),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDb.faqs.push(item);
      return res.status(201).json(item);
    }

    const { data, error } = await dbClient
      .from('faqs')
      .insert({ question, answer, published: Boolean(published), created_at: new Date(), updated_at: new Date() })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, published } = req.body || {};

    if (!hasSupabaseConfig) {
      mockDb.faqs = mockDb.faqs || [];
      const idx = mockDb.faqs.findIndex((f) => String(f.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'FAQ not found' });
      mockDb.faqs[idx] = {
        ...mockDb.faqs[idx],
        ...(question !== undefined ? { question } : {}),
        ...(answer !== undefined ? { answer } : {}),
        ...(published !== undefined ? { published: Boolean(published) } : {}),
        updated_at: new Date().toISOString()
      };
      return res.json(mockDb.faqs[idx]);
    }

    const payload = {
      ...(question !== undefined ? { question } : {}),
      ...(answer !== undefined ? { answer } : {}),
      ...(published !== undefined ? { published: Boolean(published) } : {}),
      updated_at: new Date()
    };
    const { data, error } = await dbClient.from('faqs').update(payload).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!hasSupabaseConfig) {
      mockDb.faqs = mockDb.faqs || [];
      const idx = mockDb.faqs.findIndex((f) => String(f.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'FAQ not found' });
      const deleted = mockDb.faqs.splice(idx, 1)[0];
      return res.json({ message: 'FAQ deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('faqs').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: news manager
app.get('/api/admin/news', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.news = mockDb.news || [];
      return res.json(mockDb.news.slice().reverse());
    }

    const { data, error } = await dbClient.from('news').select('*').order('id', { ascending: false });
    if (error) return res.json([]);
    res.json(data || []);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/admin/news', async (req, res) => {
  try {
    const payload = req.body || {};
    const judul = payload.judul || payload.title;
    const konten = payload.konten || payload.content || '';
    const username = payload.username || 'admin';
    const tgl = payload.tgl || new Date().toISOString();
    const published = payload.published !== false;

    if (!judul) return res.status(400).json({ error: 'Judul is required' });

    if (!hasSupabaseConfig) {
      mockDb.news = mockDb.news || [];
      const item = {
        id: mockDb.news.length ? Math.max(...mockDb.news.map((n) => Number(n.id) || 0)) + 1 : 1,
        username,
        tgl,
        judul,
        konten,
        published,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDb.news.push(item);
      return res.status(201).json(item);
    }

    const { data, error } = await dbClient
      .from('news')
      .insert({ username, tgl, judul, konten, published, created_at: new Date(), updated_at: new Date() })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    if (!hasSupabaseConfig) {
      mockDb.news = mockDb.news || [];
      const idx = mockDb.news.findIndex((n) => String(n.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'News not found' });
      mockDb.news[idx] = {
        ...mockDb.news[idx],
        ...(payload.judul !== undefined ? { judul: payload.judul } : {}),
        ...(payload.konten !== undefined ? { konten: payload.konten } : {}),
        ...(payload.username !== undefined ? { username: payload.username } : {}),
        ...(payload.published !== undefined ? { published: Boolean(payload.published) } : {}),
        updated_at: new Date().toISOString()
      };
      return res.json(mockDb.news[idx]);
    }

    const updatePayload = {
      ...(payload.judul !== undefined ? { judul: payload.judul } : {}),
      ...(payload.konten !== undefined ? { konten: payload.konten } : {}),
      ...(payload.username !== undefined ? { username: payload.username } : {}),
      ...(payload.published !== undefined ? { published: Boolean(payload.published) } : {}),
      updated_at: new Date()
    };
    const { data, error } = await dbClient.from('news').update(updatePayload).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/news/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!hasSupabaseConfig) {
      mockDb.news = mockDb.news || [];
      const idx = mockDb.news.findIndex((n) => String(n.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'News not found' });
      const deleted = mockDb.news.splice(idx, 1)[0];
      return res.json({ message: 'News deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('news').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: testimonials manager
app.get('/api/admin/testimonials', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.testimonials = mockDb.testimonials || [];
      return res.json(mockDb.testimonials.slice().reverse());
    }

    const { data, error } = await dbClient.from('testimonials').select('*').order('id', { ascending: false });
    if (error) return res.json([]);
    res.json(data || []);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/admin/testimonials', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.username || !payload.judul) {
      return res.status(400).json({ error: 'username and judul are required' });
    }

    if (!hasSupabaseConfig) {
      mockDb.testimonials = mockDb.testimonials || [];
      const item = {
        id: mockDb.testimonials.length ? Math.max(...mockDb.testimonials.map((t) => Number(t.id) || 0)) + 1 : 1,
        username: payload.username,
        judul: payload.judul,
        gambar: payload.gambar || '',
        tgl: new Date().toISOString(),
        published: payload.published !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDb.testimonials.push(item);
      return res.status(201).json(item);
    }

    const { data, error } = await dbClient
      .from('testimonials')
      .insert({
        username: payload.username,
        judul: payload.judul,
        gambar: payload.gambar || '',
        published: payload.published !== false,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/testimonials/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body || {};

    if (!hasSupabaseConfig) {
      mockDb.testimonials = mockDb.testimonials || [];
      const idx = mockDb.testimonials.findIndex((t) => String(t.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'Testimonial not found' });
      mockDb.testimonials[idx] = {
        ...mockDb.testimonials[idx],
        published: Boolean(published),
        updated_at: new Date().toISOString()
      };
      return res.json({ message: 'Testimonial updated (test mode)', data: mockDb.testimonials[idx] });
    }

    const { data, error } = await dbClient
      .from('testimonials')
      .update({ published: Boolean(published), updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Testimonial updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!hasSupabaseConfig) {
      mockDb.testimonials = mockDb.testimonials || [];
      const idx = mockDb.testimonials.findIndex((t) => String(t.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'Testimonial not found' });
      const deleted = mockDb.testimonials.splice(idx, 1)[0];
      return res.json({ message: 'Testimonial deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('testimonials').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: payment confirmations
app.get('/api/admin/payments', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.payments = mockDb.payments || [];
      const sourceRows = mockDb.payments.length > 0
        ? mockDb.payments
        : (mockDb.transactions || []).filter((t) => t.type === 'deposit');
      const rows = sourceRows
        .slice()
        .reverse()
        .map((p, idx) => ({
          id: p.id,
          no: idx + 1,
          tgl: p.tgl || p.created_at || '-',
          username: p.username || p.user_id || '-',
          nama: p.nama || p.name || '-',
          jenis: p.jenis || p.type || 'deposit',
          jumlah: Number(p.jumlah ?? p.amount ?? 0),
          tujuan: p.tujuan || p.reference || '-',
          info: p.info || p.notes || '-',
          foto: p.foto || p.photo || null,
          status: p.status || 'pending'
        }));
      return res.json(rows);
    }

    const { data, error } = await dbClient
      .from('transactions')
      .select('*')
      .in('type', ['deposit'])
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });

    const rows = (data || []).map((p, idx) => ({
      id: p.id,
      no: idx + 1,
      tgl: p.created_at || '-',
      username: p.username || p.user_id || '-',
      nama: p.name || '-',
      jenis: p.type || 'deposit',
      jumlah: Number(p.amount || 0),
      tujuan: p.reference || '-',
      info: p.notes || '-',
      foto: p.photo || null,
      status: p.status || 'pending'
    }));

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!hasSupabaseConfig) {
      mockDb.payments = mockDb.payments || [];
      const paymentIdx = mockDb.payments.findIndex((p) => String(p.id) === String(id));
      if (paymentIdx !== -1) {
        const deleted = mockDb.payments.splice(paymentIdx, 1)[0];
        return res.json({ message: 'Payment deleted (test mode)', data: deleted });
      }

      mockDb.transactions = mockDb.transactions || [];
      const txIdx = mockDb.transactions.findIndex((t) => String(t.id) === String(id) && t.type === 'deposit');
      if (txIdx === -1) return res.status(404).json({ error: 'Payment not found' });
      const deleted = mockDb.transactions.splice(txIdx, 1)[0];
      return res.json({ message: 'Payment deleted (test mode)', data: deleted });
    }

    const { error } = await dbClient.from('transactions').delete().eq('id', id).in('type', ['deposit']);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: download items & files
app.get('/api/admin/download_items', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.download_items = mockDb.download_items || [];
      return res.json(mockDb.download_items.slice().reverse());
    }

    const { data, error } = await dbClient.from('download_items').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/files', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.files = mockDb.files || [];
      return res.json(mockDb.files.slice().reverse());
    }

    const { data, error } = await dbClient.from('download_files').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper for logging admin actions
const logAction = async (admin_id, action, target_user_id, details) => {
  try {
    await dbClient.from('admin_logs').insert({
      admin_id: admin_id || '00000000-0000-0000-0000-000000000000',
      action,
      target_user_id,
      details
    });
  } catch (err) {
    console.error('Failed to log action:', err);
  }
};

app.post('/api/user/pin/verify', async (req, res) => {
  const { user_id, pin } = req.body;
  try {
    const { data: pinRecord, error } = await dbClient.from('user_pins').select('pin_hash').eq('user_id', user_id).single();
    if (error || !pinRecord) return res.status(404).json({ error: 'PIN belum diatur' });
    
    const isValid = await bcryptjs.compare(pin, pinRecord.pin_hash);
    if (!isValid) return res.status(401).json({ error: 'PIN salah' });
    
    res.json({ message: 'PIN valid' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get logs
app.get('/api/admin/logs', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      return res.json([]);
    }
    const { data, error } = await dbClient
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/profits/add', async (req, res) => {

  const { user_id, amount, description, admin_id } = req.body;
  try {
    await dbClient.from('admin_logs').insert({
      admin_id: admin_id || '00000000-0000-0000-0000-000000000000',
      action: 'ADD_PROFIT',
      target_user_id: user_id,
      details: { amount, description }
    });
    await dbClient.from('transactions').insert({
      user_id,
      type: 'profit',
      amount,
      description
    });
    const { data: wallet } = await dbClient.from('wallets').select('balance, total_profit').eq('user_id', user_id).single();
    await dbClient.from('wallets').update({
      balance: Number(wallet.balance) + Number(amount),
      total_profit: Number(wallet.total_profit) + Number(amount)
    }).eq('user_id', user_id);
    const { data: user } = await dbClient.from('users').select('total_profit').eq('id', user_id).single();
    await dbClient.from('users').update({
      total_profit: Number(user.total_profit) + Number(amount)
    }).eq('id', user_id);
    res.json({ message: 'Profit added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User: get notifications
app.get('/api/user/notifications/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await dbClient
      .from('user_notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User: mark notification as read
app.post('/api/user/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await dbClient
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get all withdrawals
app.get('/api/admin/withdrawals', async (req, res) => {
  try {
    if (!hasSupabaseConfig) {
      mockDb.withdrawals = mockDb.withdrawals || [];
      return res.json(mockDb.withdrawals.slice().reverse());
    }
    const { data, error } = await dbClient
      .from('withdrawals')
      .select('*, users(name, username, email)')
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: update withdrawal status
app.put('/api/admin/withdrawals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_id } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!hasSupabaseConfig) {
      mockDb.withdrawals = mockDb.withdrawals || [];
      const idx = mockDb.withdrawals.findIndex(w => w.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Withdrawal not found' });
      mockDb.withdrawals[idx] = { ...mockDb.withdrawals[idx], status, updated_at: new Date().toISOString() };
      return res.json({ message: 'Withdrawal updated (test mode)', data: mockDb.withdrawals[idx] });
    }

    const { data, error } = await dbClient
      .from('withdrawals')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    
    try {
      await dbClient.from('admin_logs').insert({
        admin_id: admin_id || '00000000-0000-0000-0000-000000000000',
        action: 'UPDATE_WITHDRAWAL_STATUS',
        target_user_id: data[0].user_id,
        details: { withdrawal_id: id, status }
      });
    } catch(e) {}

    res.json({ message: 'Withdrawal updated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
