export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Tiers';

  const lang = req.headers['accept-language']?.startsWith('fr') ? 'fr' : 'en';
  const fieldName = lang === 'fr' ? 'Tier Name FR' : 'Tier Name';

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await response.json();

    const tiers = data.records
      .map(record => record.fields[fieldName])
      .filter(Boolean)
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    res.status(200).json({ options: tiers });
  } catch (error) {
    console.error('❌ Failed to fetch tiers:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
