import Airtable from 'airtable'
import twilio from 'twilio'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app66DTFvdxGQKy4I')
const table = base('Users')

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body

  try {
    const records = await table.select({ filterByFormula: `{Email} = '${email}'` }).firstPage()

    if (!records.length) return res.status(401).json({ error: 'Invalid email' })

    const user = records[0]
    const fields = user.fields

    if (fields.Password !== password) return res.status(401).json({ error: 'Incorrect password' })

    // Generate 6-digit MFA code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Save it temporarily in 'MFA Temp' field
    await table.update(user.id, { 'MFA Temp': code })

    // Send via SMS if selected
    if (fields['MFA Code'] === 'SMS') {
      const to = fields['Phone number']
      await twilioClient.messages.create({
        body: `Your Sovereign OPS login code is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      })
    }

    return res.status(200).json({ message: 'MFA code sent', role: fields.Role })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}


