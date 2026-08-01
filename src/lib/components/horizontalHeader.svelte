<script lang="ts">
  import { onMount } from "svelte";
  import gdscLogo from "$lib/assets/GDSC.png";
  import { authState } from "$lib/firebase/auth.svelte";

  let user = $derived(authState.user);
  let loading = $derived(authState.loading);
  let isOfficer = $derived(authState.isOfficer);

  let hoverProps = $state({ width: 0, left: 0, opacity: 0 });
  let navContainer: HTMLElement | undefined = $state(undefined);

  const SCROLL_HIDE_THRESHOLD = 24;

  let scrolledPastTop = $state(false);
  let hovering = $state(false);
  let focused = $state(false);
  let headerVisible = $derived(!scrolledPastTop || hovering || focused);

  function getScrollY(): number {
    const lenisInstance = (window as Window & { __lenis?: { scroll?: number } }).__lenis;
    if (typeof lenisInstance?.scroll === "number") return lenisInstance.scroll;
    return window.scrollY ?? document.documentElement.scrollTop ?? 0;
  }

  onMount(() => {
    let rafId: number;

    function pollScroll() {
      scrolledPastTop = getScrollY() > SCROLL_HIDE_THRESHOLD;
      rafId = requestAnimationFrame(pollScroll);
    }
    rafId = requestAnimationFrame(pollScroll);

    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.theme = document.body.classList.contains("dark") ? "dark" : "light";
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  function handleMouseOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && navContainer) {
          const rect = anchor.getBoundingClientRect();
          const containerRect = navContainer.getBoundingClientRect();
          
          hoverProps.width = rect.width;
          hoverProps.left = rect.left - containerRect.left;
          hoverProps.opacity = 1;
      }
  }

  function handleMouseLeave() {
      hoverProps.opacity = 0;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed top-0 left-0 w-full h-8 z-40"
  onmouseenter={() => (hovering = true)}
></div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flex items-center justify-between p-6 rounded-bl-lg rounded-br-lg w-full z-50 fixed top-0
            header-fade-in
            bg-white/10 dark:bg-slate-900/10 backdrop-blur-md 
            border-b border-white/20 dark:border-slate-800/50
            transition-transform duration-300 ease-in-out motion-reduce:transition-none"
  style="transform: translateY({headerVisible ? '0' : '-100%'});"
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  onfocusin={() => (focused = true)}
  onfocusout={() => (focused = false)}
>
            
  <a href="/" class="flex items-center gap-2 group">
    <img src={gdscLogo} alt="GDSC Logo" class="h-8 w-auto relative z-10 object-contain" /><h1 class="relative z-10 font-bold text-xl whitespace-nowrap group-hover:opacity-80 transition-opacity ml-2">
      GDSC LSU
    </h1>
  </a>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_mouse_events_have_key_events -->
  <div class="relative flex gap-2 items-center" 
      bind:this={navContainer} 
      onmouseover={handleMouseOver} 
      onmouseleave={handleMouseLeave}>
      
    <div 
      class="absolute top-0 bottom-0 bg-primary-color/20 rounded-full transition-all duration-300 ease-out pointer-events-none z-0"
      style="width: {hoverProps.width}px; transform: translateX({hoverProps.left}px); opacity: {hoverProps.opacity};"
    ></div>

    <a href="/about" class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">About</a>
    <a href="/events" class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Events</a>
    <a href="/officers" class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Officers</a>
    <a href="/leaderboard" class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Leaderboard</a>
    <a href="/sponsor" class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Sponsor</a>

    {#if !loading}
      {#if isOfficer}
        <a href="/taskboard" class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Taskboard</a>
      {/if}
      {#if !user}
        <a href="/login" class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-bold text-primary-color">Login</a>
      {/if}
    {/if}
  </div>
</div>

<style>
  .header-fade-in {
    animation: headerFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes headerFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .header-fade-in {
      animation: none;
    }
  }
</style>