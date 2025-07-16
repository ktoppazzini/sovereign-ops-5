export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Tiers';

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

    console.log('-- Fetching Tiers...');
    console.log('API_URL:', url);
    console.log('API key present?', Boolean(apiKey));

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await response.json();
    console.log('🔍 Airtable response:', JSON.stringify(data, null, 2));

    if (!data.records || !Array.isArray(data.records)) {
      return res.status(500).json({ error: 'Invalid response from Airtable', details: data });
    }

    const tiers = data.records
      .map(record => record.fields['Tier Name']) // MUST match Airtable exactly
      .filter(Boolean);

    res.status(200).json({ options: tiers });
  } catch (error) {
    console.error('❌ Failed to fetch tiers:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
