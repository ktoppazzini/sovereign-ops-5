console.log("🔼 Submitting Login:");
console.log("📧 Email:", email);
console.log("🔑 Password:", password);
console.log("👉 Target endpoint: /api/login"); // NOT /api/verify-mfa!



// ✅ FILE: pages/api/login.js
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let email, password;

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    email = body.email?.trim();
    password = body.password?.trim();
  } catch (err) {
    console.error("❌ JSON body parse error:", err.message);
    return res.status(400).json({ error: "Invalid request format" });
  }

  if (!email || !password) {
    console.warn("⚠️ Missing email or password", { email, password });
    return res.status(400).json({ error: "Missing email or password" });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const usersTable = "Users";
  const logTable = "Login Attempts";

  try {
    console.log(`📥 Email received: ${email}`);
    console.log(`📥 Raw password received: "${password}"`);

    const url = `https://api.airtable.com/v0/${baseId}/${usersTable}?filterByFormula={Email}="${email}"`;

    const userRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await userRes.json();

    if (!userData.records || userData.records.length === 0) {
      console.warn(`❌ No user found: ${email}`);
      await logAttempt(logTable, apiKey, baseId, email, "Fail", "Email not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userData.records[0];
    const storedHash = user.fields["auth_token_key"];

    console.log(`🔐 Stored bcrypt hash from Airtable: ${storedHash}`);
    console.log(`📏 Password length: ${password.length}`);

    const match = await bcrypt.compare(password, storedHash);
    console.log(`✅ Password match result (from Airtable): ${match}`);

    if (!match) {
      await logAttempt(logTable, apiKey, baseId, email, "Fail", "Wrong password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await logAttempt(logTable, apiKey, baseId, email, "Success", "Login success");
    return res.status(200).json({ message: "Login successful" });

  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    await logAttempt(logTable, apiKey, baseId, email, "Fail", "Unhandled error");
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ Log attempts to Airtable
async function logAttempt(table, apiKey, baseId, email, result, note) {
  try {
    const now = new Date().toISOString();

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Email: email,
          Status: result,
          Notes: note,
          Timestamp: now,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn(`⚠️ Failed to log attempt: ${text}`);
    } else {
      console.log(`📝 Login attempt logged: ${email} ${result}`);
    }
  } catch (e) {
    console.warn("⚠️ Logging error:", e.message);
  }
}

