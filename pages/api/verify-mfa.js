// pages/api/verify-code.js

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      console.log("[❌] Invalid method:", req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, code } = req.body;
    console.log("[📥] Incoming MFA verification");
    console.log("Email:", email);
    console.log("Code:", code);

    if (!email || !code) {
      console.log("[⚠️] Missing email or code");
      return res.status(400).json({ error: 'Missing email or code' });
    }

    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = 'Users';

    const userLookupUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const response = await fetch(userLookupUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const record = data.records?.[0];

    if (!record) {
      console.log("[❌] No user found in Airtable");
      return res.status(404).json({ error: 'User not found' });
    }

    const userFields = record.fields;
    const storedCode = userFields['Last MFA Code'];
    const storedTimestamp = userFields['Code Timestamp'];

    if (!storedCode) {
      console.log("[❌] No stored MFA code");
      return res.status(400).json({ error: 'No verification code stored' });
    }

    if (storedCode.toString().trim() !== code.toString().trim()) {
      console.log("[❌] Code mismatch");
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Optional: code expiry
    if (storedTimestamp) {
      const now = new Date();
      const sentTime = new Date(storedTimestamp);
      const ageMinutes = Math.floor((now - sentTime) / 60000);

      if (ageMinutes > 10) {
        console.log("[⏰] Code expired");
        return res.status(403).json({ error: 'Verification code expired' });
      }
    }

    // Clear code
    await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          "Last MFA Code": "",
          "Code Timestamp": "",
        },
      }),
    });

    console.log("[✅] Code verified and cleared — sending success");
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("[🔥 ERROR in verify-code.js]", err);

    try {
      return res.status(500).json({ error: 'Internal server error' });
    } catch {
      // Fallback if res.json fails
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Fatal response error' }));
    }
  }
}

