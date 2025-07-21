export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, mfaCode } = req.body;
  if (!email || !mfaCode) {
    console.warn("⚠️ Missing email or MFA code");
    return res.status(400).json({ error: "Missing email or MFA code" });
  }

  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Users";
  const logTable = "Login Attempts";

  try {
    const userUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await userRes.json();
    if (!userData.records || userData.records.length === 0) {
      await logAttempt(logTable, baseId, airtableApiKey, email, false, "User not found during MFA");
      return res.status(404).json({ error: "User not found" });
    }

    const record = userData.records[0];
    const fields = record.fields;

    const storedCode = fields["MFA Temp"];
    const expiry = fields["mfa_code_expiry"];

    console.log(`🧾 Submitted code: ${mfaCode}`);
    console.log(`🗃️ Stored code: ${storedCode}`);
    console.log(`⏱️ Expiry: ${expiry}`);

    if (!storedCode || storedCode !== mfaCode) {
      await logAttempt(logTable, baseId, airtableApiKey, email, false, "MFA code mismatch");
      return res.status(401).json({ error: "Invalid MFA code" });
    }

    if (expiry && new Date() > new Date(expiry)) {
      await logAttempt(logTable, baseId, airtableApiKey, email, false, "MFA code expired");
      return res.status(401).json({ error: "MFA code expired" });
    }

    // ✅ Update MFA Verified to true
    await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          "MFA Verified": true,
        },
      }),
    });

    await logAttempt(logTable, baseId, airtableApiKey, email, true, "MFA verified");
    return res.status(200).json({ message: "MFA verified successfully" });

  } catch (err) {
    console.error("🔥 MFA verify error:", err);
    await logAttempt(logTable, baseId, airtableApiKey, email, false, "Unexpected MFA error");
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function logAttempt(table, baseId, apiKey, email, success, notes) {
  const now = new Date().toISOString();
  const payload = {
    fields: {
      Email: email,
      Status: success ? "Success" : "Fail",
      Notes: notes,
      Timestamp: now,
    },
  };

  try {
    await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("⚠️ Logging error (silent fail):", err.message);
  }
}

