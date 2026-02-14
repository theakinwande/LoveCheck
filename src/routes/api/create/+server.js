import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';

export const POST = async ({ request }) => {
  const data = await request.json();
  // Expect { p1Name, partnerName, category, activeQuestions }
  const id = await db.createGame(data);
  return json({ id });
};
