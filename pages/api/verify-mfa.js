export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, mfa } = req.body;

  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    const table = 'Users';

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${table}?filterByFormula={Email}="${email}"`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!data.records || data.records.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const user = data.records[0].fields;

    const validCode = user.LastSentCode?.toString().trim() === mfa.trim();
    if (!validCode) {
      return res.status(401).json({ message: 'Invalid MFA code.' });
    }

    return res.status(200).json({ role: user.Role || 'User' });

  } catch (err) {
    console.error('MFA verification error:', err);
    return res.status(500).json({ message: 'MFA verification failed.' });
  }
}

