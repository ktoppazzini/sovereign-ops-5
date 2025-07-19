'use client'
import { useState } from 'react'
import translations from '../../translations'

export default function LoginPage() {
  const [lang, setLang] = useState('en')
  const t = translations[lang]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfa, setMfa] = useState('')
  const [status, setStatus] = useState('')
  const [step, setStep] = useState('login')

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setStatus('🔐 Verifying credentials...')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (res.ok) {
        setStatus('📩 MFA code sent. Enter it below.')
        setStep('mfa')
      } else {
        setStatus(`❌ ${data.error || 'Login failed'}`)
      }
    } catch (err) {
      console.error(err)
      setStatus('❌ Server error. Try again later.')
    }
  }

  const handleVerifyMFA = async (e) => {
    e.preventDefault()
    setStatus('🔎 Verifying MFA...')

    try {
      const res = await fetch('/api/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mfa })
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('session', JSON.stringify({ email, role: data.role }))
        setStatus('✅ Success. Redirecting...')
        setTimeout(() => {
          if (data.role === 'Admin') window.location.href = '/admin'
          else if (data.role === 'Regional Manager') window.location.href = '/regional'
          else window.location.href = '/dashboard'
        }, 1200)
      } else {
        setStatus(`❌ ${data.error}`)
      }
    } catch (err) {
      console.error(err)
      setStatus('❌ Verification failed. Try again.')
    }
  }

  const handleResendMFA = async () => {
    setStatus('🔁 Resending MFA...')
    try {
      const res = await fetch('/api/resend-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) setStatus('✅ New code sent.')
      else setStatus(`❌ ${data.error}`)
    } catch (err) {
      console.error(err)
      setStatus('❌ Error resending code.')
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
      <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
        <button onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}>
          {lang === 'en' ? 'FR' : 'EN'}
        </button>
      </div>

      <h2 style={{ marginBottom: '2rem' }}>{lang === 'en' ? 'Secure Login' : 'Connexion sécurisée'}</h2>

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
        <form onSubmit={handleVerifyMFA}>
          <input style={inputStyle} type="text" placeholder="MFA Code" value={mfa} onChange={e => setMfa(e.target.value)} required />
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
          <p style={{ marginTop: '1rem' }}>
            <button onClick={handleResendMFA} type="button" style={{
              fontSize: '0.9rem',
              color: '#0a2447',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>
              Didn't get the code? Resend
            </button>
          </p>
        </form>
      )}

      <p style={{ marginTop: '1rem', color: status.includes('✅') ? 'green' : 'red' }}>{status}</p>
    </main>
  )
}

