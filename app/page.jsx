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
        window.location.href = '/dashboard'; // Update path if needed
      }
    } catch (err) {
      console.error('MFA error:', err);
      setError('Unexpected error during MFA verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '80px auto',
      padding: '24px',
      border: '1px solid #ccc',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 Sovereign Ops Login</h2>

      {stage === 'login' ? (
        <>
          <label style={{ fontWeight: 'bold' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '12px',
              border: '1px solid #aaa',
              borderRadius: '4px'
            }}
          />

          <label style={{ fontWeight: 'bold' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '12px',
              border: '1px solid #aaa',
              borderRadius: '4px'
            }}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#001F3F',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </>
      ) : (
        <>
          <label style={{ fontWeight: 'bold' }}>MFA Code</label>
          <input
            type="text"
            value={mfaCode}
            onChange={e => setMfaCode(e.target.value)}
            placeholder="Enter 6-digit MFA code"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '12px',
              border: '1px solid #aaa',
              borderRadius: '4px'
            }}
          />

          <button
            onClick={handleMfaVerify}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0074D9',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Verifying MFA...' : 'Verify MFA'}
          </button>
        </>
      )}

      {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}
    </div>
  );
}

