export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { organization, country, size, tier, outcome, savings, goals } = req.body;

  if (!organization || !country || !tier || !outcome) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;

    const payload = {
      organization,
      country,
      size,
      tier,
      outcome,
      savings,
      goals,
    };

    const makeRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!makeRes.ok) {
      const errorText = await makeRes.text();
      console.error("❌ Make.com webhook failed:", errorText);
      return res.status(500).json({ error: 'Webhook error' });
    }

    console.log("✅ Reform report submitted to Make.com");
    return res.status(200).json({ message: 'Submitted successfully' });

  } catch (err) {
    console.error("🔥 Submission error:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
