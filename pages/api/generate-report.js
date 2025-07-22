export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const MAKE_URL = process.env.MAKE_WEBHOOK_URL;
  if (!MAKE_URL) return res.status(500).json({ error: 'Make webhook not configured' });

  try {
    const response = await fetch(MAKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const result = await response.json();
    res.status(200).json({ message: 'Report submitted', result });
  } catch (err) {
    console.error('Error sending to Make:', err);
    res.status(500).json({ error: 'Failed to trigger report' });
  }
}
