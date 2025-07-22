// pages/fr/reform.js
import { useEffect, useState } from 'react';

export default function ReformFormFR() {
  const [options, setOptions] = useState({ countries: [], sizes: [], tiers: [], timeframes: [] });
  const [form, setForm] = useState({
    org: '', country: '', size: '', tier: '', timeframe: '', outcome: '', savings: '', goals: ''
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const res = await fetch('/api/options');
      const data = await res.json();
      setOptions(data);
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const res = await fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    alert(data.message || 'Report request sent!');
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: '2rem', fontFamily: 'Arial' }}>
      <img src="/secure.png" alt="Sovereign Ops" width="150" />
      <h2>Générateur de Rapport de Réforme</h2>

      <input name="org" placeholder="Nom de l’organisation" onChange={handleChange} />
      <select name="country" onChange={handleChange}>
        <option>-- Choisir un pays --</option>
        {options.countries.map(c => (
          <option key={c.id} value={c.name_fr}>{c.name_fr}</option>
        ))}
      </select>
      <select name="size" onChange={handleChange}>
        <option>-- Choisir taille --</option>
        {options.sizes.map(s => (
          <option key={s.id} value={s.name}>{s.name}</option>
        ))}
      </select>
      <select name="tier" onChange={handleChange}>
        <option>-- Choisir un forfait --</option>
        {options.tiers.map(t => (
          <option key={t.id} value={t.name}>{t.name}</option>
        ))}
      </select>
      <select name="timeframe" onChange={handleChange}>
        <option>-- Délai --</option>
        {options.timeframes.map(tf => (
          <option key={tf.id} value={tf.name_fr}>{tf.name_fr}</option>
        ))}
      </select>
      <textarea name="outcome" placeholder="Résultat désiré" onChange={handleChange} />
      <input name="savings" placeholder="Objectif d’économies" onChange={handleChange} />
      <textarea name="goals" placeholder="Objectifs stratégiques" onChange={handleChange} />
      <button onClick={handleSubmit} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        Générer le rapport
      </button>
    </div>
  );
}
