import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.warn("❌ Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    console.warn("⚠️ Missing email or password:", { email, password });
    return res.status(400).json({ error: "Missing email or password" });
  }

  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Users";
  const loginLogTable = "Login Attempts";

  try {
    console.log(`🔍 Fetching user from Airtable: ${email}`);

    const userUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await userRes.json();
    console.log("📄 Airtable response:", userData);

    if (!userData.records || userData.records.length === 0) {
      console.warn(`❌ User not found for email: ${email}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userRecord = userData.records[0];
    const userFields = userRecord.fields;

    const storedHash = userFields["auth_token_key"];
    console.log("🔑 Stored hash:", storedHash);

    if (!storedHash || typeof storedHash !== "string" || storedHash.length < 20) {
      console.error("🚫 Invalid or missing password hash");
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Missing/invalid hash");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    console.log("🔐 Password match result:", isMatch);

    if (!isMatch) {
      console.warn(`❌ Password mismatch for ${email}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`✅ Password verified for ${email}`);
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, true, "Login successful");

    return res.status(200).json({ message: "Login successful" });

  } catch (err) {
    console.error("🔥 Unexpected login error:", err);
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, `Unhandled error: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Log attempts to Airtable login tracker
async function logAttempt(table, baseId, apiKey, email, success, notes) {
  try {
    const log = await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Email: email,
          Status: success ? "Success" : "Fail",
          Notes: notes,
          Timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!log.ok) {
      const text = await log.text();
      console.warn("⚠️ Logging failed:", text);
    } else {
      console.log("📝 Login attempt logged:", email, success ? "✅" : "❌");
    }
  } catch (err) {
    console.warn("⚠️ Silent log error:", err.message);
  }
}


