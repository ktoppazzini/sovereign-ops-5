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

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      console.log("[❌] User not found:", email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = data.records[0];
    const storedPassword = user.fields?.Password;

    if (!storedPassword) {
      console.log("[❌] No password stored in Airtable for user:", email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Normalize both inputs to string and trim spaces
    const inputPassword = password.toString().trim();
    const dbPassword = storedPassword.toString().trim();

    if (inputPassword !== dbPassword) {
      console.log(`[🔒] Password mismatch for ${email}`);
      console.log("Entered:", inputPassword);
      console.log("Stored:", dbPassword);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("[✅] Login verified for", email);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("[🔥] Login error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
