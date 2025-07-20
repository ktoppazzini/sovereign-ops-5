// pages/api/verify-mfa.js
import nodemailer from 'nodemailer';
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;
  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = 'Users';

  try {
    // Step 1: Get user from Airtable
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Email}="${email}"`;

    const response = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = data.records[0].fields;
    const deliveryMethod = user['MFA Code'] || 'email';
    const userPhone = user['Phone number']?.toString().replace(/\D/g, '');
    const formattedPhone = `+1${userPhone}`;

    // Generate a simple 6-digit verification code
    const generatedCode = code || Math.floor(100000 + Math.random() * 900000).toString();

    // Send via SMS
    if (deliveryMethod === 'SMS') {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

      const result = await client.messages.create({
        body: `Your Sovereign OPS verification code is: ${generatedCode}`,
        from: process.env.TWILIO_PHONE,
        to: formattedPhone,
      });

      console.log("✅ Sent via SMS", result.sid);

      return res.status(200).json({ message: 'Text sent' });
    }

    // Send via Email
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
      text: `Your code is: ${generatedCode}`,
    });

    console.log("📧 Email sent");
    return res.status(200).json({ message: 'Email sent' });

  } catch (err) {
    console.error("💥 MFA send failed", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
