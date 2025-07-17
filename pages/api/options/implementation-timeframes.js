export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Time Frames';

  const lang = req.headers['accept-language']?.startsWith('fr') ? 'fr' : 'en';
  const fieldName = lang === 'fr' ? 'Time Frame FR' : 'Time Frame';

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?view=Grid%20view`; // Use default view
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    const timeframes = data.records
      .map(record => record.fields[fieldName])
      .filter(Boolean); // ✅ No sort — respects Airtable table order

    res.status(200).json({ options: timeframes });
  } catch (error) {
    console.error('❌ Failed to fetch time frames:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
