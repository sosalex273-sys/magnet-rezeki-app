const testLogin = async () => {
  const res = await fetch('http://localhost:5001/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const data = await res.json();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', data);
};
testLogin();
