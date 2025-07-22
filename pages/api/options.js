import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  try {
    const [countries, tiers, sizes, timeframes] = await Promise.all([
      fetchTable('Countries'),
      fetchTable('Tiers'),
      fetchTable('Company Sizes'),
      fetchTable('Time Frames'),
    ]);

    res.status(200).json({ countries, tiers, sizes, timeframes });
  } catch (err) {
    console.error('❌ API error:', err);
    res.status(500).json({ error: 'Failed to load options' });
  }
}

async function fetchTable(table) {
  const records = await base(table).select().all();
  return records.map(r => ({
    id: r.id,
    name: r.fields['Name'] || r.fields['Label'] || '',
    nameFr: r.fields['Name FR'] || r.fields['Label FR'] || '',
  }));
}
