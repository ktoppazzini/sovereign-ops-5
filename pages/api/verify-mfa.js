import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app66DTFvdxGQKy4I')
const table = base('Users')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, mfa } = req.body

  try {
    const records = await table.select({ filterByFormula: `{Email} = '${email}'` }).firstPage()

    if (!records.length) return res.status(401).json({ error: 'Invalid email' })

    const user = records[0]
    const fields = user.fields

    if (fields['MFA Temp'] !== mfa) {
      return res.status(401).json({ error: 'Incorrect MFA code' })
    }

    // Clear MFA temp field after success
    await table.update(user.id, { 'MFA Temp': '' })

    return res.status(200).json({ message: 'Success', role: fields.Role })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
