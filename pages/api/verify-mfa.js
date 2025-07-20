export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, code } = req.body;

    if (!email || !code) {
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
      return res.status(404).json({ error: 'User not found' });
    }

    const userFields = record.fields;
    const storedCode = userFields['Last MFA Code'];
    const storedTimestamp = userFields['Code Timestamp'];

    if (!storedCode) {
      return res.status(400).json({ error: 'No verification code stored' });
    }

    if (storedCode.toString().trim() !== code.toString().trim()) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Optional: check expiration
    if (storedTimestamp) {
      const now = new Date();
      const sentTime = new Date(storedTimestamp);
      const ageMinutes = Math.floor((now - sentTime) / 60000);
      if (ageMinutes > 10) {
        return res.status(403).json({ error: 'Verification code expired' });
      }
    }

    // Smart patch only fields that exist
    const patchFields = {};
    if ('Last MFA Code' in userFields) patchFields['Last MFA Code'] = "";
    if ('Code Timestamp' in userFields) patchFields['Code Timestamp'] = "";

    const patchRes = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: patchFields }),
    });

    const patchData = await patchRes.json();

    if (!patchRes.ok) {
      console.error("[❌ Airtable PATCH failed]", patchData);
      return res.status(500).json({ error: 'Failed to clear code in Airtable', detail: patchData });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("[🔥 ERROR in verify-code]", err);
    try {
      return res.status(500).json({ error: 'Server error verifying code' });
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Fatal response error' }));
    }
  }
}
