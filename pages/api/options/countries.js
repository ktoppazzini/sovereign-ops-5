export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Countries';

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    const countries = data.records
      .map(record => record.fields['Country']) // Adjust this if your field is named differently
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({ options: countries });
  } catch (error) {
    console.error('❌ Failed to fetch countries:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}

