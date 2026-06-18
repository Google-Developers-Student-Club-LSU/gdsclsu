<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import gdscLogo from "$lib/assets/GDSC.png";
  import { authState } from "$lib/firebase/auth.svelte";
  import { doc } from "firebase/firestore";
  let openNav = false;


  let user = $derived(authState.user);
  let loading = $derived(authState.loading);
  let isOfficer = $derived(authState.isOfficer);
  let isHomePage = $derived($page.url.pathname === "/");

  let hoverProps = $state({ width: 0, left: 0, opacity: 0, height: 0, top: 0});
  let navContainer: HTMLElement | undefined = $state(undefined);
  let scrollPosition = 0;

  onMount(() => {
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.theme = document.body.classList.contains("dark") ? "dark" : "light";
    });
  });

  function handleMouseOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && navContainer) {
          const rect = anchor.getBoundingClientRect();
          const containerRect = navContainer.getBoundingClientRect();
          
          hoverProps.width = rect.width;
          hoverProps.height = rect.height;
          hoverProps.left = rect.left - containerRect.left;
          hoverProps.top = rect.top - containerRect.top;
          hoverProps.opacity = 1;
      }
  }

  function handleMouseLeave() {
      hoverProps.opacity = 0;
  }

  function toggleNav() {
    const nav = document.getElementById("navButtons");
    const logoButton = document.getElementById("logoButton");
    const lenis = (window as Window & { __lenis?: { stop?: () => void; start?: () => void; scrollTo?: (to: number, options?: { immediate?: boolean }) => void } }).__lenis;

    if (nav && logoButton) {
      if (!openNav) {
        scrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
        lenis?.stop?.();
        nav.style.display = "inline";
        nav.style.height = "100vh";
        logoButton.style.transform = "rotate(360deg)";
        document.body.style.overflow = "hidden";
        document.body.style.height = "100vh";
        openNav = true;
      } else if (openNav) {
        nav.style.display = "none";
        logoButton.style.transform = "rotate(0deg)";
        document.body.style.overflow = "";
        document.body.style.height = "auto";
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPosition, behavior: "auto" });
          lenis?.scrollTo?.(scrollPosition, { immediate: true });
          lenis?.start?.();
        });
        openNav = false;
      }
    }
  }
</script>

<div class="flex items-center flex-col p-6 w-full z-50 absolute top-0
            bg-white/50 dark:bg-slate-900/10 backdrop-blur-xl 
            border-b border-white/20 dark:border-slate-800/50">
            
  <button id="logoButton" onclick={toggleNav} class="flex items-center gap-2 group justify-center w-full transition-all duration-500 ease-in-out transition-discrete">
    <img src={gdscLogo} alt="GDSC Logo" class="h-8 w-auto relative z-10 object-contain" />
  </button>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_mouse_events_have_key_events -->
  <div id="navButtons" class="relative flex flex-col gap-2 items-center transition-all duration-500 ease-in-out hidden" 
      bind:this={navContainer} 
      onmouseover={handleMouseOver} 
      onmouseleave={handleMouseLeave}>
      
    <div
      class={isHomePage
        ? "absolute top-0 bottom-0 rounded-full bg-white/50 transition-all duration-300 ease-out pointer-events-none z-0"
        : "absolute top-0 bottom-0 rounded-full bg-primary-color/20 transition-all duration-300 ease-out pointer-events-none z-0"}
      style="width: {hoverProps.width}px; transform: translateX({hoverProps.left}px) translateY({hoverProps.top}px); opacity: {hoverProps.opacity}; height: {hoverProps.height}px;"
    ></div>

    <div class="flex flex-col items-center mt-3 z-1">
      <a href="/" onclick={toggleNav} class="font-bold px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color text-xl font-bold">GDSC@LSU</a>
      {#if !loading}
        {#if !user}
          <a href="/login" onclick={toggleNav} class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-bold text-primary-color">Login</a>
        {/if}
      <a href="/about" onclick={toggleNav} class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">About</a>
      <a href="/events" onclick={toggleNav} class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Events</a>
      <a href="/officers" onclick={toggleNav} class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Officers</a>
      <a href="/leaderboard" onclick={toggleNav} class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Leaderboard</a>
      <a href="/sponsor" onclick={toggleNav} class="px-4 py-2 rounded-full relative z-10 transition-colors font-medium hover:text-primary-color">Sponsor</a>
        {#if isOfficer}
          <a href="/taskboard" onclick={toggleNav} class="px-4 py-2 rounded-full relative z-10 transition-colors hover:text-primary-color font-medium">Taskboard</a>
        {/if}
      {/if}
    </div>
  </div>
</div>