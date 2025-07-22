// pages/api/options.js
export default async function handler(req, res) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;

  const endpoints = {
    countries: 'Countries',
    sizes: 'Company Sizes',
    tiers: 'Tiers',
    timeframes: 'Time Frames',
  };

  try {
    const results = await Promise.all(
      Object.entries(endpoints).map(async ([key, table]) => {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`;
        const airtableRes = await fetch(url, {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });
        const data = await airtableRes.json();
        return [key, data.records];
      })
    );

    const formatted = Object.fromEntries(results.map(([key, records]) => [
      key,
      records.map(r => ({
        id: r.id,
        name: r.fields[key === "countries" ? "Country" : key === "tiers" ? "Tier Name" : "Name"],
        name_fr: r.fields[key === "countries" ? "Country Name FR" : key === "timeframes" ? "Time Frame FR" : "Name FR"]
      }))
    ]));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching options:", err);
    res.status(500).json({ error: "Failed to fetch options." });
  }
}
