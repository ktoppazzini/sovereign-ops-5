// /pages/api/options/implementation-timeframes.js

export default async function handler(req, res) {
  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const tableName = 'Reform Requests'; // Or wherever the field lives
  const fieldName = 'Implementation Time Frame';

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${airtableBaseId}/tables`, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // Find the table and field
    const table = data.tables.find(t => t.name === tableName);
    const field = table?.fields.find(f => f.name === fieldName);

    if (!field || field.type !== 'singleSelect') {
      return res.status(400).json({ error: 'Implementation Time Frame not found or not single select' });
    }

    const options = field.options?.choices?.map(choice => choice.name) || [];

    res.status(200).json({ options });
  } catch (error) {
    console.error('Failed to fetch Implementation Time Frames:', error);
    res.status(500).json({ error: 'Failed to load implementation time frame options' });
  }
}
