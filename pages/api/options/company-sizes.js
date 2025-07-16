export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Company Sizes';

  try {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableName}`);

    console.log('-- Fetching Company Sizes...');
    console.log('API_URL:', url.toString());
    console.log('API key present?', Boolean(apiKey));

console.log('🧾 Airtable response:', JSON.stringify(data, null, 2));
    

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await response.json();

    const sizes = data.records
      .map(record => record.fields['Size Label'])
      .filter(Boolean);

    res.status(200).json({ options: sizes });
  } catch (error) {
    console.error('❌ Failed to fetch company sizes:', error);
    res.status(500).json({ error: 'Failed to fetch company sizes' });
  }
}

