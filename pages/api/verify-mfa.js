import { sendEmail } from "@/utils/sendEmail"; // Replace with actual path if different
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, mfaMethod, phoneNumber, mfaCode } = req.body;

  if (!email || !mfaMethod || !mfaCode) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    let sentMessage = "";

    if (mfaMethod === "SMS") {
      if (!phoneNumber || phoneNumber === twilioPhone) {
        return res.status(400).json({ error: "Invalid phone number for SMS." });
      }

      await client.messages.create({
        body: `Your Sovereign OPS™ login code is: ${mfaCode}`,
        from: twilioPhone,
        to: `+1${phoneNumber}`,
      });

      sentMessage = "Text sent";
      console.log(`📱 MFA SMS sent to ${phoneNumber}`);
    } else {
      // Assume email if not SMS
      await sendEmail({
        to: email,
        subject: "Your Sovereign OPS™ Login Code",
        text: `Your login code is: ${mfaCode}`,
      });

      sentMessage = "Email sent";
      console.log(`📧 MFA email sent to ${email}`);
    }

    return res.status(200).json({ message: sentMessage });
  } catch (err) {
    console.error("💥 MFA Send Error:", err.message);
    return res.status(500).json({ error: "MFA delivery failed." });
  }
}


