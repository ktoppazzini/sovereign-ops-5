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
      console.error(`❌ No user found for MFA verify: ${email}`);
      await logAttempt(logTable, baseId, airtableApiKey, email, false, "MFA user not found");
      return res.status(404).json({ error: "User not found" });
    }

    const record = userData.records[0];
    const fields = record.fields;

    const storedMfaCode = fields["MFA Code"];
    if (!storedMfaCode) {
      console.warn("⚠️ No MFA code stored");
      await logAttempt(logTable, baseId, airtableApiKey, email, false, "No stored MFA code");
      return res.status(400).json({ error: "No MFA code found for user" });
    }

    if (storedMfaCode !== mfaCode) {
      console.warn("❌ MFA code mismatch");
      await logAttempt(logTable, baseId, airtableApiKey, email, false, "MFA code mismatch");
      return res.status(401).json({ error: "Invalid MFA code" });
    }

    // ✅ Mark MFA Verified checkbox
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
      console.error("⚠️ Failed to update MFA Verified:", errText);
      return res.status(500).json({ error: "Failed to update MFA status" });
    }

    await logAttempt(logTable, baseId, airtableApiKey, email, true, "MFA verified");
    return res.status(200).json({ message: "MFA verified successfully" });

  } catch (err) {
    console.error("🔥 Unexpected MFA verification error:", err);
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
      console.warn(`⚠️ Logging failed: ${err}`);
    } else {
      console.log(`📝 MFA log saved for ${email}`);
    }
  } catch (err) {
    console.warn(`⚠️ Logging error (silent fail): ${err.message}`);
  }
}
