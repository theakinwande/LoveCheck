import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Error: POSTGRES_URL environment variable is missing.");
  console.log("Usage: node --env-file=.env scripts/init-db.js");
  process.exit(1);
}

const pool = new Pool({ connectionString });

const schema = fs.readFileSync('schema.sql', 'utf8');

async function run() {
  console.log(`Connecting to database...`);
  try {
    const res = await pool.query(schema);
    console.log("Database schema applied successfully!");
    console.log("Table 'games' is ready.");
  } catch (e) {
    console.error("Failed to initialize database:", e);
  } finally {
    await pool.end();
  }
}

run();
