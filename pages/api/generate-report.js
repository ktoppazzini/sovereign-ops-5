import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    organizationName,
    country,
    companySize,
    tier,
    desiredOutcome,
    costSavingsGoal,
    strategicGoals
  } = req.body;

  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

  if (!MAKE_WEBHOOK_URL) {
    return res.status(500).json({ error: 'Make webhook URL not configured' });
  }

  try {
    const response = await axios.post(MAKE_WEBHOOK_URL, {
      organizationName,
      country,
      companySize,
      tier,
      desiredOutcome,
      costSavingsGoal,
      strategicGoals,
    });

    return res.status(200).json({ message: 'Report triggered', data: response.data });
  } catch (error) {
    console.error('❌ Error sending to Make:', error.message);
    return res.status(500).json({ error: 'Failed to trigger report' });
  }
}

