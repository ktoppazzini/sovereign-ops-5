export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Implementation Timeframes';

  const lang = req.headers['accept-language']?.startsWith('fr') ? 'fr' : 'en';
  const fieldName = lang === 'fr' ? 'Time Frame FR' : 'Time Frame';

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    console.log('🧾 Airtable Raw Response:', JSON.stringify(data, null, 2)); // 🔍 LOG THIS

    if (!data.records) {
      return res.status(500).json({ error: 'Missing records', airtable: data });
    }

    const timeframes = data.records
      .map(record => record.fields[fieldName])
      .filter(Boolean);

    res.status(200).json({ options: timeframes });
  } catch (error) {
    console.error('❌ Failed to fetch timeframes:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
