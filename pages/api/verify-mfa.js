import nodemailer from 'nodemailer';
import twilio from 'twilio';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      console.log("[❌] Invalid method:", req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;
    console.log("[📥] Incoming MFA request for:", email);

    if (!email) {
      console.log("[⚠️] Missing email");
      return res.status(400).json({ error: 'Missing email' });
    }

    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = 'Users';

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const record = data.records?.[0];

    if (!record) {
      console.log("[❌] User not found:", email);
      return res.status(404).json({ error: 'User not found' });
    }

    const userFields = record.fields;
    const deliveryMethod = userFields['MFA Code'] || 'email';
    const userPhone = userFields['Phone number']?.toString().replace(/\D/g, '');
    const formattedPhone = `+1${userPhone}`;

    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Update Airtable with code and timestamp
    await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          "Last MFA Code": mfaCode,
          "Code Timestamp": new Date().toISOString(),
        },
      }),
    });

    // ✅ Send via SMS if selected
    if (deliveryMethod === 'SMS' && userPhone) {
      try {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

        const sms = await client.messages.create({
          body: `Your Sovereign OPS login code is: ${mfaCode}`,
          from: process.env.TWILIO_PHONE,
          to: formattedPhone,
        });

        console.log("[📲] SMS sent:", sms.sid);
        return res.status(200).json({ message: 'Check your texts for the verification code.' });
      } catch (err) {
        console.error("[❌ SMS Error]", err);
        return res.status(500).json({ error: 'Failed to send SMS' });
      }
    }

    // ✅ Fallback to email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Sovereign OPS Verification Code',
      text: `Your code is: ${mfaCode}`,
    });

    console.log("[📧] Email sent to:", email);
    return res.status(200).json({ message: 'Check your email for the verification code.' });

  } catch (err) {
    console.error("[🔥 CRITICAL ERROR in verify-mfa.js]", err);
    try {
      return res.status(500).json({ error: 'Internal server error' });
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Fatal fallback error' }));
    }
  }
}
