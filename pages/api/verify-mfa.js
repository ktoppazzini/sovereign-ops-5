export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, mfaCode } = req.body;

  console.log("📨 Incoming MFA verify:", { email, mfaCode });

  if (!email || !mfaCode || email.trim() === "" || mfaCode.trim() === "") {
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
      console.error("❌ User not found for MFA");
      await logAttempt(logTable, baseId, airtableApiKey, email, false, "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const record = userData.records[0];
    const fields = record.fields;
    const storedMfaCode = fields["MFA Code"];

    console.log(`🧾 Stored MFA: ${storedMfaCode}, Submitted: ${mfaCode}`);

    if (!storedMfaCode || storedMfaCode !== mfaCode) {
      console.warn("❌ Invalid MFA code");
      await logAttempt(logTable, baseId, airtableApiKey, email, false, "MFA code mismatch");
      return res.status(401).json({ error: "Invalid MFA code" });
    }

    const updateRes = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`, {
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

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error("⚠️ MFA update failed:", errText);
      return res.status(500).json({ error: "Failed to update MFA status" });
    }

    await logAttempt(logTable, baseId, airtableApiKey, email, true, "MFA verified");
    return res.status(200).json({ message: "MFA verified successfully" });

  } catch (err) {
    console.error("🔥 MFA verification error:", err);
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
    const logRes = await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!logRes.ok) {
      const err = await logRes.text();
      console.warn(`⚠️ MFA Log failed: ${err}`);
    } else {
      console.log(`📝 MFA attempt logged for ${email}`);
    }
  } catch (err) {
    console.warn(`⚠️ MFA log error: ${err.message}`);
  }
}
