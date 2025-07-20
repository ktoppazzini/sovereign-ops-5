import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Server error:', data.message);
        setError(data.message || 'Login failed');
      } else {
        // ✅ Login success — redirect to dashboard or homepage
        router.push('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <img src="/logo.png" alt="Sovereign OPS Logo" style={{ width: 150, marginBottom: 20 }} />
      <h2>Secure Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: '#001F3F',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Login
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>❌ {error}</p>}
    </div>
  );
}
