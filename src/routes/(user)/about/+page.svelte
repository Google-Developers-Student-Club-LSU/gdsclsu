<script lang="ts">
  import { onMount } from 'svelte';
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

<div class="relative min-h-screen flex flex-col items-center justify-center gap-20 py-16 px-5 overflow-hidden">

  <div class="fade-container w-full max-w-4xl flex items-center justify-center text-center relative z-10">
    <h1 class="text-7xl md:text-9xl font-bold m-0 text-gray-900 dark:text-white">About Us</h1>
  </div>

  <div class="fade-container w-full max-w-4xl flex items-center justify-center text-center relative z-10">
    <p class="text-xl md:text-2xl leading-relaxed m-0 text-gray-800 dark:text-gray-200">
      We grow by learning together, through hands-on projects, workshops, and real world challenges that push us beyond the classroom.
    </p>
  </div>

  <div class="fade-container w-full max-w-4xl flex items-center justify-center text-center relative z-10">
    <p class="text-xl md:text-2xl leading-relaxed m-0 text-gray-800 dark:text-gray-200">
      Whether you're new to tech or an experienced builder, there's always more to explore.
    </p>
  </div>

  <div class="fade-container w-full max-w-4xl flex items-center justify-center text-center relative z-10">
    <p class="text-xl md:text-2xl leading-relaxed m-0 text-gray-800 dark:text-gray-200">
      Make a difference through tech-driven social impact initiatives. Give back to the community.
    </p>
  </div>
</div>