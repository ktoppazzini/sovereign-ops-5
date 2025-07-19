export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log(`🔐 Login attempt for ${email} at ${new Date().toISOString()}`);
    return res.status(200).json({ message: 'Logged successfully' });
  } catch (err) {
    console.error('Log login error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}



