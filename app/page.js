'use client';
import { useState, useEffect } from 'react';
import translations from '../translations';

export default function Home() {
  const [status, setStatus] = useState('');
  const [lang, setLang] = useState('en');

  const [countries, setCountries] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [timeFrames, setTimeFrames] = useState([]);

  const t = translations[lang];

  useEffect(() => {
    async function fetchOptions() {
      const headers = { 'Accept-Language': lang };

      const resCountries = await fetch('/api/options/countries', { headers });
      const countriesData = await resCountries.json();
      setCountries(countriesData.options || []);

      const resTiers = await fetch('/api/options/tiers', { headers });
      const tiersData = await resTiers.json();
      setTiers(tiersData.options || []);

      const resSizes = await fetch('/api/options/company-sizes');
      const sizesData = await resSizes.json();
      setSizes(sizesData.options || []);

      const resTimeFrames = await fetch('/api/options/implementation-timeframes', { headers });
      const timeFrameData = await resTimeFrames.json();
      setTimeFrames(timeFrameData.options || []);
    }

    fetchOptions();
  }, [lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    };

    const res = await fetch('https://hook.us2.make.com/qf0i3v8ufv007x1414n2p2o3676j46in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setStatus(res.ok ? '✅ Reform report submitted!' : '❌ Error sending data');
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    display: 'block',
    color: '#0a2447'
  };

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

      <button onClick={() => setLang(lang === 'en' ? 'fr' : 'en')} style={{
        marginBottom: '1.5rem',
        backgroundColor: '#eee',
        border: '1px solid #ccc',
        padding: '0.4rem 0.75rem',
        cursor: 'pointer',
        borderRadius: '5px'
      }}>
        Switch to {lang === 'en' ? 'Français' : 'English'}
      </button>

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
        <input name="goal" placeholder={t.goal} style={inputStyle} required />

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
        <textarea name="report" placeholder={t.report} rows={6} style={inputStyle} required />

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
  );
}
           
