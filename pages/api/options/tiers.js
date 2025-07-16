export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4l'; // Confirm or update if needed
  const tableName = 'Tiers';

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();
    const tiers = data.records.map((record) => record.fields.Name);
    res.status(200).json({ options: tiers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tiers' });
  }
}

