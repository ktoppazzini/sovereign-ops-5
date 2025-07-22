'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReformPageFR() {
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
          countries: data.countries?.map(c => c.name_fr || c.name) || [],
          sizes: data.sizes?.map(s => s.name_fr || s.name) || [],
          tiers: data.tiers?.map(t => t.name_fr || t.name) || [],
          timeFrames: data.timeframes?.map(tf => tf.name_fr || tf.name) || [],
        });
      })
      .catch(err => {
        console.error('Erreur lors du chargement des options', err);
        setMessage('⚠️ Impossible de charger les options.');
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
        setMessage('✅ Rapport soumis avec succès.');
      } else {
        setMessage(result.error || '❌ Une erreur est survenue.');
      }
    } catch (err) {
      setMessage('❌ Erreur de soumission.');
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

        <h2 className="text-xl font-bold text-center mb-6 text-gray-800">🔐 Générateur de Réforme</h2>

        <form onSubmit={handleSubmit}>
          <Field label="Nom de l’organisation" name="organization" value={form.organization} onChange={handleChange} />
          <Dropdown label="Pays" name="country" value={form.country} onChange={handleChange} options={options.countries} />
          <Dropdown label="Taille de l’entreprise" name="size" value={form.size} onChange={handleChange} options={options.sizes} />
          <Dropdown label="Forfait" name="tier" value={form.tier} onChange={handleChange} options={options.tiers} />
          <Dropdown label="Échéancier" name="timeFrame" value={form.timeFrame} onChange={handleChange} options={options.timeFrames} />
          <TextArea label="Résultat souhaité" name="outcome" value={form.outcome} onChange={handleChange} />
          <Field label="Objectif d’économies" name="savings" value={form.savings} onChange={handleChange} />
          <TextArea label="Objectifs stratégiques" name="goals" value={form.goals} onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2 bg-[#001F3F] text-white font-bold rounded hover:bg-blue-800 transition"
          >
            {loading ? 'Soumission...' : 'Générer le rapport'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

        <div className="text-center mt-6">
          <Link href="/en/reform" className="text-blue-600 text-sm underline">English</Link>
        </div>
      </div>
    </div>
  );
}

// Styled reusable components
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
        <option value="">-- Sélectionner --</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
