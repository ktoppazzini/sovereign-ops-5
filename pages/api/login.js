// pages/api/log-login.js
const match = await bcrypt.compare(password, storedHash);
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // This is where you'd log the attempt — to console, file, DB, etc.
    console.log(`🔐 Login attempt for ${email} at ${new Date().toISOString()}`);

    // Respond success
    res.status(200).json({ message: 'Logged successfully' });
  } catch (error) {
    console.error('Log login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
