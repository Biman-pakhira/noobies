const url = 'http://localhost:3001/api/auth/register';
const body = { username: 'smoketest', email: 'smoketest+run@example.com', password: 'Password123' };

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('status', res.status);
    console.log(text);
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
