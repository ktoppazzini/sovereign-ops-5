export default async function handler(req, res) {
  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const airtableBaseId = 'app66DTFvdxGQKy4I'; // ✅ Was missing before
  const tableName = 'Reform Requests';
  const fieldName = 'Implementation Time Frame';

  try {
    console.log('-- Fetching Implementation Time Frames...');
    const url = `https://api.airtable.com/v0/meta/bases/${airtableBaseId}/tables`;
    console.log('API_URL:', url);
    console.log('API key present?', Boolean(airtableApiKey));

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    const table = data.tables.find(t => t.name === tableName);
    const field = table?.fields.find(f => f.name === fieldName);

    if (!field || field.type !== 'singleSelect') {
      return res.status(400).json({ error: 'Implementation Time Frame not found or not single select' });
    }

    const options = field.options?.choices?.map(choice => choice.name) || [];

    res.status(200).json({ options });
  } catch (error) {
    console.error('Failed to fetch Implementation Time Frames:', error);
    res.status(500).json({ error: 'Failed to fetch Implementation Time Frames' });
  }
}
