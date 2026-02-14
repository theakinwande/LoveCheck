import fs from 'fs';
import { randomUUID } from 'node:crypto';

const DB_PATH = 'games.json';
// Check if running in an environment with Postgres configured
const USE_POSTGRES = !!process.env.POSTGRES_URL;

// Ensure local DB exists if not using Postgres
if (!USE_POSTGRES && !fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

function getGamesLocal() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function saveGamesLocal(games) {
  fs.writeFileSync(DB_PATH, JSON.stringify(games, null, 2));
}

export const db = {
  createGame: async (data) => {
    const id = randomUUID().split('-')[0];

    if (USE_POSTGRES) {
      const { sql } = await import('@vercel/postgres');
      
      await sql`
        INSERT INTO games (
          id, p1_name, p2_name, category, 
          p1_answers, p2_answers, active_questions
        )
        VALUES (
          ${id}, 
          ${data.p1Name}, 
          ${data.p2Name}, 
          ${data.category}, 
          ${JSON.stringify(data.p1Answers || {})}, 
          ${JSON.stringify(data.p2Answers || {})}, 
          ${JSON.stringify(data.activeQuestions || [])}
        )
      `;
      return id;
    } else {
      const games = getGamesLocal();
      // Only check collision locally
      if (games[id]) return db.createGame(data);

      games[id] = { 
        ...data, 
        id, 
        createdAt: new Date().toISOString() 
      };
      saveGamesLocal(games);
      return id;
    }
  },

  getGame: async (id) => {
    if (USE_POSTGRES) {
      const { sql } = await import('@vercel/postgres');
      const { rows } = await sql`SELECT * FROM games WHERE id = ${id}`;
      
      if (rows.length === 0) return null;
      
      const game = rows[0];
      return {
        id: game.id,
        p1Name: game.p1_name,
        p2Name: game.p2_name,
        category: game.category,
        // pg driver usually returns parsed JSON for jsonb columns, but safety check
        p1Answers: typeof game.p1_answers === 'string' ? JSON.parse(game.p1_answers) : game.p1_answers,
        p2Answers: typeof game.p2_answers === 'string' ? JSON.parse(game.p2_answers) : game.p2_answers,
        activeQuestions: typeof game.active_questions === 'string' ? JSON.parse(game.active_questions) : game.active_questions,
        createdAt: game.created_at
      };
    } else {
      const games = getGamesLocal();
      return games[id] || null;
    }
  },

  updateGame: async (id, updates) => {
    if (USE_POSTGRES) {
      const { sql } = await import('@vercel/postgres');
      
      // Dynamic updates
      if (updates.p1Answers) {
        await sql`
          UPDATE games 
          SET p1_answers = ${JSON.stringify(updates.p1Answers)}, updated_at = NOW() 
          WHERE id = ${id}
        `;
      }
      
      if (updates.p2Answers) {
        await sql`
          UPDATE games 
          SET p2_answers = ${JSON.stringify(updates.p2Answers)}, updated_at = NOW() 
          WHERE id = ${id}
        `;
      }
      
      // For simplicity, we return the fetch result
      return db.getGame(id);
    } else {
      const games = getGamesLocal();
      if (!games[id]) return null;
      
      games[id] = { 
        ...games[id], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      saveGamesLocal(games);
      return games[id];
    }
  }
};
