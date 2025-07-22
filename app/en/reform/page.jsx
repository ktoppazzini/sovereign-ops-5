'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReformLoginStyled() {
  const [form, setForm] = useState({
    organization: '',
    country: '',
    size: '',
    tier: '',
    timeFrame: '',
    outcome: '',
    savings: '',
    goals: '',
  });

  const [options, setOptions] = useState({
    countries: [],
    sizes: [],
    tiers: [],
    timeFrames: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/options')
      .then(res => res.json())
      .then(data => {
        setOptions({
          countries: data.countries?.map(c => c.name) || [],
          sizes: data.sizes?.map(s => s.name) || [],
          tiers: data.tiers?.map(t => t.name) || [],
          timeFrames: data.timeframes?.map(tf => tf.name) || [],
        });
      })
      .catch(err => {
        console.error('Dropdown fetch failed', err);
        setMessage('⚠️ Failed to load options.');
      });
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage('✅ Reform request submitted successfully.');
      } else {
        setMessage(result.error || '❌ Something went wrong.');
      }
    } catch (err) {
      setMessage('❌ Submission error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md font-sans">
        <div className="flex justify-center mb-6">
          <Image src="/secure.png" alt="Sovereign Ops" width={40} height={40} />
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-800">🔐 Sovereign Ops Reform Generator</h2>

        <form onSubmit={handleSubmit}>
          <Field label="Organization Name" name="organization" value={form.organization} onChange={handleChange} />
          <Dropdown label="Country" name="country" value={form.country} onChange={handleChange} options={options.countries} />
          <Dropdown label="Company Size" name="size" value={form.size} onChange={handleChange} options={options.sizes} />
          <Dropdown label="Tier" name="tier" value={form.tier} onChange={handleChange} options={options.tiers} />
          <Dropdown label="Time Frame" name="timeFrame" value={form.timeFrame} onChange={handleChange} options={options.timeFrames} />
          <TextArea label="Desired Outcome" name="outcome" value={form.outcome} onChange={handleChange} />
          <Field label="Cost Savings Goal" name="savings" value={form.savings} onChange={handleChange} />
          <TextArea label="Strategic Goals" name="goals" value={form.goals} onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2 bg-[#001F3F] text-white font-bold rounded hover:bg-blue-800 transition"
          >
            {loading ? 'Submitting...' : 'Generate Report'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

        <div className="text-center mt-6">
          <Link href="/fr/reform" className="text-blue-600 text-sm underline">Français</Link>
        </div>
      </div>
    </div>
  );
}

// Components for consistent styling
function Field({ label, name, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block font-medium mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type="text"
        className="w-full border border-gray-300 rounded px-3 py-2"
        required
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-2"
        required
      />
    </div>
  );
}

function Dropdown({ label, name, value, onChange, options }) {
  return (
    <div className="mb-3">
      <label className="block font-medium mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-2"
        required
      >
        <option value="">-- Select --</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

