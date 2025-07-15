'use client'
import { useState } from 'react'

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

    setStatus(res.ok ? '✅ Reform report submitted!' : '❌ Error sending data')
    setLoading(false)
  }

  return (
    <main style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif', 
      backgroundColor: '#f4f6f8', 
      minHeight: '100vh' 
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: 'auto', 
        background: '#fff', 
        padding: '2rem', 
        borderRadius: '12px', 
        boxShadow: '0 0 20px rgba(0,0,0,0.1)' 
      }}>
        <h1 style={{ color: '#001F3F', textAlign: 'center', marginBottom: '2rem' }}>
          Sovereign OPS™ | Empire Reform Generator
        </h1>

        <form onSubmit={handleSubmit}>
          <input name="organization" placeholder="Organization Name" required style={inputStyle} />
          
          <select name="country" required style={inputStyle}>
            <option value="">Select Country</option>
            <option value="Canada">Canada</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Other">Other</option>
          </select>

          <select name="tier" required style={inputStyle}>
            <option value="">Select Tier Level</option>
            <option value="Tier 1">Tier 1 - Regional Reform</option>
            <option value="Tier 2">Tier 2 - National Efficiency</option>
            <option value="Tier 3">Tier 3 - Continental Strategy</option>
          </select>

          <select name="companySize" required style={inputStyle}>
            <option value="">Select Company Size</option>
            <option value="1-10">1–10 Employees</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="201+">201+</option>
          </select>

          <input name="goal" placeholder="Strategic Goals (e.g., streamline operations)" required style={inputStyle} />
          <input name="desiredOutcome" placeholder="Desired Outcome" required style={inputStyle} />
          <input name="cost" type="number" placeholder="Cost Savings Goal (e.g., 1000000)" required style={inputStyle} />
          <input name="timeFrame" placeholder="Implementation Time Frame (e.g., 6 months)" required style={inputStyle} />

          <textarea 
            name="report" 
            placeholder="Generated Reform Report" 
            required 
            rows="6" 
            style={{ ...inputStyle, resize: 'vertical' }} 
          ></textarea>

          <button 
            type="submit" 
            style={{
              width: '100%',
              backgroundColor: '#001F3F',
              color: '#fff',
              padding: '1rem',
              border: 'none',
              fontSize: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Generate Report'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', color: status.includes('✅') ? 'green' : 'red' }}>{status}</p>
      </div>
    </main>
  )
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem'
}
