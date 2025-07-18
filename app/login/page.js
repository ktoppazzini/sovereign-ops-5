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

  const handleLogin = async (e) => {
    e.preventDefault()
    setStatus('Logging in...')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfa })
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('session', JSON.stringify(data))
        setStatus('✅ Login successful. Redirecting...')
        setTimeout(() => {
          if (data.role === 'Admin') {
            window.location.href = '/admin'
          } else {
            window.location.href = '/dashboard'
          }
        }, 1000)
      } else {
        setStatus(`❌ ${data.error || 'Login failed'}`)
      }
    } catch (err) {
      console.error(err)
      setStatus('❌ Error logging in. Try again.')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  }

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'Arial',
      backgroundColor: '#ffffff',
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

      <form onSubmit={handleLogin}>
        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          style={inputStyle}
          type="text"
          placeholder="MFA Code"
          value={mfa}
          onChange={e => setMfa(e.target.value)}
        />
        <button type="submit" style={{
          backgroundColor: '#0a2447',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          {lang === 'en' ? 'Login' : 'Connexion'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', color: status.includes('✅') ? 'green' : 'red' }}>
        {status}
      </p>
    </main>
  )
}
