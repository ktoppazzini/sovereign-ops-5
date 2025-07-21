// pages/api/fix-password.js
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = "Users";

  const plainPassword = "123456";
  const email = "ktoppazzini@tlleanmanagement.com";
  const hash = await bcrypt.hash(plainPassword, 12);

  const url = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula={Email}="${email}"`;

  const userRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${airtableApiKey}`,
      "Content-Type": "application/json",
    },
  });

  const userData = await userRes.json();
  const recordId = userData.records[0]?.id;

  if (!recordId) {
    return res.status(404).json({ error: "User not found" });
  }

  // 🔧 Update Airtable with clean hash
  const patchRes = await fetch(
    `https://api.airtable.com/v0/${baseId}/${table}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          auth_token_key: hash,
        },
      }),
    }
  );

  const result = await patchRes.json();
  return res.status(200).json({
    success: true,
    newHash: hash,
    updatedRecord: result,
  });
}
