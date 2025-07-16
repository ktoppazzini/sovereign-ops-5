export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Company Sizes';

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    console.log('-- Fetching Company Sizes...');
    console.log('API_URL:', url);
    console.log('API key present?', Boolean(apiKey));

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    console.log('🧾 Full Airtable Response:', JSON.stringify(data, null, 2));

    if (!data.records) {
      return res.status(500).json({ error: 'No records returned', raw: data });
    }

    const sizes = data.records
      .map(record => record.fields['Size Label']) // 🔍 Field must match Airtable exactly
      .filter(Boolean);

    res.status(200).json({ options: sizes });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Fetch failed', details: error.message });
  }
}

