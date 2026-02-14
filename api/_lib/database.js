import fs from 'fs';
import { randomUUID } from 'node:crypto';

const DB_PATH = 'games.json';
// Check if running in an environment with Postgres configured
const CONNECTION_STRING = process.env.POSTGRES_URL;

// Ensure local DB exists if not using Postgres
if (!CONNECTION_STRING && !fs.existsSync(DB_PATH)) {
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

// Postgres Pool Singleton
let pool;
async function getPool() {
  if (!pool) {
    // Dynamic import to avoid crash if pg is not installed and logic not used
    const { Pool } = await import('pg');
    pool = new Pool({ 
      connectionString: CONNECTION_STRING,
      // SSL required for Vercel/Neon usually, but local might fail with it?
      // Vercel env usually includes ?sslmode=require in URL.
      // If localhost, SSL probably false.
      ssl: CONNECTION_STRING.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

export const db = {
  createGame: async (data) => {
    const id = randomUUID().split('-')[0];

    if (CONNECTION_STRING) {
      const client = await getPool();
      
      const query = `
        INSERT INTO games (
          id, p1_name, p2_name, category, 
          p1_answers, p2_answers, active_questions
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      const values = [
        id,
        data.p1Name,
        data.p2Name,
        data.category,
        data.p1Answers || {},
        data.p2Answers || {},
        data.activeQuestions || []
      ];

      await client.query(query, values);
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
    if (CONNECTION_STRING) {
      const client = await getPool();
      const res = await client.query('SELECT * FROM games WHERE id = $1', [id]);
      
      if (res.rows.length === 0) return null;
      
      const game = res.rows[0];
      return {
        id: game.id,
        p1Name: game.p1_name,
        p2Name: game.p2_name,
        category: game.category,
        // pg driver automatically parses JSONB columns to objects
        p1Answers: game.p1_answers,
        p2Answers: game.p2_answers,
        activeQuestions: game.active_questions,
        createdAt: game.created_at
      };
    } else {
      const games = getGamesLocal();
      return games[id] || null;
    }
  },

  updateGame: async (id, updates) => {
    if (CONNECTION_STRING) {
      const client = await getPool();
      
      if (updates.p1Answers) {
        await client.query(
          'UPDATE games SET p1_answers = $1, updated_at = NOW() WHERE id = $2',
          [updates.p1Answers, id]
        );
      }
      
      if (updates.p2Answers) {
        await client.query(
          'UPDATE games SET p2_answers = $1, updated_at = NOW() WHERE id = $2',
          [updates.p2Answers, id]
        );
      }
      
      // Return updated game
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
