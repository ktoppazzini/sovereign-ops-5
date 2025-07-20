// pages/api/verify-code.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log("[❌] Invalid method:", req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;

  console.log("[📥] Incoming MFA verification");
  console.log("Email:", email);
  console.log("Code:", code);

  if (!email || !code) {
    console.log("[⚠️] Missing email or code in request body");
    return res.status(400).json({ error: 'Missing email or code' });
  }

  try {
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

    if (!data.records || data.records.length === 0) {
      console.log("[❌] No user found for:", email);
      return res.status(404).json({ error: 'User not found' });
    }

    const record = data.records[0];
    const userFields = record.fields;
    const storedCode = userFields['Last MFA Code'];
    const storedTimestamp = userFields['Code Timestamp'];

    if (!storedCode) {
      console.log("[❌] No code stored for user");
      return res.status(400).json({ error: 'No verification code stored' });
    }

    const trimmedCode = code.toString().trim();
    const trimmedStoredCode = storedCode.toString().trim();

    console.log("[🔍] Comparing codes → Submitted:", trimmedCode, "Stored:", trimmedStoredCode);

    if (trimmedCode !== trimmedStoredCode) {
      console.log("[❌] Invalid code");
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Optional: Validate that code is not older than 10 minutes
    if (storedTimestamp) {
      const sentTime = new Date(storedTimestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - sentTime) / 1000 / 60);

      if (diffMinutes > 10) {
        console.log("[⏰] Code expired:", diffMinutes, "minutes ago");
        return res.status(403).json({ error: 'Verification code expired' });
      }
    }

    // Clear the code from Airtable after success
    const clearUrl = `https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`;
    const clearResponse = await fetch(clearUrl, {
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

    const clearData = await clearResponse.json();
    console.log("[🧹] Cleared MFA code for user:", clearData.id);

    console.log("[✅] MFA code verified successfully — sending success");
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("[🔥] Server error in verify-code.js:", error);
    return res.status(500).json({ error: 'Server error verifying code' });
  }
}
