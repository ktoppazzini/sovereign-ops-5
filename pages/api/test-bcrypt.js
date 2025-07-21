// ✅ FILE: pages/api/test-bcrypt.js
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  const plainPassword = "123456";

  // This is the hash you expect to match
  const storedHash = "$2a$12$zXxHOpFeCjcB2ZTD9wMfEeyROX6BQhV0iOU0/NdzNjB5oQ2oHbp0q";

  try {
    const directCompare = await bcrypt.compare(plainPassword, storedHash);

    const freshlyHashed = await bcrypt.hash(plainPassword, 12);
    const compareToSelf = await bcrypt.compare(plainPassword, freshlyHashed);

    res.status(200).json({
      plainPassword,
      storedHash,
      directCompare,
      freshlyHashed,
      compareToSelf,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
