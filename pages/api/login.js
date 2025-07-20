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
    const baseId = 'app66DTFvdxGQKy4I'; // Your actual base ID
    const tableName = 'Users';

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      console.log("No matching email found:", email);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = data.records[0].fields;
    const storedHash = (user.auth_token_key || '').trim();

    console.log("Comparing password:", password);
    console.log("Stored hash:", storedHash);
    console.log("Hash length:", storedHash.length);

    const match = await bcrypt.compare(password, storedHash);

    if (!match) {
      console.log("❌ Passwords do not match");
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log("✅ Password matched");
    return res.status(200).json({ message: 'Login successful' });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



