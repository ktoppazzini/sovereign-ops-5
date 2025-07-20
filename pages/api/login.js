import bcrypt from 'bcryptjs';

console.log("Entered password:", password);
console.log("Stored hash:", storedHash);


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Airtable config
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_NAME = 'Users';

    // Query Airtable by email (case-insensitive)
    const filter = `LOWER({email})='${email.toLowerCase()}'`;
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}?filterByFormula=${encodeURIComponent(filter)}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();

    if (!result.records || result.records.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = result.records[0].fields;
    const storedHash = user.auth_token_key;

    // ✅ Compare submitted password with stored hash
    const match = await bcrypt.compare(password, storedHash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Success
    return res.status(200).json({ message: 'Login successful', user: { email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
}
