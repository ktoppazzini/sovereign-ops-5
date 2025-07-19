// pages/api/log-login.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log(`🔐 Login attempt from: ${email} at ${new Date().toISOString()}`);

    // Log can also be saved to Airtable or DB here if needed

    return res.status(200).json({ message: 'Login logged successfully' });
  } catch (error) {
    console.error('Log Login Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}


