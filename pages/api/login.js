import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID; // Should be something like: app66DTFvdxGQKy4I
    const tableId = process.env.AIRTABLE_USERS_TABLE_ID; // Should be something like: tblQv2xRDEFkD1VXr

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}?filterByFormula={Email}="${email}"`;

    const response = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      console.log("❌ No user found for:", email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = data.records[0].fields;
    const storedHash = (user.auth_token_key || '').trim();

    console.log("👉 Comparing:", password, "WITH HASH:", JSON.stringify(storedHash));
    console.log("🔢 Hash Length:", storedHash.length);

    const match = await bcrypt.compare(password, storedHash);

    if (!match) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log("✅ Password verified");
    return res.status(200).json({ error: 'Login successful', role: user.Role || 'User' });

  } catch (err) {
    console.error("💥 Login error:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

