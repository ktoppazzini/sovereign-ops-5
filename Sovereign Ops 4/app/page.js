
'use client'
import { useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('')

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

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Empire Reform Generator</h1>
      <form onSubmit={handleSubmit}>
        <input name="organization" placeholder="Organization Name" required /><br />
        <input name="country" placeholder="Country" required /><br />
        <input name="tier" placeholder="Tier" required /><br />
        <input name="companySize" placeholder="Company Size" required /><br />
        <input name="goal" placeholder="Strategic Goals" required /><br />
        <input name="desiredOutcome" placeholder="Desired Outcome" required /><br />
        <input name="cost" type="number" placeholder="Cost Savings Goal" required /><br />
        <input name="timeFrame" placeholder="Implementation Time Frame" required /><br />
        <textarea name="report" placeholder="Generated Reform Report" required /><br />
        <button type="submit">Generate Report</button>
      </form>
      <p>{status}</p>
    </main>
  )
}
