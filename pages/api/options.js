export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  const fetchTable = async (tableName) => {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      return data.records.map(rec => rec.fields.Name?.trim() || rec.fields.Label || '');
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
  };

  try {
    const [countries, sizes, tiers] = await Promise.all([
      fetchTable("Countries"),
      fetchTable("Company Sizes"),
      fetchTable("Tiers"),
    ]);

    res.status(200).json({ countries, sizes, tiers });
  } catch (error) {
    console.error("Global fetch error:", error);
    res.status(500).json({ error: "Failed to load Airtable options." });
  }
}
