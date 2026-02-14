import { db } from './_lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  
  const data = req.body;
  
  if (!data) {
    return res.status(400).json({ error: 'Missing body' });
  }

  try {
    const id = await db.createGame(data);
    return res.status(200).json({ id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
