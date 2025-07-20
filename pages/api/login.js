export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = 'Users';

    const lookupUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const response = await fetch(lookupUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const user = data.records?.[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const storedPassword = user.fields?.Password;

    if (!storedPassword || storedPassword.trim() !== password.trim()) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("[🔥 Login API error]", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
