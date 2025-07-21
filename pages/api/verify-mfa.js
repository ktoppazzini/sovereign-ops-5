export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Missing email or code" });
  }

  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Users";

  try {
    const lowerEmail = email.toLowerCase();
    const filterFormula = `LOWER({Email}) = "${lowerEmail}"`;
    const userUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await userRes.json();

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userRecord = data.records[0];
    const fields = userRecord.fields;

    const storedCode = fields["mfa_code"];
    const expiry = fields["mfa_code_expiry"];
    const now = new Date();

    if (!storedCode) {
      return res.status(401).json({ error: "No code issued for this user." });
    }

    if (code !== storedCode) {
      return res.status(401).json({ error: "Invalid code." });
    }

    if (expiry) {
      const expiresAt = new Date(expiry);
      if (now > expiresAt) {
        return res.status(401).json({ error: "Code expired." });
      }
    }

    // Update user as verified
    const patchUrl = `https://api.airtable.com/v0/${baseId}/${tableName}/${userRecord.id}`;
    await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          mfa_verified: true,
        },
      }),
    });

    return res.status(200).json({ message: "Verification successful." });
  } catch (err) {
    console.error("🔒 MFA Verification Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
