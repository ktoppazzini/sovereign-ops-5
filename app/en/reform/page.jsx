'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReformFormEN() {
  const router = useRouter();
  const [form, setForm] = useState({
    organization: '',
    country: '',
    size: '',
    tier: '',
    outcome: '',
    savings: '',
    goals: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess('');
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (res.ok) {
        setSuccess('✅ Report submitted successfully.');
      } else {
        setSuccess('❌ Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      setSuccess('❌ Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '20px' }}>
      <div style={{ textAlign: 'right' }}>
        <a href="/fr/reform">FR</a>
      </div>
      <h2>Reform Report Generator</h2>

      <label>Organization Name</label>
      <input name="organization" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }} />

      <label>Country</label>
      <select name="country" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }}>
        <option value="">-- Select Country --</option>
        <option value="Canada">Canada</option>
        <option value="United States">United States</option>
        <option value="France">France</option>
        <option value="Other">Other</option>
      </select>

      <label>Company Size</label>
      <select name="size" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }}>
        <option value="">-- Select Size --</option>
        <option value="1–10">1–10</option>
        <option value="11–50">11–50</option>
        <option value="51–250">51–250</option>
        <option value="250+">250+</option>
      </select>

      <label>Tier</label>
      <select name="tier" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }}>
        <option value="">-- Select Tier --</option>
        <option value="Tier 1">Tier 1 – Tactical Reform</option>
        <option value="Tier 2">Tier 2 – National Strategy</option>
        <option value="Tier 3">Tier 3 – Continental Domination</option>
      </select>

      <label>Desired Outcome</label>
      <textarea name="outcome" onChange={handleChange} rows="2" style={{ width: '100%', marginBottom: 10 }} />

      <label>Cost Savings Goal</label>
      <input name="savings" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }} />

      <label>Strategic Goals</label>
      <textarea name="goals" onChange={handleChange} rows="3" style={{ width: '100%', marginBottom: 10 }} />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Report'}
      </button>

      {success && <p style={{ marginTop: 10 }}>{success}</p>}
    </div>
  );
}
