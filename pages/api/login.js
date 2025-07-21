import bcrypt from 'bcryptjs';

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
    const lowerEmail = email.toLowerCase();
    const filterFormula = `LOWER({Email}) = "${lowerEmail}"`;
    const userUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    console.log(`🔍 Looking up user by email: ${lowerEmail}`);
    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await userRes.json();

    if (!userData.records || userData.records.length === 0) {
      console.error(`❌ User not found: ${lowerEmail}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, lowerEmail, false, "User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const record = userData.records[0];
    const fields = record.fields;

    const storedHash = (fields["auth_token_key"] || "").trim();

    if (!storedHash) {
      console.error(`❌ No password hash found for user: ${lowerEmail}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, lowerEmail, false, "No hash stored");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, storedHash);

    if (!isMatch) {
      console.warn(`❌ Password mismatch for user: ${lowerEmail}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, lowerEmail, false, "Wrong password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`✅ Password match for ${lowerEmail}`);
    await logAttempt(loginLogTable, baseId, airtableApiKey, lowerEmail, true, "Login success");

    return res.status(200).json({ message: "Login successful" });

  } catch (err) {
    console.error("🔥 Login handler error:", err);
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Internal error");
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function to log login attempts
async function logAttempt(table, baseId, apiKey, email, success, notes) {
  try {
    const logRes = await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
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

    if (!logRes.ok) {
      const errText = await logRes.text();
      console.warn("⚠️ Logging failed:", errText);
    }
  } catch (err) {
    console.warn("⚠️ Logging crash:", err.message);
  }
}
