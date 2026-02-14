<script>
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { categories } from "./questions.js";

  const dispatch = createEventDispatcher();

  let name = "";
  let partnerName = "";
  let selectedCategory = null;

  function startGame() {
    if (name && partnerName && selectedCategory) {
      dispatch("start", { name, partnerName, category: selectedCategory });
    }
  }

  function selectCategory(cat) {
    selectedCategory = cat.id;
  }
</script>

<div class="w-full max-w-lg mx-auto" in:fade={{ duration: 600 }}>
  <div class="space-y-16">
    <!-- Step 1: Names -->
    <div class="space-y-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
        <div class="space-y-4 group">
          <label
            for="name"
            class="block text-xs font-bold text-stone-400 uppercase tracking-[0.2em] group-focus-within:text-rose-500 transition-colors"
            >You</label
          >
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="Name"
            class="w-full bg-transparent border-b border-white/30 py-4 text-3xl md:text-4xl font-serif text-white placeholder:text-stone-600 focus:outline-none focus:border-rose-500 transition-all"
            autocomplete="off"
          />
        </div>

        <div class="space-y-4 group">
          <label
            for="partner"
            class="block text-xs font-bold text-stone-400 uppercase tracking-[0.2em] group-focus-within:text-rose-500 transition-colors"
            >Partner</label
          >
          <input
            id="partner"
            type="text"
            bind:value={partnerName}
            placeholder="Name"
            class="w-full bg-transparent border-b border-white/30 py-4 text-3xl md:text-4xl font-serif text-white placeholder:text-stone-600 focus:outline-none focus:border-rose-500 transition-all"
            autocomplete="off"
          />
        </div>
      </div>
    </div>

    <!-- Step 2: Minimal Category Selection -->
    <div class="space-y-6 pt-8 border-t border-white/20">
      <p class="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">
        Select Vibe
      </p>

      <div class="flex flex-wrap gap-4">
        {#each categories as cat}
          <button
            on:click={() => selectCategory(cat)}
            class="px-6 py-3 rounded-full border text-sm uppercase tracking-widest transition-all duration-300
              {selectedCategory === cat.id
              ? 'border-rose-500 bg-rose-500 text-white font-bold'
              : 'border-white/30 text-stone-300 hover:border-white hover:text-white bg-transparent'}"
          >
            {cat.name}
          </button>
        {/each}
      </div>
    </div>

    <!-- Action Button -->
    <div class="pt-12 flex justify-end">
      <button
        on:click={startGame}
        disabled={!name || !partnerName || !selectedCategory}
        class="group flex items-center gap-4 text-xl md:text-2xl font-serif italic text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity pl-8"
      >
        <span>Begin Check</span>
        <span
          class="text-rose-500 group-hover:translate-x-2 transition-transform duration-300"
          >→</span
        >
      </button>
    </div>
  </div>
</div>
