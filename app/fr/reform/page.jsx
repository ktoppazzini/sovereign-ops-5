'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReformFormFR() {
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

  const [options, setOptions] = useState({ countries: [], sizes: [], tiers: [] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/options')
      .then(res => res.json())
      .then(data => setOptions(data))
      .catch(err => console.error('Erreur chargement des options', err));
  }, []);

  const handleChange = e => {
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
        setSuccess('✅ Rapport soumis avec succès.');
      } else {
        setSuccess(result.error || '❌ Une erreur est survenue.');
      }
    } catch (err) {
      console.error(err);
      setSuccess('❌ Échec de l’envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <img src="/secure.png" alt="Sovereign Ops" className="h-10" />
          <a href="/en/reform" className="text-blue-600 hover:underline">EN</a>
        </div>

        <h2 className="text-xl font-bold mb-4">Générateur de Rapport de Réforme</h2>

        <label className="block mb-2 font-semibold">Nom de l’organisation</label>
        <input name="organization" onChange={handleChange} className="w-full mb-4 p-2 border rounded" />

        <label className="block mb-2 font-semibold">Pays</label>
        <select name="country" onChange={handleChange} className="w-full mb-4 p-2 border rounded">
          <option value="">-- Sélectionner --</option>
          {options.countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Taille de l’entreprise</label>
        <select name="size" onChange={handleChange} className="w-full mb-4 p-2 border rounded">
          <option value="">-- Sélectionner --</option>
          {options.sizes.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Forfait</label>
        <select name="tier" onChange={handleChange} className="w-full mb-4 p-2 border rounded">
          <option value="">-- Sélectionner --</option>
          {options.tiers.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Résultat souhaité</label>
        <textarea name="outcome" onChange={handleChange} rows={2} className="w-full mb-4 p-2 border rounded" />

        <label className="block mb-2 font-semibold">Objectif d’économies</label>
        <input name="savings" onChange={handleChange} className="w-full mb-4 p-2 border rounded" />

        <label className="block mb-2 font-semibold">Objectifs stratégiques</label>
        <textarea name="goals" onChange={handleChange} rows={3} className="w-full mb-4 p-2 border rounded" />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-900 text-white py-2 font-semibold rounded hover:bg-blue-800"
        >
          {loading ? 'Génération en cours...' : 'Générer le rapport'}
        </button>

        {success && <p className="mt-4 text-center text-green-600">{success}</p>}
      </div>
    </div>
  );
}

