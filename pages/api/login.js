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
    const records = await table.select({
      filterByFormula: `{Email} = '${email}'`
    }).firstPage()

    if (!records.length) {
      console.log('❌ No matching email:', email)
      return res.status(401).json({ error: 'Invalid email' })
    }

    const user = records[0]
    const fields = user.fields

    if (fields.Password !== password) {
      console.log('❌ Incorrect password for:', email)
      return res.status(401).json({ error: 'Incorrect password' })
    }

    if (fields['MFA Code'] === 'SMS') {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      console.log('📲 Sending MFA code:', code)

      await twilioClient.messages.create({
        body: `Your Sovereign OPS login code is: ${code}`,
        from: process.env.TWILIO_PHONE,
        to: fields['Phone number']
      })

      await table.update(user.id, { 'MFA Temp': code })
    }

    return res.status(200).json({ message: 'MFA sent' })
  } catch (err) {
    console.error('💥 Login server error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
