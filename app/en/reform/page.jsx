'use client';
import { useEffect, useState } from 'react';

export default function ReformFormEN() {
  const [form, setForm] = useState({
    organization: '',
    country: '',
    size: '',
    tier: '',
    outcome: '',
    savings: '',
    goals: '',
  });

  const [options, setOptions] = useState({ countries: [], sizes: [], tiers: [] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/options')
      .then(res => res.json())
      .then(data => setOptions(data))
      .catch(() => setSuccess("⚠️ Error loading dropdown options."));
  }, []);

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
        setSuccess(result.error || '❌ Error submitting form.');
      }
    } catch (err) {
      console.error(err);
      setSuccess('❌ Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <img src="/secure.png" alt="Sovereign Ops" className="h-10" />
          <a href="/fr/reform" className="text-blue-600 font-semibold hover:underline">FR</a>
        </div>

        <h1 className="text-2xl font-bold mb-6">Reform Report Generator</h1>

        {[
          { label: "Organization Name", name: "organization", type: "text" },
          { label: "Country", name: "country", type: "select", options: options.countries },
          { label: "Company Size", name: "size", type: "select", options: options.sizes },
          { label: "Tier", name: "tier", type: "select", options: options.tiers },
          { label: "Desired Outcome", name: "outcome", type: "textarea" },
          { label: "Cost Savings Goal", name: "savings", type: "text" },
          { label: "Strategic Goals", name: "goals", type: "textarea" }
        ].map(({ label, name, type, options }) => (
          <div className="mb-4" key={name}>
            <label className="block font-medium mb-1">{label}</label>
            {type === "select" ? (
              <select name={name} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">-- Select --</option>
                {options?.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
              </select>
            ) : type === "textarea" ? (
              <textarea name={name} onChange={handleChange} rows={3} className="w-full p-2 border rounded" />
            ) : (
              <input type={type} name={name} onChange={handleChange} className="w-full p-2 border rounded" />
            )}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-900 text-white py-2 mt-2 rounded hover:bg-blue-800 transition"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>

        {success && <p className="mt-4 text-green-700 text-center">{success}</p>}
      </div>
    </div>
  );
}
