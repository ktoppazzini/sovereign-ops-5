import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    console.warn("⚠️ Missing email or password");
    return res.status(400).json({ error: "Missing email or password" });
  }

  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Users";
  const loginLogTable = "Login Attempts";

  try {
    const userUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    console.log(`🔍 Fetching user: ${userUrl}`);

    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await userRes.json();
    if (!userData.records || userData.records.length === 0) {
      console.error(`❌ User not found: ${email}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const record = userData.records[0];
    const fields = record.fields;

    const storedHash = fields["auth_token_key"];
    if (!storedHash) {
      console.error("❌ Missing password hash");
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Missing hash");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    console.log(`🔐 Password match result: ${isMatch}`);

    if (!isMatch) {
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const mfaVerified = fields["MFA Verified"];
    console.log(`🧾 MFA Verified status for ${email}: ${mfaVerified}`);

    if (!mfaVerified) {
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "MFA not verified");
      return res.status(403).json({ error: "MFA not verified" });
    }

    await logAttempt(loginLogTable, baseId, airtableApiKey, email, true, "Login successful");
    return res.status(200).json({ message: "Login successful" });

  } catch (err) {
    console.error("🔥 Login error:", err);
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Unexpected error");
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
      console.warn("⚠️ Log error:", err);
    } else {
      console.log(`📝 Login attempt logged: ${email}`);
    }
  } catch (err) {
    console.warn(`⚠️ Logging error (silent fail): ${err.message}`);
  }
}

