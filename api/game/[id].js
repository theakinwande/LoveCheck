import { db } from '../_lib/database.js';

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (req.method === 'GET') {
      const game = await db.getGame(id);
      if (!game) return res.status(404).json({ error: 'Game not found' });
      return res.status(200).json(game);
    } 
    
    if (req.method === 'PATCH' || req.method === 'POST') {
      const updates = req.body;
      const game = await db.updateGame(id, updates);
      if (!game) return res.status(404).json({ error: 'Game not found' });
      return res.status(200).json(game);
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e) {
    console.error("API Error:", e);
    return res.status(500).json({ error: e.message, stack: e.toString() });
  }
}
