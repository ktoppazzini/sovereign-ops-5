import bcrypt from "bcrypt";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;
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
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const record = userData.records[0];
    const fields = record.fields;
    const storedHash = fields["auth_token_key"];

    if (!storedHash) {
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Missing password hash");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      await logAttempt(loginLogTable, baseId, airtableApiKey, email, false, "Password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate MFA code and expiry
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const phoneNumber = fields["Phone number"];
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Missing phone number" });
    }

    if (!fromNumber) {
      console.error("❌ TWILIO_PHONE_NUMBER not set in environment");
      return res.status(500).json({ error: "SMS sender not configured" });
    }

    console.log(`📲 Sending SMS to ${phoneNumber} from ${fromNumber}`);

    await twilioClient.messages.create({
      body: `Your Sovereign Ops verification code is: ${verificationCode}`,
      from: fromNumber,
      to: phoneNumber,
    });

    console.log("✅ SMS sent successfully");

    // Save code and expiry in Airtable
    await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          "MFA Temp": verificationCode,
          "mfa_code_expiry": expiry,
        },
      }),
    });

    await logAttempt(loginLogTable, baseId, airtableApiKey, email, true, "MFA code sent");
    return res.status(200).json({ message: "MFA code sent" });

  } catch (err) {
    console.error("🔥 Login error:", err);
    await logAttempt(loginLogTable, baseId, process.env.AIRTABLE_API_KEY, email, false, "Unexpected login error");
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function logAttempt(table, baseId, apiKey, email, success, notes) {
  const payload = {
    fields: {
      Email: email,
      Status: success ? "Success" : "Fail",
      Notes: notes,
      Timestamp: new Date().toISOString(),
    },
  };

  try {
    await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("⚠️ Silent logging error:", err.message);
  }
}

