'use client'
import { useEffect } from 'react'

export default function LogoutPage() {
  useEffect(() => {
    localStorage.removeItem('session')
    window.location.href = '/login'
  }, [])

  return <p style={{ padding: '2rem', fontFamily: 'Arial' }}>Logging out...</p>
}
