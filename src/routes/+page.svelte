<script lang="ts">
  import gsap from "gsap";
  import { onMount } from "svelte";
  import BlobBackground from "$lib/components/BlobBackground.svelte";

  onMount(() => {
    const hasSeenIntro = sessionStorage.getItem("gdsc_intro_played");
    const animationDelay = hasSeenIntro ? 0 : 2.3;

    gsap.from(".mainCard", {
      duration: 1.8,
      opacity: 0,
      y: 40,
      scale: 0.95,
      delay: animationDelay,
      ease: "power4.out"
    });
  });
</script>
<div>
  <div class="absolute inset-0 z-0 pointer-events-none">
    <BlobBackground />
  </div>

  <div class="relative w-full min-h-[85vh] pt-32 flex items-center justify-center px-4 overflow-visible">
    
    <div class="mainCard z-10 flex flex-col gap-5 items-center justify-center
                h-[55vh] w-[85vw] max-w-5xl rounded-3xl
                bg-white/10 dark:bg-slate-900/20 
                backdrop-blur-[40px] 
                border border-white/20 dark:border-slate-700/30
                shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]
                relative">
      <p class="text-white text-2xl">
        Welcome to
      </p>
      <h1 class="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c6b8ff] to-[#9f86ff] via-white to-[#c6b8ff]
                text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight select-none
                ml-10 mr-10
                filter drop-shadow-[0_2px_10px_rgba(15,23,42,0.15)]
                dark:drop-shadow-[0_4px_20px_rgba(159,134,255,0.4)]
                animate-gradient-flow bg-[length:200%_auto] text-center">
        GDSC <br> LSU
      </h1>
    </div>
  </div>
</div>
<div class="flex flex-col items-center justify-center min-h-[90vh]">
    <h1 class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl">GeauxHack 2026</h1>
    <h2 class="text-3xl mt-5">Coming This Fall</h2>
</div>