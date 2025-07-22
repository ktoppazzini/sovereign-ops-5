export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  const fetchOptions = async (table, field) => {
    const url = `https://api.airtable.com/v0/${baseId}/${table}`;
    const headers = { Authorization: `Bearer ${apiKey}` };

    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      return data.records.map(record => record.fields[field]?.trim() || '');
    } catch (err) {
      console.error(`❌ Error loading ${table}.${field}:`, err);
      return [];
    }
  };

  try {
    const [countries, countriesFR, sizes, tiers, tiersFR, timeFrames, timeFramesFR] = await Promise.all([
      fetchOptions("Countries", "Country"),
      fetchOptions("Countries", "Country Name FR"),
      fetchOptions("Company Sizes", "Name"),
      fetchOptions("Tiers", "Tier Name"),
      fetchOptions("Tiers", "Tier Name FR"),
      fetchOptions("Time Frames", "Time Frame"),
      fetchOptions("Time Frames", "Time Frame FR"),
    ]);

    res.status(200).json({
      en: { countries, sizes, tiers, timeFrames },
      fr: { countries: countriesFR, sizes, tiers: tiersFR, timeFrames: timeFramesFR },
    });
  } catch (err) {
    console.error("🔥 Global options fetch failed:", err);
    res.status(500).json({ error: "Unable to load dropdown options" });
  }
}

