export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Tiers';

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    console.log('-- Fetching Tiers...');
    console.log('API_URL:', url);
    console.log('API key present?', Boolean(apiKey));

console.log('🧾 Airtable response:', JSON.stringify(data, null, 2));


    

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!data.records) {
      console.error('No records returned:', JSON.stringify(data));
      return res.status(500).json({ error: 'No records returned from Airtable' });
    }

    const tiers = data.records
      .map(record => record.fields['Tier Name'])
      .filter(Boolean);

    res.status(200).json({ options: tiers });
  } catch (error) {
    console.error('Failed to fetch tiers:', error);
    res.status(500).json({ error: 'Failed to fetch tiers' });
  }
}

