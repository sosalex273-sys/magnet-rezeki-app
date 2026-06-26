const fetch = globalThis.fetch || require('node-fetch');

const API = 'http://localhost:5000';

async function run() {
  try {
    const ts = Date.now();
    const email = `ci-test-${ts}@example.com`;
    const password = 'TestPass123!';
    const username = `ciuser${ts}`;

    console.log('Registering:', email);
    let res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: 'CI Test', username })
    });
    const reg = await res.json();
    console.log('Register response:', reg);

    console.log('Logging in...');
    res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const login = await res.json();
    console.log('Login response:', login);

    const userId = login.user?.id || (login.user && login.user.id) || (reg.user && reg.user.id);
    console.log('User ID:', userId);

    if (userId) {
      res = await fetch(`${API}/api/users/${userId}`);
      console.log('User profile:', await res.json());

      console.log('Admin login...');
      res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });
      console.log('Admin login:', await res.json());

      console.log('Add balance via admin endpoint...');
      res = await fetch(`${API}/api/admin/wallets/${userId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000, description: 'CI credit' })
      });
      console.log('Add balance:', await res.json());
    }
  } catch (err) {
    console.error('Error:', err.message || err);
  }
}

run();
