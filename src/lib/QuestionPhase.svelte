<script>
  import { fade, fly, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { createEventDispatcher } from "svelte";

  export let questions = [];
  export let categoryName = "";
  export let playerName = "Me";
  export let partnerName = "Partner";

  const dispatch = createEventDispatcher();

  let currentIndex = 0;
  let answers = {}; // { questionId: answer }
  let direction = 1; // 1 for next, -1 for prev

  $: rawQuestion = questions[currentIndex];
  $: currentQuestion = rawQuestion
    ? {
        ...rawQuestion,
        options: rawQuestion.options.map((opt) =>
          opt
            .replace(/\bMe\b/g, playerName)
            .replace(/\bPartner\b/g, partnerName),
        ),
      }
    : null;
  $: progress = (currentIndex / questions.length) * 100;

  function selectAnswer(option) {
    answers[currentQuestion.id] = option;

    // Auto advance after short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        nextQuestion();
      } else {
        finishGame();
      }
    }, 250);
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      direction = 1;
      currentIndex++;
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      direction = -1;
      currentIndex--;
    }
  }

  function finishGame() {
    dispatch("finish", { answers });
  }
</script>

<div class="w-full max-w-xl mx-auto" in:fade={{ duration: 300 }}>
  <!-- Progress -->
  <div
    class="mb-12 flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest border-b border-stone-200 dark:border-white/10 pb-4"
  >
    <span>Question {currentIndex + 1}</span>
    <span>{questions.length}</span>
  </div>

  <!-- Question Card -->
  <div class="relative min-h-[400px]">
    {#key currentIndex}
      <div
        in:fly={{
          x: 20 * direction,
          duration: 400,
          opacity: 0,
          easing: cubicOut,
        }}
        out:fly={{
          x: -20 * direction,
          duration: 300,
          opacity: 0,
          easing: cubicOut,
        }}
        class="absolute inset-0 w-full"
      >
        <div class="flex flex-col justify-between h-full">
          <div class="mb-12">
            <h3
              class="text-3xl md:text-5xl font-serif text-white leading-tight"
            >
              {currentQuestion.text}
            </h3>
          </div>

          <div class="space-y-4">
            {#each currentQuestion.options as option}
              <button
                on:click={() => selectAnswer(option)}
                class="w-full py-6 px-4 text-left border-b border-white/10 text-xl md:text-2xl transition-all font-serif italic
                {answers[currentQuestion.id] === option
                  ? 'text-rose-500 border-rose-500/50'
                  : 'text-white hover:text-rose-500 hover:border-white/40'}"
              >
                <span>{option}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/key}
  </div>
</div>
