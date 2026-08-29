<script lang="ts">
  import "./layout.css";
  import VerticalHeader from "$lib/components/verticalHeader.svelte";
  import HorizontalHeader from "$lib/components/horizontalHeader.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import gdscLogo from "$lib/assets/GDSC.png";
  import type { LayoutData } from "./$types";
  import { onMount, onDestroy, tick } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { browser } from "$app/environment";
  import { MediaQuery } from "svelte/reactivity";
  import { getAuthInstance } from "$lib/firebase/auth";
  import Lenis from "lenis";
  import Snap from "lenis/snap";

  let { children }: { children: any; data: LayoutData } = $props();

  let showIntro = $state(false);
  let contentReady = $state(false);
  let lenis: Lenis | undefined = $state(undefined);
  let snap: Snap | undefined = $state(undefined);

  let unsubscribeSnapElements: (() => void)[] = [];

  let mq = $state({ current: false });
  if (browser) {
    mq = new MediaQuery("width < 54rem");
  }

  function refreshSnapPoints() {
    if (!snap) return;

    unsubscribeSnapElements.forEach((unsubscribe) => unsubscribe());
    unsubscribeSnapElements = [];

    const sections = document.querySelectorAll<HTMLElement>("main > section");
    sections.forEach((el) => {
      const unsubscribe = snap!.addElement(el, { align: ["start"] });
      unsubscribeSnapElements.push(unsubscribe);
    });
  }

  onMount(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    snap = new Snap(lenis, {
      type: "mandatory",
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      velocityThreshold: 0.6,
    });

    refreshSnapPoints();

    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    function raf(time: number) {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    getAuthInstance();

    const hasSeenIntro = sessionStorage.getItem("gdsc_intro_played");

    if (!hasSeenIntro) {
      showIntro = true;
      sessionStorage.setItem("gdsc_intro_played", "true");

      setTimeout(() => {
        showIntro = false;
      }, 2800);
      setTimeout(() => {
        contentReady = true;
      }, 2200);
    } else {
      contentReady = true;
    }

    onDestroy(() => {
      unsubscribeSnapElements.forEach((unsubscribe) => unsubscribe());
      snap?.destroy();
      lenis?.destroy();
    });
  });

  afterNavigate(async () => {
    await tick();
    lenis?.scrollTo(0, { immediate: true });
    refreshSnapPoints();
  });
</script>

{#if showIntro}
  <div
    class="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-[9999] flex items-center justify-center overflow-hidden animate-fade-overlay"
  >
    <div
      class="relative w-72 h-40 flex items-center justify-center animate-logo-drop"
    >
      <img
        src={gdscLogo}
        alt="GDG Logo Left"
        class="absolute h-32 w-48 object-contain animate-logo-left-slide"
        style="clip-path: inset(0 50% 0 0);"
      />
      <img
        src={gdscLogo}
        alt="GDG Logo Right"
        class="absolute h-32 w-48 object-contain animate-logo-right-slide"
        style="clip-path: inset(0 0 0 50%);"
      />
    </div>
  </div>
{/if}

{#if contentReady}
  {#if mq.current}
    <VerticalHeader />
  {/if}
  {#if !mq.current}
    <HorizontalHeader />
  {/if}
{/if}

<div
  class="relative z-10 min-h-dvh flex flex-col justify-between items-center bg-transparent"
>
  <div class="w-full flex flex-col grow">
    <main class="w-full grow">
      {@render children()}
    </main>
  </div>
  <Footer />
</div>
