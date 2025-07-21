'use client';
import { useState } from 'react';
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
        setSuccess('✅ Rapport soumis avec succès.');
      } else {
        setSuccess('❌ Une erreur est survenue.');
      }
    } catch (err) {
      console.error(err);
      setSuccess('❌ Échec de l’envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '20px' }}>
      <div style={{ textAlign: 'right' }}>
        <a href="/en/reform">EN</a>
      </div>
      <h2>Générateur de Rapport de Réforme</h2>

      <label>Nom de l’organisation</label>
      <input name="organization" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }} />

      <label>Pays</label>
      <select name="country" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }}>
        <option value="">-- Choisir un pays --</option>
        <option value="Canada">Canada</option>
        <option value="États-Unis">États-Unis</option>
        <option value="France">France</option>
        <option value="Autre">Autre</option>
      </select>

      <label>Taille de l’entreprise</label>
      <select name="size" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }}>
        <option value="">-- Choisir la taille --</option>
        <option value="1–10">1–10</option>
        <option value="11–50">11–50</option>
        <option value="51–250">51–250</option>
        <option value="250+">250+</option>
      </select>

      <label>Forfait</label>
      <select name="tier" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }}>
        <option value="">-- Choisir un forfait --</option>
        <option value="Tier 1">Tier 1 – Réforme Tactique</option>
        <option value="Tier 2">Tier 2 – Stratégie Nationale</option>
        <option value="Tier 3">Tier 3 – Domination Continentale</option>
      </select>

      <label>Résultat souhaité</label>
      <textarea name="outcome" onChange={handleChange} rows="2" style={{ width: '100%', marginBottom: 10 }} />

      <label>Objectif d’économies</label>
      <input name="savings" onChange={handleChange} style={{ width: '100%', marginBottom: 10 }} />

      <label>Objectifs stratégiques</label>
      <textarea name="goals" onChange={handleChange} rows="3" style={{ width: '100%', marginBottom: 10 }} />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Génération en cours...' : 'Générer le rapport'}
      </button>

      {success && <p style={{ marginTop: 10 }}>{success}</p>}
    </div>
  );
}
