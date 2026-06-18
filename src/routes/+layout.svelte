<script lang="ts">
    import './layout.css';
    import VerticalHeader from "$lib/components/verticalHeader.svelte";
    import HorizontalHeader from "$lib/components/horizontalHeader.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import gdscLogo from "$lib/assets/GDSC.png";
    import type { LayoutData } from './$types';
    import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
    import { getAuthInstance } from '$lib/firebase/auth';
    import Lenis from '@studio-freight/lenis';

    let { children, data }: { children: any; data: LayoutData } = $props();

    let showIntro = $state(false);
    let contentReady = $state(false);
    let lenis: Lenis | null = null;

    let mq = new MediaQuery('width < 54rem')

    onMount(() => {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
        });

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
    });
</script>

{#if showIntro}
    <div class="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-[9999] flex items-center justify-center overflow-hidden animate-fade-overlay">
        <div class="relative w-72 h-40 flex items-center justify-center animate-logo-drop">
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
    <div class="animate-content-fade-up relative z-20">
        {#if mq.current}
            <VerticalHeader />
        {/if}
        {#if !mq.current}
            <HorizontalHeader />
        {/if}
    </div>
{/if}

<div class="relative z-10 min-h-dvh flex flex-col justify-between items-center bg-transparent">
    <div class="w-full flex flex-col flex-grow">
        <main class="w-full flex-grow">
            {@render children()}
        </main>
    </div>
    <Footer/>
</div>