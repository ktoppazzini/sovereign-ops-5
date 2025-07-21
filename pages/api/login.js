import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    console.warn("⚠️ Missing email or password");
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const cleanEmail = email.trim();
  const cleanPassword = password.trim();

  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = 'Users';
  const loginLogTable = 'Login Attempts';

  try {
    console.log(`🔍 Looking up user by email: ${cleanEmail}`);

    const userUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${cleanEmail}"`;

    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const userData = await userRes.json();

    if (!userData.records || userData.records.length === 0) {
      console.warn(`❌ No user found with email: ${cleanEmail}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, cleanEmail, false, "User not found");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const record = userData.records[0];
    const storedHash = record.fields["auth_token_key"];

    if (!storedHash) {
      console.warn(`❌ No password hash found for: ${cleanEmail}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, cleanEmail, false, "No stored hash");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("🔐 Comparing password...");

    const isMatch = await bcrypt.compare(cleanPassword, storedHash);

    if (!isMatch) {
      console.warn(`❌ Password mismatch for: ${cleanEmail}`);
      await logAttempt(loginLogTable, baseId, airtableApiKey, cleanEmail, false, "Password mismatch");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`✅ Login success for ${cleanEmail}`);
    await logAttempt(loginLogTable, baseId, airtableApiKey, cleanEmail, true, "Login successful");

    return res.status(200).json({ message: "Login successful" });

  } catch (err) {
    console.error("🔥 Login error:", err);
    await logAttempt(loginLogTable, baseId, airtableApiKey, cleanEmail, false, "Unhandled exception");
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function logAttempt(table, baseId, apiKey, email, success, notes) {
  try {
    await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
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
  } catch (err) {
    console.warn("⚠️ Logging error (silent):", err.message);
  }
}


