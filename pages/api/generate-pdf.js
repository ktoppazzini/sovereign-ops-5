export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reportHtml } = req.body;

  if (!reportHtml) {
    return res.status(400).json({ error: 'Missing reportHtml in request body' });
  }

  const pdfshiftApiKey = process.env.PDFSHIFT_API_KEY;

  if (!pdfshiftApiKey) {
    return res.status(500).json({ error: 'Missing PDFShift API Key in environment' });
  }

  try {
    const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/html', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(pdfshiftApiKey + ':').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: reportHtml,
        sandbox: false,
        landscape: false,
        margin: {
          top: "1in",
          right: "1in",
          bottom: "1in",
          left: "1in"
        },
        use_print: true
      })
    });

    if (!pdfResponse.ok) {
      const errorDetails = await pdfResponse.text();
      return res.status(500).json({ error: 'PDF generation failed', details: errorDetails });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Reform_Report.pdf"');
    res.status(200).send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('❌ PDF generation error:', err);
    res.status(500).json({ error: 'Server error during PDF generation', details: err.message });
  }
}
