<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  const fullText = $derived($page.error?.message || "Oops! We couldn't find that page.");
  
  let displayedText = $state("");

  onMount(() => {
    let i = 0;
    const interval = setInterval(() => {
      displayedText = fullText.slice(0, i + 1);
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  });
</script>

<div class="fixed inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none">
  <div class="flex flex-col items-center gap-4 text-center pointer-events-auto">
    <h1 class="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c6b8ff] to-[#9f86ff]">
      {$page.status}
    </h1>
    <div class="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white h-12">
      <p>
        {displayedText}<span class="animate-pulse font-light text-[#c6b8ff]">|</span>
      </p>
    </div>
    <a href="/" class="mt-8 px-6 py-3 bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all font-semibold">
      Return Home &rarr;
    </a>
  </div>
</div>