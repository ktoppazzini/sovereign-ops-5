export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  const fetchTable = async (tableName) => {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };
    const response = await fetch(url, { headers });
    const data = await response.json();
    return data.records.map(rec => rec.fields.Name || rec.fields.Label || rec.fields.Value);
  };

  try {
    const [countries, sizes, tiers] = await Promise.all([
      fetchTable('Countries'),
      fetchTable('Company Sizes'),
      fetchTable('Tiers'),
    ]);

    res.status(200).json({ countries, sizes, tiers });
  } catch (err) {
    console.error('Airtable fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch options' });
  }
}
