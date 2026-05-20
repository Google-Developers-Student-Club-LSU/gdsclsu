<script lang="ts">
  import OfficerImage from '$lib/components/officerImage.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function getImage(name: string) {
    const person = name.split(' ')[0]?.toLowerCase() ?? '';
    return `/${person}.webp`;
  }

  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  onMount(() => {
    const containers = document.querySelectorAll('.fade-container');
    
    containers.forEach((container: Element) => {
      gsap.set(container, { autoAlpha: 0, y: 50 });
      
      gsap.to(container, {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    });
  });

</script>

<div class="fade-container relative min-h-screen flex flex-col items-center justify-center gap-20 py-16 px-5 overflow-hidden">
  <div class="text-center w-full max-w-4xl">
    <h1 class="text-4xl font-bold text-gray-800 mb-4">Meet Our Officers</h1>
    <p class="text-lg text-gray-600 mb-12">Get to know the dedicated team leading our GDSC chapter</p>
  </div>
  <div class="w-full max-w-6xl">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
      {#each data.officers as officer}
        <div class="w-full max-w-sm">
          <OfficerImage
            image={getImage(officer.name)}
            name={officer.name}
            role={officer.position}
            description={officer.description}
          />
        </div>
      {/each}
    </div>
  </div>
</div>
