import fs from 'fs';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const DB_PATH = 'games.json';
const CONNECTION_STRING = process.env.POSTGRES_URL;

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

let pool;
function getPool() {
  if (!pool) {
    try {
      const { Pool } = require('pg');
      pool = new Pool({ 
        connectionString: CONNECTION_STRING,
        ssl: CONNECTION_STRING.includes('localhost') ? false : { rejectUnauthorized: false }
      });
    } catch (e) {
      console.error("Failed to load 'pg' module:", e);
      throw e;
    }
  }
  return pool;
}

export const db = {
  createGame: async (data) => {
    try {
      const id = randomUUID().split('-')[0];

      if (CONNECTION_STRING) {
        const client = getPool();
        
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
          JSON.stringify(data.p1Answers || {}),
          JSON.stringify(data.p2Answers || {}),
          JSON.stringify(data.activeQuestions || [])
        ];

        await client.query(query, values);
        return id;
      } else {
        const games = getGamesLocal();
        if (games[id]) return db.createGame(data);

        games[id] = { 
          ...data, 
          id, 
          createdAt: new Date().toISOString() 
        };
        saveGamesLocal(games);
        return id;
      }
    } catch (e) {
      console.error("DB Create Error:", e);
      throw e;
    }
  },

  getGame: async (id) => {
    if (CONNECTION_STRING) {
      const client = getPool();
      const res = await client.query('SELECT * FROM games WHERE id = $1', [id]);
      
      if (res.rows.length === 0) return null;
      
      const game = res.rows[0];
      return {
        id: game.id,
        p1Name: game.p1_name,
        p2Name: game.p2_name,
        category: game.category,
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
    try {
      if (CONNECTION_STRING) {
        const client = getPool();
        
        if (updates.p1Answers) {
          await client.query(
            'UPDATE games SET p1_answers = $1 WHERE id = $2',
            [JSON.stringify(updates.p1Answers), id]
          );
        }
        
        if (updates.p2Answers) {
          await client.query(
            'UPDATE games SET p2_answers = $1 WHERE id = $2',
            [JSON.stringify(updates.p2Answers), id]
          );
        }
        
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
    } catch (e) {
      console.error("DB Update Error:", e);
      throw e;
    }
  }
};
