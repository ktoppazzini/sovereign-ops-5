import twilio from "twilio";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, mfaMethod, phoneNumber, mfaCode } = req.body;

  if (!email || !mfaMethod || !mfaCode) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    let deliveryMessage = "";

    if (mfaMethod === "SMS") {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const twilioResponse = await client.messages.create({
        body: `Your Sovereign OPS™ security code is: ${mfaCode}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      console.log("✅ SMS sent:", twilioResponse.sid);
      deliveryMessage = "Text sent";

    } else if (mfaMethod === "email") {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"Sovereign OPS™ Security" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: "Your Sovereign OPS™ Security Code",
        text: `Your one-time login code is: ${mfaCode}`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent:", info.messageId);
      deliveryMessage = "Email sent";

    } else {
      return res.status(400).json({ error: "Invalid MFA method." });
    }

    return res.status(200).json({ message: deliveryMessage });

  } catch (err) {
    console.error("❌ Error sending MFA code:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}



