'use client'
import { useState, useEffect } from 'react'
import translations from '../translations'

export default function Home() {
  const [status, setStatus] = useState('')
  const [lang, setLang] = useState('en')
  const [countries, setCountries] = useState([])
  const [tiers, setTiers] = useState([])
  const [sizes, setSizes] = useState([])
  const [timeFrames, setTimeFrames] = useState([])

  const t = translations[lang]

  useEffect(() => {
    async function fetchOptions() {
      const resCountries = await fetch('/api/options/countries')
      const countriesData = await resCountries.json()

      const resTiers = await fetch('/api/options/tiers')
      const tiersData = await resTiers.json()

      const resSizes = await fetch('/api/options/company-sizes')
      const sizesData = await resSizes.json()

      const resTimeFrames = await fetch('/api/options/implementation-timeframes')
      const timeFramesData = await resTimeFrames.json()

      setCountries(countriesData.options || [])
      setTiers(tiersData.options || [])
      setSizes(sizesData.options || [])
      setTimeFrames(timeFramesData.options || [])
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

    try {
      // Save to Airtable
      const airtableRes = await fetch('https://hook.us2.make.com/qf0i3v8ufv007x1414n2p2o3676j46in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!airtableRes.ok) throw new Error('Airtable submission failed')

      // PDF download
      const html = `
        <h1 style="color:#0a2447;">Reform Report</h1>
        <p><strong>Organization:</strong> ${payload.organization}</p>
        <p><strong>Country:</strong> ${payload.country}</p>
        <p><strong>Tier:</strong> ${payload.tier}</p>
        <p><strong>Company Size:</strong> ${payload.company_size}</p>
        <p><strong>Goal:</strong> ${payload.goal}</p>
        <p><strong>Outcome:</strong> ${payload.desired_outcome}</p>
        <p><strong>Cost Goal:</strong> $${payload.cost_savings_goal}</p>
        <p><strong>Timeline:</strong> ${payload.implementation_time_frame}</p>
        <p style="margin-top:1rem;"><strong>Report:</strong></p>
        <p>${payload.report_content}</p>
      `

      const pdfRes = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html })
      })

      if (pdfRes.ok) {
        const blob = await pdfRes.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ReformReport.pdf'
        a.click()
        window.URL.revokeObjectURL(url)
      }

      setStatus('✅ Reform report submitted and PDF downloaded!')
    } catch (error) {
      console.error('❌ Error:', error)
      setStatus('❌ Submission or PDF failed. Please try again.')
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
      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}>
          {lang === 'en' ? 'FR' : 'EN'}
        </button>
      </div>

      <h1 style={{ marginBottom: '2rem' }}>Empire Reform Request Form</h1>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>{t.orgName}</label>
        <input name="organization" placeholder={t.orgName} style={inputStyle} required />

        <label style={labelStyle}>{t.country}</label>
        <select name="country" style={inputStyle} required>
          <option value="">{t.country}</option>
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>

        <label style={labelStyle}>{t.tier}</label>
        <select name="tier" style={inputStyle} required>
          <option value="">{t.tier}</option>
          {tiers.map(t => <option key={t}>{t}</option>)}
        </select>

        <label style={labelStyle}>{t.companySize}</label>
        <select name="companySize" style={inputStyle} required>
          <option value="">{t.companySize}</option>
          {sizes.map(s => <option key={s}>{s}</option>)}
        </select>

        <label style={labelStyle}>{t.goal}</label>
        <input name="goal" placeholder="e.g. Cut costs, improve efficiency" style={inputStyle} required />

        <label style={labelStyle}>{t.desiredOutcome}</label>
        <input name="desiredOutcome" placeholder={t.desiredOutcome} style={inputStyle} required />

        <label style={labelStyle}>{t.cost}</label>
        <input name="cost" type="number" placeholder="1000000" style={inputStyle} required />

        <label style={labelStyle}>{t.timeFrame}</label>
        <select name="timeFrame" style={inputStyle} required>
          <option value="">{t.timeFrame}</option>
          {timeFrames.map(tf => <option key={tf}>{tf}</option>)}
        </select>

        <label style={labelStyle}>{t.report}</label>
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
          {t.submit}
        </button>
      </form>

      <p style={{ marginTop: '1rem', color: status.includes('✅') ? 'green' : 'red' }}>
        {status}
      </p>
    </main>
  )
}
