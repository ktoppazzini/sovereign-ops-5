import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app66DTFvdxGQKy4I')
const table = base('Login Attempts')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, method, result, timestamp } = req.body

    if (!email || !method || !result || !timestamp) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    await table.create([
      {
        fields: {
          Email: email,
          Method: method,    // Must exactly match your Airtable single select options
          Result: result,    // Must exactly match your Airtable single select options
          Timestamp: timestamp
        }
      }
    ])

    res.status(200).json({ message: 'Login attempt logged' })
  } catch (err) {
    console.error('Error logging attempt:', err)
    res.status(500).json({ error: 'Logging failed' })
  }
}


