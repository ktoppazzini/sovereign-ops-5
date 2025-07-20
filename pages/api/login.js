import bcrypt from 'bcryptjs';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  'app66DTFvdxGQKy4l' // ← Replace with your actual base ID
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  try {
    let foundUser = null;

    // Search Airtable for the user
    await base('Users')
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1,
      })
      .eachPage((records, fetchNextPage) => {
        if (records.length > 0) {
          foundUser = records[0];
        }
        fetchNextPage(); // Optional but safe
      });

    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const storedHash = foundUser.get('auth_token_key');

    console.log('Comparing:', password, 'WITH HASH:', storedHash);

    const isMatch = await bcrypt.compare(password, storedHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Success
    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



