export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Company Sizes';

  const sizeOrder = [
    "1–10", "11–50", "51–200", "201–500", "501–1000",
    "1,001–5,000", "5,001–10,000", "10,001–50,000",
    "50,001–100,000", "100,000+"
  ];

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
      .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

    res.status(200).json({ options: sizes });
  } catch (error) {
    console.error('❌ Failed to fetch company sizes:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}


