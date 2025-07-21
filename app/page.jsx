'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [stage, setStage] = useState('login'); // 'login' or 'mfa'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      console.log("🔐 Attempting login with:", email);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      console.log("🔁 Login response:", result);

      if (!res.ok) {
        setError(result.error || 'Login failed');
      } else {
        setStage('mfa');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unexpected error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    setError('');
    setLoading(true);

    console.log("🔼 Submitting MFA Code:", { email, mfaCode });

    try {
      const res = await fetch('/api/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mfaCode }),
      });

      const result = await res.json();
      console.log("✅ MFA verification result:", result);

      if (!res.ok) {
        setError(result.error || 'MFA verification failed');
      } else {
        alert('✅ MFA Verified. Redirecting...');
        window.location.href = '/dashboard'; // update if your route differs
      }
    } catch (err) {
      console.error('MFA error:', err);
      setError('Unexpected error during MFA verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>🔒 Sovereign Ops Login</h2>

      {stage === 'login' ? (
        <>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#001F3F', color: 'white', border: 'none' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </>
      ) : (
        <>
          <label>MFA Code</label>
          <input
            type="text"
            value={mfaCode}
            onChange={e => setMfaCode(e.target.value)}
            placeholder="Enter MFA code"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />

          <button
            onClick={handleMfaVerify}
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0074D9', color: 'white', border: 'none' }}
          >
            {loading ? 'Verifying...' : 'Verify MFA'}
          </button>
        </>
      )}

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

