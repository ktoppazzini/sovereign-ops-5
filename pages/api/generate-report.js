// pages/api/generate-report.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { MAKE_WEBHOOK_URL } = process.env;

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();
    return res.status(200).json({ message: "Report generation started", result });
  } catch (err) {
    console.error("Report generation error:", err);
    return res.status(500).json({ error: "Failed to generate report." });
  }
}

}
