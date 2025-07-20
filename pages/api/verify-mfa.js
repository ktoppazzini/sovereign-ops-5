import { useState } from 'react';

export default function VerifyMFA() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage('');

    try {
      const response = await fetch('/api/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ Show correct dynamic message from backend
        setToastMessage(result.message || 'Verification successful');
      } else {
        setToastMessage(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setToastMessage('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Secure Login</h2>

      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ margin: '8px', padding: '8px' }}
        />

        <br />

        <input
          type="text"
          placeholder="Enter MFA code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{ margin: '8px', padding: '8px' }}
        />

        <br />

        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      {toastMessage && (
        <div style={{ marginTop: '20px', color: toastMessage.includes('sent') ? 'green' : 'red' }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}


