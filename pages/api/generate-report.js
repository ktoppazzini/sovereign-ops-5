export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

  if (!MAKE_WEBHOOK_URL) {
    console.error('❌ Missing MAKE_WEBHOOK_URL environment variable');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  // 🛡️ Honeypot anti-bot trap
  if (req.body.website) {
    console.warn('⚠️ Bot detected via honeypot field.');
    return res.status(400).json({ error: 'Bot detected' });
  }

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error from Make:', errorText);
      return res.status(502).json({ error: 'Failed to trigger report' });
    }

    const result = await response.json();
    console.log('✅ Reform report triggered successfully.');
    return res.status(200).json({ message: 'Report submitted', result });

  } catch (err) {
    console.error('🔥 Unexpected server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
