'use client';
import { useEffect, useState } from 'react';

export default function ReformEN() {
  const [form, setForm] = useState({
    organization: '', country: '', size: '', tier: '', timeFrame: '', outcome: '', savings: '', goals: '',
  });
  const [options, setOptions] = useState({ countries: [], sizes: [], tiers: [], timeFrames: [] });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/options')
      .then(res => res.json())
      .then(data => setOptions(data.en))
      .catch(err => setMsg("Error loading options"));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      setMsg(res.ok ? '✅ Report generated.' : result.error || 'Error generating.');
    } catch (err) {
      setMsg('❌ Submission error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <img src="/secure.png" alt="Sovereign Ops" className="h-10" />
          <a href="/fr/reform" className="text-blue-600 font-bold hover:underline">FR</a>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Reform Report Generator</h1>

        {[
          ['organization', 'Organization Name'],
          ['country', 'Country', options.countries],
          ['size', 'Company Size', options.sizes],
          ['tier', 'Tier', options.tiers],
          ['timeFrame', 'Time Frame', options.timeFrames],
          ['outcome', 'Desired Outcome'],
          ['savings', 'Cost Savings Goal'],
          ['goals', 'Strategic Goals']
        ].map(([name, label, opts]) => (
          <div key={name} className="mb-4">
            <label className="block font-medium mb-1">{label}</label>
            {opts ? (
              <select name={name} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="">-- Select --</option>
                {opts.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input name={name} type={name === 'goals' || name === 'outcome' ? 'textarea' : 'text'}
                     className="w-full border p-2 rounded"
                     onChange={handleChange} />
            )}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition">
          {loading ? 'Submitting...' : 'Generate Report'}
        </button>

        {msg && <p className="mt-4 text-center text-sm text-gray-700">{msg}</p>}
      </div>
    </div>
  );
}
