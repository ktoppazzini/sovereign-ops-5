export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app66DTFvdxGQKy4I';
  const tableName = 'Countries';

  let countries = [];
  let offset = null;

  try {
    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableName}`);
      if (offset) url.searchParams.append('offset', offset);

      console.log('-- Fetching Countries...');
      console.log('API_URL:', url.toString());
      console.log('API key present?', Boolean(apiKey));

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const data = await response.json();

      const newCountries = data.records
        .map(record => record.fields['Country'])
        .filter(Boolean);

      countries = countries.concat(newCountries);
      offset = data.offset;
    } while (offset);

    res.status(200).json({ options: countries });
  } catch (error) {
    console.error('❌ Failed to fetch countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
}
