<script>
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import CreateGame from "./lib/CreateGame.svelte";
  import QuestionPhase from "./lib/QuestionPhase.svelte";
  import RevealPhase from "./lib/RevealPhase.svelte";
  import { questions } from "./lib/questions.js";

  // Game State
  // Modes: 'home', 'create', 'answer_p1', 'share', 'answer_p2', 'reveal'
  let gameState = "home";
  let gameId = null;
  let pollInterval;

  // Data
  let p1Name = "";
  let p2Name = "";
  let category = "";
  let p1Answers = {};
  let p2Answers = {};
  let gameLink = "";
  let activeQuestions = [];

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {
      gameId = id;
      try {
        const res = await fetch(`/api/game/${id}`);
        if (!res.ok) throw new Error("Game not found");
        const data = await res.json();

        p1Name = data.p1Name;
        p2Name = data.p2Name;
        category = data.category;
        activeQuestions = data.activeQuestions || [];
        p1Answers = data.p1Answers || {};
        p2Answers = data.p2Answers || {};

        if (p2Answers && Object.keys(p2Answers).length > 0) {
          gameState = "reveal";
        } else if (p1Answers && Object.keys(p1Answers).length > 0) {
          // Assume P2 if P1 answers exist but P2 don't
          gameState = "intro_p2";
        } else {
          gameState = "home";
        }
      } catch (e) {
        console.error(e);
        gameState = "home";
      }
    }
  });

  onDestroy(() => {
    if (pollInterval) clearInterval(pollInterval);
  });

  function startCreate() {
    gameState = "create";
  }

  async function onGameCreated(event) {
    const { name, partnerName, category: selectedCat } = event.detail;
    p1Name = name;
    p2Name = partnerName;
    category = selectedCat;

    // Create Game
    const pool = questions[selectedCat] || [];
    activeQuestions = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);

    // API Call
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          p1Name,
          p2Name,
          category,
          activeQuestions,
          p1Answers: {},
          p2Answers: {},
        }),
      });
      const data = await res.json();
      gameId = data.id;
      gameState = "answer_p1";
    } catch (e) {
      console.error("Create failed", e);
    }
  }

  async function onP1Finished(event) {
    p1Answers = event.detail.answers;

    // Save P1 answers
    await fetch(`/api/game/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p1Answers }),
    });

    gameLink = `${window.location.origin}/?id=${gameId}`;
    gameState = "share";

    // Start Polling
    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/${gameId}`);
        const data = await res.json();
        if (data.p2Answers && Object.keys(data.p2Answers).length > 0) {
          p2Answers = data.p2Answers;
          gameState = "reveal";
          clearInterval(pollInterval);
        }
      } catch (e) {}
    }, 3000);
  }

  function startP2() {
    gameState = "answer_p2";
  }

  async function onP2Finished(event) {
    p2Answers = event.detail.answers;

    // Save P2 answers
    await fetch(`/api/game/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p2Answers }),
    });

    gameLink = `${window.location.origin}/?id=${gameId}`;
    gameState = "share_results";
  }

  function viewResults() {
    gameState = "reveal";
  }

  function copyLink() {
    navigator.clipboard.writeText(gameLink);
    alert("Link Copied! Send it to " + p2Name);
  }

  function resetGame() {
    gameState = "home";
    window.location.href = "/";
  }
</script>

<main
  class="min-h-screen relative flex flex-col items-center justify-center p-6 sm:p-12 font-sans overflow-hidden"
>
  <div class="relative z-10 w-full max-w-lg md:max-w-xl mx-auto">
    <!-- Minimal Header -->
    <header
      class="mb-12 md:mb-16 text-center"
      class:hidden={gameState === "reveal"}
    >
      <h1>
        <button
          on:click={resetGame}
          class="text-xl font-serif italic tracking-widest text-rose-500/80 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0"
        >
          LoveCheck.
        </button>
      </h1>
    </header>

    {#if gameState === "home"}
      <div class="text-center space-y-16" in:fade={{ duration: 800 }}>
        <div class="space-y-6">
          <h2
            class="text-6xl md:text-8xl font-serif text-white tracking-tight leading-[0.9]"
          >
            Answer<br />
            <span class="text-rose-500 italic">separately.</span>
          </h2>
          <p
            class="text-sm md:text-base text-stone-300 uppercase tracking-[0.2em] max-w-xs mx-auto pt-4 border-t border-white/20 mt-8"
          >
            The minimalist couple's audit
          </p>
        </div>

        <button
          on:click={startCreate}
          class="group flex items-center gap-4 text-xl md:text-2xl font-serif italic text-white transition-opacity pl-8 mx-auto hover:opacity-80"
        >
          <span>Begin Check</span>
          <span
            class="text-rose-500 group-hover:translate-x-2 transition-transform duration-300"
            >→</span
          >
        </button>
      </div>
    {:else if gameState === "create"}
      <CreateGame on:start={onGameCreated} />
    {:else if gameState === "answer_p1"}
      <QuestionPhase
        questions={activeQuestions}
        playerName={p1Name}
        partnerName={p2Name}
        on:finish={onP1Finished}
      />
    {:else if gameState === "share"}
      <div class="text-center space-y-12 max-w-sm mx-auto" in:fade>
        <div class="space-y-4">
          <p class="text-stone-400 uppercase tracking-widest text-xs">
            Phase One Complete
          </p>
          <h2 class="text-4xl md:text-5xl font-serif text-white">
            {p1Name}, you're done.
          </h2>
          <p class="text-lg text-white/60">Now, pass the baton to {p2Name}.</p>
        </div>

        <div class="border-t border-b border-white/10 py-8 space-y-6">
          <p
            class="text-xs text-stone-500 font-mono select-all text-center break-all opacity-50"
          >
            {gameLink}
          </p>

          <button on:click={copyLink} class="btn-editorial w-full">
            Copy Link
          </button>
        </div>
      </div>
    {:else if gameState === "intro_p2"}
      <div class="text-center space-y-12 max-w-sm mx-auto" in:fade>
        <div class="space-y-4">
          <p class="text-rose-500 uppercase tracking-widest text-xs italic">
            Incoming Request
          </p>
          <h2 class="text-4xl md:text-6xl font-serif text-white leading-tight">
            {p1Name} <br />
            <span class="text-white/60 italic text-3xl">is waiting.</span>
          </h2>
        </div>

        <button on:click={startP2} class="btn-editorial w-full">
          Accept
        </button>
      </div>
    {:else if gameState === "answer_p2"}
      <QuestionPhase
        questions={activeQuestions}
        playerName={p2Name}
        partnerName={p1Name}
        on:finish={onP2Finished}
      />
    {:else if gameState === "share_results"}
      <div class="text-center space-y-12 max-w-sm mx-auto" in:fade>
        <div class="space-y-4">
          <p class="text-stone-400 uppercase tracking-widest text-xs">
            Phase Two Complete
          </p>
          <h2 class="text-4xl md:text-5xl font-serif text-white">
            Results Ready.
          </h2>
          <p class="text-lg text-white/60">
            Send this to {p1Name} to unlock the truth.
          </p>
        </div>

        <div class="border-t border-b border-white/10 py-8 space-y-6">
          <p
            class="text-xs text-stone-500 font-mono select-all text-center break-all opacity-50"
          >
            {gameLink}
          </p>

          <button on:click={copyLink} class="btn-editorial w-full">
            Copy Link for {p1Name}
          </button>

          <button
            on:click={viewResults}
            class="text-sm uppercase tracking-widest text-stone-400 hover:text-white transition-colors pt-4 block w-full"
          >
            View Results Now
          </button>
        </div>
      </div>
    {:else if gameState === "reveal"}
      <RevealPhase
        {p1Name}
        {p2Name}
        {p1Answers}
        {p2Answers}
        questions={activeQuestions}
      />
    {/if}

    <footer
      class="mt-12 text-center text-xs text-slate-600 font-medium tracking-wide uppercase opacity-50"
    >
      © 2026 LoveCheck
    </footer>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: "Inter", sans-serif;
  }
</style>
