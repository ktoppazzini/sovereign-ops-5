// pages/api/login.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 🔐 Replace this with real authentication logic
    const isValidUser =
      email === 'ktoppazzini@tlleanmanagement.com' && password === 'your-hardcoded-password';

    if (!isValidUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✅ Successful login (you can also set cookies here if needed)
    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
