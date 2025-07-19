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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password, mfa } = req.body

  try {
    const records = await table.select({ filterByFormula: `{Email} = '${email}'` }).firstPage()

    if (records.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = records[0]
    const fields = user.fields

    if (fields.Password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const mfaMethod = fields['MFA Code']
    const phone = fields['Phone number']
    const userId = user.id

    // MFA check
    if (!mfa) {
      // Generate MFA Code
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Save to user record (temporary)
      await table.update(userId, { 'MFA Temp': code })

      // Send SMS
      if (mfaMethod === 'SMS' && phone) {
        await twilioClient.messages.create({
          body: `Your Sovereign OPS login code is: ${code}`,
          to: phone,
          from: process.env.TWILIO_PHONE
        })
      }

      return res.status(200).json({ message: 'MFA code sent' })
    }

    // If MFA code is present, validate it
    const expected = fields['MFA Temp']
    if (!expected || mfa !== expected) {
      return res.status(401).json({ error: 'Invalid MFA code' })
    }

    // Optionally clear MFA Temp field
    await table.update(userId, { 'MFA Temp': '' })

    // Return session payload
    return res.status(200).json({
      email,
      name: fields.Name || '',
      region: fields.Region || '',
      role: fields.Role || 'User'
    })

  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error. Please try again.' })
  }
}

