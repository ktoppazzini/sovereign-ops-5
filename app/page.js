'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [status, setStatus] = useState('')
  const [countries, setCountries] = useState([])
  const [tiers, setTiers] = useState([])
  const [sizes, setSizes] = useState([])

  useEffect(() => {
    async function fetchOptions() {
      setCountries(["Canada", "United States", "France", "Germany", "United Kingdom"])
      setTiers(["Tier 1 - Strategic Uplift", "Tier 2 - National Reform", "Tier 3 - Continental Dominance"])
      setSizes(["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"])
    }
    fetchOptions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

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

    setStatus(res.ok ? '✅ Reform report submitted!' : '❌ Error sending data')
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  }

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    display: 'block',
    color: '#0a2447'
  }

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'Arial',
      backgroundColor: '#ffffff',
      color: '#0a2447',
      maxWidth: '600px',
      margin: 'auto'
    }}>
      <img src="/logo.png" alt="Sovereign OPS Logo" style={{ width: '160px', marginBottom: '2rem' }} />
      <h1 style={{ marginBottom: '2rem' }}>Empire Reform Request Form</h1>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Organization Name</label>
        <input name="organization" placeholder="Organization Name" style={inputStyle} required />

        <label style={labelStyle}>Country</label>
        <select name="country" style={inputStyle} required>
          <option value="">Select country</option>
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>

        <label style={labelStyle}>Tier</label>
        <select name="tier" style={inputStyle} required>
          <option value="">Select Tier</option>
          {tiers.map(t => <option key={t}>{t}</option>)}
        </select>

        <label style={labelStyle}>Company Size</label>
        <select name="companySize" style={inputStyle} required>
          <option value="">Select Company Size</option>
          {sizes.map(s => <option key={s}>{s}</option>)}
        </select>

        <label style={labelStyle}>Strategic Goal</label>
        <input name="goal" placeholder="E.g. Cut costs, improve efficiency" style={inputStyle} required />

        <label style={labelStyle}>Desired Outcome</label>
        <input name="desiredOutcome" placeholder="What results are you seeking?" style={inputStyle} required />

        <label style={labelStyle}>Cost Savings Goal ($)</label>
        <input name="cost" type="number" placeholder="1000000" style={inputStyle} required />

        <label style={labelStyle}>Implementation Time Frame</label>
        <select name="timeFrame" style={inputStyle} required>
          <option value="">Select Time Frame</option>
          {[
            "1 month","2 months","3 months","4 months","5 months","6 months","7 months","8 months","9 months",
            "10 months","11 months","1 year","1.5 years","2 years","2.5 years","3 years","3.5 years",
            "4 years","4.5 years","5 years","6 years","7 years","8 years","9 years","10 years"
          ].map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <label style={labelStyle}>Generated Reform Report</label>
        <textarea name="report" placeholder="Paste the generated content here..." rows={6} style={inputStyle} required />

        <button type="submit" style={{
          backgroundColor: '#0a2447',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          Generate Report
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: status.includes('✅') ? 'green' : 'red' }}>
        {status}
      </p>
    </main>
  )
}
