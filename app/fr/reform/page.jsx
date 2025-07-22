'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReformFormFR() {
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
          countries: data.countries?.map(c => c.nameFr || c.name) || [],
          sizes: data.sizes?.map(s => s.nameFr || s.name) || [],
          tiers: data.tiers?.map(t => t.nameFr || t.name) || [],
          timeFrames: data.timeframes?.map(tf => tf.nameFr || tf.name) || [],
        });
      })
      .catch(err => {
        console.error('Erreur chargement champs:', err);
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
        setMessage('✅ Rapport généré avec succès.');
      } else {
        setMessage(result.error || '❌ Une erreur est survenue.');
      }
    } catch {
      setMessage('❌ Erreur lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6"

