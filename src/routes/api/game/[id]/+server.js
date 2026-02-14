import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';

export const GET = async ({ params }) => {
  const game = await db.getGame(params.id);
  if (!game) {
    return json({ error: 'Game not found' }, { status: 404 });
  }
  return json(game);
};

export const PATCH = async ({ params, request }) => {
  const updates = await request.json();
  const game = await db.updateGame(params.id, updates);
  
  if (!game) {
    return json({ error: 'Game not found' }, { status: 404 });
  }
  
  return json(game);
};
