export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Company Sizes';

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();
    const sizes = data.records.map(record => record.fields['Size Label']); // ✅ Correct field

    res.status(200).json({ options: sizes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch company sizes' });
  }
}
