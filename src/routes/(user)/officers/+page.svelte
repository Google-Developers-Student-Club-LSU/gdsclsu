<script lang="ts">
  import OfficerImage from '$lib/components/officerImage.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let { data }: { data: PageData } = $props();

  function getImage(name: string) {
    const person = name.split(' ')[0]?.toLowerCase() ?? '';
    return `/${person}.webp`;
  }

  gsap.registerPlugin(ScrollTrigger);

  onMount(() => {
    gsap.fromTo('.hero-element',
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
    );

    gsap.fromTo('.officer-card',
      { autoAlpha: 0, y: 50 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '.officer-grid',
          start: "top 80%",
        }
      }
    );
  });
</script>

<div class="relative min-h-screen pt-32 pb-24 px-6 overflow-hidden">
  
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-b from-[#9f86ff]/10 to-transparent blur-3xl -z-10 pointer-events-none"></div>

  <div class="w-full max-w-4xl mx-auto text-center mb-10 relative z-10">
    <h1 class="hero-element text-5xl md:text-7xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
      Meet the <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#9f86ff] to-[#3b82f6]">Minds</span> Behind GDSC
    </h1>
    <p class="hero-element text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
      Get to know the dedicated team of developers, designers, and community builders driving our mission forward.
    </p>
  </div>

  <div class="officer-grid w-full max-w-7xl mx-auto relative z-10">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 justify-items-center">
      {#each data.officers as officer}
        <div class="officer-card w-full max-w-sm">
          <div class="w-full h-full transform transition-transform duration-300 hover:-translate-y-2">
            <OfficerImage
              image={getImage(officer.name)}
              name={officer.name}
              role={officer.position}
              description={officer.description}
            />
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>