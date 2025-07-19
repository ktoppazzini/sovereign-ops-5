// force redeploy

/* jshint esversion: 6, node: true */

import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
const table = base(process.env.AIRTABLE_TABLE_NAME)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, method, result } = req.body

    if (!email || !method || !result) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    await table.create([
      {
        fields: {
          Email: email,
          Method: method,
          Result: result
        }
      }
    ])

    return res.status(200).json({ message: 'Login attempt logged successfully' })
  } catch (err) {
    console.error('Error logging attempt:', err)
    return res.status(500).json({ error: 'Logging failed' })
  }
}


