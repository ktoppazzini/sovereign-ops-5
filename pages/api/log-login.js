import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app66DTFvdxGQKy4I')
const table = base('Login Attempts')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, method, result, timestamp } = req.body

  try {
    await table.create({
      Email: email,
      Method: method,
      Result: result,
      Timestamp: timestamp
    })

    res.status(200).json({ message: 'Logged' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to log login attempt' })
  }
}
