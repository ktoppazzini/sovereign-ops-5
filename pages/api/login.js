import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  console.log("📥 Email received:", email);
  console.log("📥 Password received:", `"${password}"`);

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Users";
  const loginLogTable = "Login Attempts";

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
      console.warn("❌ User not found:", email);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, "Fail", "User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const record = userData.records[0];
    const storedHash = record.fields["auth_token_key"];

    console.log("🔐 Stored bcrypt hash:", storedHash);

    if (!storedHash) {
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, "Fail", "Missing hash");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    console.log("✅ Password match result (from Airtable):", isMatch);

    // Compare to known-good hash
    const referenceHash = "$2a$12$FjIrrA.CfVwQgJNRBzy6x.6qB0BiAdcD5EJcZXp2ySr5C2RIwq/Ie";
    const refMatch = await bcrypt.compare(password, referenceHash);
    console.log("🧪 Match vs known-good '123456':", refMatch);

    if (!isMatch) {
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, "Fail", "Password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Password OK — ready for MFA or dashboard
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, "Success", "Login success");
    return res.status(200).json({ message: "Login successful" });

  } catch (err) {
    console.error("🔥 Login error:", err);
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, "Fail", `Unhandled error: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function logAttempt(table, baseId, apiKey, email, status, notes) {
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Email: email,
          Status: status,
          Notes: notes,
          Timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("⚠️ Failed to log login attempt:", text);
    } else {
      console.log("📝 Login attempt logged:", email, status);
    }
  } catch (e) {
    console.warn("⚠️ Silent logging error:", e.message);
  }
}


