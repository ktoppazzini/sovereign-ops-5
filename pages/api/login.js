import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID; // Use env var here
    const tableName = 'Users';

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const response = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      console.log("❌ No user found for:", email);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = data.records[0].fields;
    const storedHash = (user.auth_token_key || '').trim();

    console.log("👉 Comparing:", password, "WITH HASH:", JSON.stringify(storedHash));
    console.log("🔢 Hash Length:", storedHash.length);

    const match = await bcrypt.compare(password, storedHash);

    if (!match) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log("✅ Password verified");
    return res.status(200).json({ message: 'Login successful', role: user.Role || 'User' });

  } catch (err) {
    console.error("💥 Login error:", err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



