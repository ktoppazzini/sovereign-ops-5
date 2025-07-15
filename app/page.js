'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      organization: e.target.organization.value,
      country: e.target.country.value,
      tier: e.target.tier.value,
      company_size: e.target.companySize.value,
      goal: e.target.goal.value,
      desired_outcome: e.target.desiredOutcome.value,
      cost_savings_goal: e.target.cost.value,
      implementation_time_frame: e.target.timeFrame.value,
      report_content: e.target.report.value
    }

    const res = await fetch('https://hook.us2.make.com/qf0i3v8ufv007x1414n2p2o3676j46in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    setLoading(false)
    setStatus(res.ok ? '✅ Reform request submitted!' : '❌ There was an error.')
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    backgroundColor: '#1a2233',
    color: '#fff'
  }

  const labelStyle = {
    marginBottom: '0.5rem',
    display: 'block',
    fontWeight: 'bold',
    color: '#fff'
  }

  return (
    <main style={{
      backgroundColor: '#0A1320',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Image src="/logo.png" alt="Sovereign OPS Logo" width={160} height={40} />
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Empire Reform Request Form</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <label style={labelStyle}>Organization Name</label>
        <input name="organization" placeholder="Organization Name" required style={inputStyle} />

        <label style={labelStyle}>Country</label>
        <select name="country" required style={inputStyle}>
          <option value="">Select country</option>
          <option value="Canada">Canada</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="France">France</option>
          <option value="Germany">Germany</option>
          <option value="Other">Other</option>
        </select>

        <label style={labelStyle}>Tier</label>
        <select name="tier" required style={inputStyle}>
          <option value="">Select Tier</option>
          <option value="Tier 1">Tier 1 – Core Optimization</option>
          <option value="Tier 2">Tier 2 – System Reform</option>
          <option value="Tier 3">Tier 3 – Continental Dominance</option>
        </select>

        <label style={labelStyle}>Company Size</label>
        <select name="companySize" required style={inputStyle}>
          <option value="">Select Company Size</option>
          <option value="1–10">1–10</option>
          <option value="11–50">11–50</option>
          <option value="51–200">51–200</option>
          <option value="201–1000">201–1000</option>
          <option value="1000+">1000+</option>
        </select>

        <label style={labelStyle}>Strategic Goal</label>
        <input name="goal" placeholder="E.g. Cut costs, improve efficiency" required style={inputStyle} />

        <label style={labelStyle}>Desired Outcome</label>
        <input name="desiredOutcome" placeholder="What results are you seeking?" required style={inputStyle} />

        <label style={labelStyle}>Cost Savings Goal ($)</label>
        <input name="cost" type="number" placeholder="e.g. 1000000" required style={inputStyle} />

        <label style={labelStyle}>Implementation Time Frame</label>
        <select name="timeFrame" required style={inputStyle}>
          <option value="">Select Time Frame</option>
          <option value="1 month">1 month</option>
          <option value="2 months">2 months</option>
          <option value="3 months">3 months</option>
          <option value="4 months">4 months</option>
          <option value="5 months">5 months</option>
          <option value="6 months">6 months</option>
          <option value="7 months">7 months</option>
          <option value="8 months">8 months</option>
          <option value="9 months">9 months</option>
          <option value="10 months">10 months</option>
          <option value="11 months">11 months</option>
          <option value="1 year">1 year</option>
          <option value="1.5 years">1.5 years</option>
          <option value="2 years">2 years</option>
          <option value="2.5 years">2.5 years</option>
          <option value="3 years">3 years</option>
          <option value="3.5 years">3.5 years</option>
          <option value="4 years">4 years</option>
          <option value="4.5 years">4.5 years</option>
          <option value="5 years">5 years</option>
          <option value="6 years">6 years</option>
          <option value="7 years">7 years</option>
          <option value="8 years">8 years</option>
          <option value="9 years">9 years</option>
          <option value="10 years">10 years</option>
        </select>

        <label style={labelStyle}>Generated Reform Report</label>
        <textarea name="report" placeholder="Paste your 5,000-word reform output here" required style={{ ...inputStyle, minHeight: '200px' }} />

        <button
          type="submit"
          style={{
            backgroundColor: '#1E90FF',
            color: '#fff',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Generate Report'}
        </button>
      </form>

      {status && (
        <p style={{
          marginTop: '2rem',
          fontSize: '1.25rem',
          color: status.includes('✅') ? 'limegreen' : 'red'
        }}>{status}</p>
      )}
    </main>
  )
}
