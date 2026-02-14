import { db } from '../api/_lib/database.js';

async function test() {
  console.log("Testing DB connection and logic...");
  try {
    const id = await db.createGame({ 
      p1Name: 'TestP1', 
      p2Name: 'TestP2', 
      category: 'debug',
      activeQuestions: [],
      p1Answers: {},
      p2Answers: {}
    });
    console.log("✅ Created Game ID:", id);
    
    const g1 = await db.getGame(id);
    console.log("✅ Retrieved Game:", g1 ? "Found" : "Null");
    
    await db.updateGame(id, { p1Answers: { test: 'value' } });
    console.log("✅ Updated Game");
    
    const g2 = await db.getGame(id);
    console.log("✅ Retrieved Updated Game Answer:", g2?.p1Answers);
    
  } catch (e) {
    console.error("❌ FAIL:", e);
  }
}

test();
