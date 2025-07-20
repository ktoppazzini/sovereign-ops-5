// pages/api/verify-code.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Missing email or code' });
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
      return res.status(404).json({ error: 'User not found' });
    }

    const user = data.records[0].fields;
    const storedCode = user['Last MFA Code'];

    if (!storedCode) {
      return res.status(400).json({ error: 'No MFA code stored for this user' });
    }

    if (storedCode.toString().trim() !== code.toString().trim()) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // ✅ Code matches — allow login
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ MFA verify error:", err);
    return res.status(500).json({ error: 'Server error verifying code' });
  }
}
