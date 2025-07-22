'use client';
import { useEffect, useState } from 'react';

export default function ReformFR() {
  const [form, setForm] = useState({
    organization: '', country: '', size: '', tier: '', timeFrame: '', outcome: '', savings: '', goals: '',
  });
  const [options, setOptions] = useState({ countries: [], sizes: [], tiers: [], timeFrames: [] });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/options')
      .then(res => res.json())
      .then(data => setOptions(data.fr))
      .catch(() => setMsg("Erreur de chargement"));
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
      setMsg(res.ok ? '✅ Rapport généré.' : result.error || 'Erreur de génération.');
    } catch (err) {
      setMsg('❌ Erreur de soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <img src="/secure.png" alt="Sovereign Ops" className="h-10" />
          <a href="/en/reform" className="text-blue-600 font-bold hover:underline">EN</a>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Générateur de Rapport de Réforme</h1>

        {[
          ['organization', 'Nom de l’organisation'],
          ['country', 'Pays', options.countries],
          ['size', 'Taille de l’entreprise', options.sizes],
          ['tier', 'Forfait', options.tiers],
          ['timeFrame', 'Échéance', options.timeFrames],
          ['outcome', 'Résultat souhaité'],
          ['savings', 'Objectif d’économies'],
          ['goals', 'Objectifs stratégiques']
        ].map(([name, label, opts]) => (
          <div key={name} className="mb-4">
            <label className="block font-medium mb-1">{label}</label>
            {opts ? (
              <select name={name} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="">-- Choisir --</option>
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
          {loading ? 'Soumission...' : 'Générer le rapport'}
        </button>

        {msg && <p className="mt-4 text-center text-sm text-gray-700">{msg}</p>}
      </div>
    </div>
  );
}


