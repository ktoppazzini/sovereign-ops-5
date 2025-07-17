export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Company Sizes';

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    const sizes = data.records
      .map(record => record.fields['Size Label'])
      .filter(Boolean)
      .sort((a, b) => {
        // Extract the first number from each range string
        const parseStart = (label) => {
          const match = label.replace(/,/g, '').match(/\d+/);
          return match ? parseInt(match[0]) : 999999;
        };
        return parseStart(a) - parseStart(b);
      });

    res.status(200).json({ options: sizes });
  } catch (error) {
    console.error('❌ Failed to fetch company sizes:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}


