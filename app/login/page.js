'use client'
import { useEffect, useState } from 'react'
import translations from '../../translations'

export default function LoginPage() {
  const [lang, setLang] = useState('en')
  const t = translations[lang]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfa, setMfa] = useState('')
  const [status, setStatus] = useState('')
  const [step, setStep] = useState('login')

  // ⏰ Auto-redirect if logged in
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'))
    if (session && session.expires > Date.now()) {
      const role = session.role
      window.location.href = role === 'Admin'
        ? '/admin'
        : role === 'Regional Manager'
          ? '/regional'
          : '/dashboard'
    }
  }, [])

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  }

  const logAttempt = async (result, method) => {
    await fetch('/api/log-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        method,
        result,
        timestamp: new Date().toISOString()
      })
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setStatus('🔐 Checking credentials...')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (res.ok) {
        await logAttempt('Success', 'Password')
        setStatus('📲 MFA code sent.')
        setStep('mfa')
      } else {
        await logAttempt('Failed', 'Password')
        setStatus(`❌ ${data.error || 'Login failed'}`)
      }
    } catch (err) {
      console.error(err)
      await logAttempt('Error', 'Password')
      setStatus('❌ Server error.')
    }
  }

  const handleVerifyMfa = async (e) => {
    e.preventDefault()
    setStatus('🔍 Verifying MFA...')

    try {
      const res = await fetch('/api/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mfa })
      })
      const data = await res.json()

      if (res.ok) {
        await logAttempt('Success', 'MFA')
        localStorage.setItem('session', JSON.stringify({
          email,
          role: data.role,
          expires: Date.now() + 1000 * 60 * 60 // 1 hour expiry
        }))
        setStatus('✅ Success. Redirecting...')
        setTimeout(() => {
          if (data.role === 'Admin') window.location.href = '/admin'
          else if (data.role === 'Regional Manager') window.location.href = '/regional'
          else window.location.href = '/dashboard'
        }, 1000)
      } else {
        await logAttempt('Failed', 'MFA')
        setStatus(`❌ ${data.error || 'Incorrect MFA'}`)
      }
    } catch (err) {
      console.error(err)
      await logAttempt('Error', 'MFA')
      setStatus('❌ Server error.')
    }
  }

  const handleResend = async () => {
    setStatus('🔁 Resending code...')
    try {
      const res = await fetch('/api/resend-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      setStatus(res.ok ? '✅ Code resent!' : `❌ ${data.error}`)
    } catch (err) {
      console.error(err)
      setStatus('❌ Error resending.')
    }
  }

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'Arial',
      backgroundColor: '#fff',
      color: '#0a2447',
      maxWidth: '400px',
      margin: 'auto',
      marginTop: '4rem',
      textAlign: 'center'
    }}>
      <img src="/logo.png" alt="Sovereign OPS Logo" style={{ width: '160px', marginBottom: '2rem' }} />
      <div style={{ textAlign: 'right' }}>
        <button onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}>
          {lang === 'en' ? 'FR' : 'EN'}
        </button>
      </div>

      <h2>{lang === 'en' ? 'Secure Login' : 'Connexion sécurisée'}</h2>

      {step === 'login' && (
        <form onSubmit={handleLogin}>
          <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" style={{
            backgroundColor: '#0a2447',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            {lang === 'en' ? 'Login' : 'Connexion'}
          </button>
        </form>
      )}

      {step === 'mfa' && (
        <form onSubmit={handleVerifyMfa}>
          <input style={inputStyle} type="text" placeholder="Enter MFA Code" value={mfa} onChange={e => setMfa(e.target.value)} required />
          <button type="submit" style={{
            backgroundColor: '#0a2447',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Verify Code
          </button>
          <button onClick={handleResend} type="button" style={{
            fontSize: '0.9rem',
            marginTop: '1rem',
            background: 'none',
            border: 'none',
            color: '#0a2447',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}>
            Didn't get it? Resend
          </button>
        </form>
      )}

      <p style={{ marginTop: '1rem', color: status.includes('✅') ? 'green' : 'red' }}>
        {status}
      </p>
    </main>
  )
}


