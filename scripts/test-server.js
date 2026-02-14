const BASE = 'http://localhost:3000';

async function run() {
  try {
    console.log("1. Creating Game...");
    const res1 = await fetch(`${BASE}/api/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          p1Name: 'TestA', 
          p2Name: 'TestB', 
          category: 'debug',
          activeQuestions: [],
          p1Answers: {}, 
          p2Answers: {}
        })
    });
    
    if (!res1.ok) {
      const err = await res1.text();
      console.error("Create Failed:", res1.status, err);
      return;
    }
    
    const { id } = await res1.json();
    console.log("✅ Created ID:", id);

    // 2. Patch
    console.log(`2. Patching Game ${id}...`);
    const res2 = await fetch(`${BASE}/api/game/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ p1Answers: { q1: 'test' } })
    });
    
    if (!res2.ok) {
      const err = await res2.text();
      console.error("❌ Patch Failed:", res2.status, err);
      return;
    }
    console.log("✅ Patched.");

    // 3. Get
    console.log(`3. Getting Game ${id}...`);
    const res3 = await fetch(`${BASE}/api/game/${id}`);
    
    if (!res3.ok) {
        const err = await res3.text();
        console.error("❌ Get Failed:", res3.status, err);
        return;
    }
    
    const game = await res3.json();
    console.log("✅ Got Game P1 Answers:", game.p1Answers);
    
  } catch (e) {
    console.error("Script Error:", e);
  }
}

run();
