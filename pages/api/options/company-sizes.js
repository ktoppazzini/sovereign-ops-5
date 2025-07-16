export async function GET() {
  const airtableBaseId = 'app66DTFvdxGQKy4I'; // ✅ JUST the base ID
  const airtableApiKey = process.env.AIRTABLE_API_KEY; // ✅ Reference ENV variable
  const tableName = 'Company Sizes'; // ✅ Airtable table name

  try {
    const res = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(tableName)}`, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    const sizes = data.records.map(record => record.fields['Size Label'])

    return new Response(JSON.stringify(sizes), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch company sizes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

