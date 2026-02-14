<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  export let p1Name = "Player 1";
  export let p2Name = "Player 2";
  export let p1Answers = {};
  export let p2Answers = {};

  export let questions = [];

  let score = 0;
  let matches = [];
  let scoreValue = 0;

  $: currentQuestions = questions;
  $: maxScore = currentQuestions.length;

  // Reactive Calculation
  $: if (questions.length > 0 && Object.keys(p1Answers).length > 0) {
    calculateCompatibility();
  }

  onMount(() => {
    if (score > 0) {
      setTimeout(() => animateScore(), 200);
    }
  });

  // Watch score change to animate
  $: if (score > 0 && scoreValue === 0) {
    setTimeout(() => animateScore(), 200);
  }

  function calculateCompatibility() {
    let exactMatches = 0;
    matches = []; // Reset

    if (currentQuestions.length === 0) return;

    currentQuestions.forEach((q) => {
      const a1 = p1Answers[q.id];
      const a2 = p2Answers[q.id];
      if (a1 === a2) {
        exactMatches++;
        matches.push({ id: q.id, match: true, text: q.text, answer: a1 });
      } else {
        matches.push({ id: q.id, match: false, text: q.text, a1, a2 });
      }
    });

    if (maxScore > 0) {
      score = Math.round((exactMatches / maxScore) * 100);
    }
  }

  function animateScore() {
    const duration = 2000;
    const start = 0;
    const end = score;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      scoreValue = Math.floor(start + (end - start) * ease);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  function getAnalysis(s) {
    if (s === 100) return "Perfectly Synced.";
    if (s >= 80) return "Highly Compatible.";
    if (s >= 60) return "In Sync.";
    if (s >= 40) return "Different Perspectives.";
    return "Chaos.";
  }
</script>

<div class="w-full max-w-2xl mx-auto pb-20" in:fade>
  <!-- Score Display -->
  <div class="text-center py-16 border-b border-stone-200 dark:border-white/10">
    <p
      class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-4"
    >
      Compatibility Index
    </p>
    <div
      class="text-[8rem] md:text-[12rem] font-serif leading-none text-white tracking-tighter"
    >
      {scoreValue}%
    </div>
    <p
      class="text-2xl md:text-3xl font-serif text-rose-500 italic mt-4"
      in:fade={{ delay: 1000 }}
    >
      {getAnalysis(score)}
    </p>
  </div>

  <!-- Detailed Breakdown -->
  <div class="mt-12 space-y-12">
    <h3
      class="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest text-center"
    >
      The Breakdown
    </h3>

    <div class="space-y-8">
      {#each matches as item, i}
        <div
          class="border-b border-stone-200 dark:border-white/5 pb-8 last:border-0"
          in:fly={{ y: 20, delay: 500 + i * 100, duration: 600 }}
        >
          <p
            class="text-lg md:text-xl font-serif text-white mb-4 leading-relaxed"
          >
            {item.text}
          </p>

          {#if item.match}
            <div
              class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400/80 font-mono text-sm"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Match: {item.answer}</span>
            </div>
          {:else}
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div class="space-y-1">
                <span
                  class="text-xs text-stone-500 dark:text-stone-500 uppercase tracking-widest"
                  >{p1Name}</span
                >
                <p
                  class="text-rose-600 dark:text-rose-400/80 font-serif italic"
                >
                  {item.a1}
                </p>
              </div>
              <div class="space-y-1">
                <span
                  class="text-xs text-stone-500 dark:text-stone-500 uppercase tracking-widest"
                  >{p2Name}</span
                >
                <p
                  class="text-indigo-600 dark:text-indigo-400/80 font-serif italic"
                >
                  {item.a2}
                </p>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <p class="text-white/50 text-center italic">
          No breakdown available. Please start a new game.
        </p>
      {/each}
    </div>
  </div>

  <!-- Footer Actions -->
</div>
