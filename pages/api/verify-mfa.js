import bcrypt from "bcryptjs";

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
    console.log(`🔍 Looking up user by email: ${email}`);

    const userUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await userRes.json();

    if (!userData.records || userData.records.length === 0) {
      console.error(`❌ No user found: ${email}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const record = userData.records[0];
    const fields = record.fields;

    const storedHash = fields["auth_token_key"];
    if (!storedHash) {
      console.error(`❌ Missing password hash for ${email}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Missing hash");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    console.log(`🔐 Password match result for ${email}: ${isMatch}`);

    if (!isMatch) {
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await logAttempt(loginLogTable, baseId, airtableApiKey, email, true, "Login successful");
    return res.status(200).json({ message: "Login successful" });

  } catch (err) {
    console.error("🔥 Unexpected login error:", err);
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Unexpected error");
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function logAttempt(table, baseId, apiKey, email, success, notes) {
  const now = new Date().toISOString(); // ISO is safest for Airtable

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
      console.log(`📝 Login attempt logged for ${email}`);
    }
  } catch (err) {
    console.warn(`⚠️ Logging error (silent fail): ${err.message}`);
  }
}

