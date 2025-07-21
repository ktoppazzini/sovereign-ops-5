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
      console.error(`❌ User not found: ${email}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const record = userData.records[0];
    const fields = record.fields;

    const storedHash = fields["auth_token_key"];

    if (!storedHash) {
      console.error("❌ Password hash not found in Airtable for user:", email);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "No hash stored");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, storedHash);

    if (!isMatch) {
      console.warn(`❌ Password mismatch for user: ${email}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Wrong password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`✅ Password match for ${email}`);

    const now = new Date().toISOString();

    // PATCH Last Login back to Airtable
    const patchRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${airtableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Last Login": now,
          },
        }),
      }
    );

    if (!patchRes.ok) {
      const patchError = await patchRes.text();
      console.warn(`⚠️ Failed to update Last Login: ${patchError}`);
    }

    // Log successful login attempt
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, true, "Login success");

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("🔥 Login error:", err);
    await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Unhandled error");
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Logs login attempts to optional second Airtable table
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
      console.warn("⚠️ Failed to log login attempt:", errText);
    }
  } catch (e) {
    console.warn("⚠️ Logging failure (silent):", e.message);
  }
}

