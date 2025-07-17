export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'Missing HTML content' });
  }

  try {
    const response = await fetch('https://api.pdfshift.io/v3/convert/html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from('sk_418f5a1a9820cb567a095ae752d94a093d456742:').toString('base64'),
      },
      body: JSON.stringify({ source: html }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(500).json({ error: 'PDFShift failed', details: errorBody });
    }

    const pdfBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reform-report.pdf');
    res.status(200).send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    res.status(500).json({ error: 'PDF generation error', details: error.message });
  }
}

