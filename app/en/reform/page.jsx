'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReformFormEN() {
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
        setMessage('✅ Report submitted successfully.');
      } else {
        setMessage(result.error || '❌ Something went wrong.');
      }
    } catch {
      setMessage('❌ Submission error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl relative">
        {/* Header with logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image src="/secure.png" alt="Sovereign Ops" width={32} height={32} />
            <h1 className="text-lg font-bold text-blue-900">Sovereign Ops™</h1>
          </div>
          <Link href="/fr/reform" className="text-blue-600 font-semibold hover:underline">FR</Link>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Reform Report Generator</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Organization Name" name="organization" value={form.organization} onChange={handleChange} />

          <Select label="Country" name="country" value={form.country} onChange={handleChange} options={options.countries} />
          <Select label="Company Size" name="size" value={form.size} onChange={handleChange} options={options.sizes} />
          <Select label="Tier" name="tier" value={form.tier} onChange={handleChange} options={options.tiers} />
          <Select label="Time Frame" name="timeFrame" value={form.timeFrame} onChange={handleChange} options={options.timeFrames} />

          <TextArea label="Desired Outcome" name="outcome" value={form.outcome} onChange={handleChange} />
          <Input label="Cost Savings Goal" name="savings" value={form.savings} onChange={handleChange} />
          <TextArea label="Strategic Goals" name="goals" value={form.goals} onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-900 text-white font-semibold rounded hover:bg-blue-800 transition"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}

// Reusable components
function Input({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-2"
        required
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange }) {
  return (
    <div>
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

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-2"
        required
      >
        <option value="">-- Select --</option>
        {options?.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}


