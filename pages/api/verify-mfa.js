import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app66DTFvdxGQKy4I')
const table = base('Users')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, mfa } = req.body

  try {
    const records = await table.select({
      filterByFormula: `{Email} = '${email}'`
    }).firstPage()

    if (!records.length) return res.status(401).json({ error: 'Invalid email' })

    const user = records[0]
    const fields = user.fields

    const storedCode = fields['MFA Temp']
    const sentAt = fields['MFA Sent At']

    if (!storedCode || storedCode !== mfa) {
      return res.status(401).json({ error: 'Incorrect MFA code' })
    }

    // Check expiration (5 minutes max)
    const now = new Date()
    const sentDate = new Date(sentAt)
    const diff = (now - sentDate) / 1000 / 60 // in minutes

    if (diff > 5) {
      return res.status(401).json({ error: 'MFA code expired. Please request a new code.' })
    }

    // Clear MFA code after success
    await table.update(user.id, {
      'MFA Temp': '',
      'MFA Sent At': ''
    })

    res.status(200).json({ message: 'Success', role: fields.Role || 'User' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error verifying MFA' })
  }
}
