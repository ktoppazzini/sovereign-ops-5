// pages/api/login.js
import Airtable from 'airtable'
import twilio from 'twilio'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app66DTFvdxGQKy4I')
const table = base('Users')

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  try {
    const records = await table.select({
      filterByFormula: `{Email} = '${email}'`
    }).firstPage()

    if (!records.length) return res.status(401).json({ error: 'Invalid email' })

    const user = records[0]
    const fields = user.fields

    if (fields.Password !== password) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString()

    await table.update(user.id, { 'MFA Temp': mfaCode })

    if (fields['MFA Code'] === 'SMS') {
      await twilioClient.messages.create({
        body: `Your Sovereign OPS login code is: ${mfaCode}`,
        from: process.env.TWILIO_PHONE,
        to: fields['Phone number']
      })
    }

    return res.status(200).json({ message: 'MFA sent' })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

