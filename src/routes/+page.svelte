<script lang="ts">
  import gsap from "gsap";
  import { onMount } from "svelte";
  import BlobBackground from "$lib/components/BlobBackground.svelte";
  import { reveal } from "$lib/utils/reveal";

  const HACKATHON_START = new Date('2026-10-22T00:00:00-05:00');
  let now = $state(new Date());

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

    const interval = setInterval(() => {
      now = new Date();
    }, 1000);
    
    return () => clearInterval(interval);
  });

  let remainingMs = $derived(Math.max(0, HACKATHON_START.getTime() - now.getTime()));
  let days = $derived(Math.floor(remainingMs / (1000 * 60 * 60 * 24)));
  let hours = $derived(Math.floor((remainingMs / (1000 * 60 * 60)) % 24));
  let minutes = $derived(Math.floor((remainingMs / (1000 * 60)) % 60));
  let seconds = $derived(Math.floor((remainingMs / 1000) % 60));

  let countdownParts = $derived([
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds }
  ]);
</script>

<main class="relative w-full overflow-x-hidden">
  
  <div class="fixed inset-0 z-0 pointer-events-none">
    <BlobBackground />
  </div>

  <section class="flex min-h-dvh w-full flex-col items-center justify-center px-4 relative z-10">
    <div class="mainCard z-10 flex flex-col gap-4 sm:gap-5 items-center justify-center
                min-h-[50vh] sm:h-[55vh] w-[90vw] sm:w-[85vw] max-w-5xl rounded-3xl
                bg-white/10 dark:bg-slate-900/20 
                backdrop-blur-[40px] 
                border border-white/20 dark:border-slate-700/30
                shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]
                relative p-6 sm:p-0">
      <p class="text-white text-xl sm:text-2xl text-center">
        Welcome to
      </p>
      
      <h1 class="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c6b8ff] to-[#9f86ff] via-white to-[#c6b8ff]
                text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight select-none
                mx-4 sm:mx-10
                filter drop-shadow-[0_2px_10px_rgba(15,23,42,0.15)]
                dark:drop-shadow-[0_4px_20px_rgba(159,134,255,0.4)]
                animate-gradient-flow bg-[length:200%_auto] text-center leading-tight">
        GDSC <br> LSU
      </h1>
    </div>
  </section>

  <section id="countdown" class="flex h-dvh w-full flex-col items-center justify-center px-6 md:px-10 relative z-10">
    <div use:reveal class="w-full max-w-4xl bg-slate-900 dark:bg-slate-900/80 rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl flex flex-col items-center text-center backdrop-blur-xl">
      
      <h1 class="glow-amber font-display text-5xl font-bold text-amber-500 md:text-7xl">GeauxHack '26</h1>
      <p class="font-mono-retro mt-4 text-xs uppercase tracking-[0.3em] text-[#eaddcf]/70 md:text-sm">T-minus</p>

      <div class="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        {#each countdownParts as part}
          <div class="flex flex-col items-center gap-2 rounded-xl border border-amber-500/30 bg-slate-800/80 px-4 py-3 sm:px-6 sm:py-4 min-w-[80px] sm:min-w-[110px]">
            <span class="font-mono-retro glow-amber text-3xl font-bold text-amber-500 sm:text-5xl">{part.value.toString().padStart(2, '0')}</span>
            <span class="font-mono-retro text-[0.65rem] uppercase tracking-[0.25em] text-[#eaddcf]/60">{part.label}</span>
          </div>
        {/each}
      </div>
      
    </div>
  </section>

  <section id="join" class="flex h-dvh w-full flex-col items-center justify-center px-6 text-center md:px-10 relative z-10">
    <div use:reveal class="mx-auto max-w-3xl">
      <span class="inline-block py-1.5 px-4 rounded-full bg-[#9f86ff]/10 text-[#9f86ff] text-sm font-bold tracking-wider uppercase mb-6 border border-[#9f86ff]/20">
        Get Involved
      </span>
      <h2 class="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
        Build with us.
      </h2>
      <p class="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
        Whether you are a seasoned developer or just starting out, there is a place for you here. Join the community, learn new skills, and create impactful software.
      </p>
      
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="/login" class="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#9f86ff] to-[#3b82f6] text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-[#9f86ff]/25">
          Become a Member
        </a>
        <a href="/about" class="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Learn More
        </a>
      </div>
    </div>
  </section>

  <section id="socials" class="flex h-dvh w-full flex-col items-center justify-center px-6 text-center md:px-10 relative z-10">
    <div use:reveal class="mx-auto max-w-4xl">
      <h2 class="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-12">Connect with GDSC LSU</h2>
      
      <div class="flex flex-wrap justify-center gap-6 md:gap-8">
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="https://linkedin.com/company/gdsclsu/" target="_blank" rel="noopener noreferrer" class="group flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#0077b5] transition-all duration-300">
          <svg class="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-[#0077b5] transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="https://github.com/Google-Developers-Student-Club-LSU" target="_blank" rel="noopener noreferrer" class="group flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-slate-900 dark:hover:border-white transition-all duration-300">
          <svg class="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
        </a>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="https://instagram.com/gdsclsu" target="_blank" rel="noopener noreferrer" class="group flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#E1306C] transition-all duration-300">
          <svg class="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-[#E1306C] transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
          </svg>
        </a>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="https://gdg.community.dev/gdg-on-campus-louisiana-state-university/" rel="noopener noreferrer" class="group flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#4285F4] transition-all duration-300">
          <svg class="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-[#4285F4] transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </a>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="https://www.youtube.com/@dsclsu1856" rel="noopener noreferrer" class="group flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#FF0000] transition-all duration-300">
          <svg class="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-[#FF0000] transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="https://facebook.com/dsc.lsu" rel="noopener noreferrer" class="group flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#1877F2] transition-all duration-300">
          <svg class="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-[#1877F2] transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="https://tigerlink.lsu.edu/feeds?type=club&type_id=61133&tab=about" rel="noopener noreferrer" class="group flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#461D7C] transition-all duration-300 p-3">
          <img src="/lsu-tiger-logo.png" alt="LSU Tiger Logo" class="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-transform" />
        </a>
      </div>
    </div>
  </section>

</main>

<style>
  :global(.reveal) {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }

  :global(.reveal.is-visible) {
    opacity: 1;
    transform: translateY(0);
  }
</style>