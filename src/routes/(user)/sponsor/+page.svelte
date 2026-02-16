<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  import GDSCSponsorship from "$lib/assets/GDSCSponsorship.pdf";

  import GridBackground from "$lib/components/GridBackground.svelte";

  function downloadBooklet(): void {
    const link = document.createElement('a');
    link.href = GDSCSponsorship;
    link.download = 'sponsorship-booklet.pdf';
    link.click();
  }

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

<div class="grid min-h-dvh place-items-center gap-10 grid-template-rows-[auto] fade-container">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Interest!</h1>
      <p class="text-lg text-gray-600">
        We appreciate your consideration in becoming a sponsor. Please review our sponsorship booklet below.
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-lg p-4 mb-8">
      <iframe
        src={GDSCSponsorship}
        class="w-250 h-200 border-0 rounded"
        title="Sponsorship Booklet"
      ></iframe>
    </div>

    <div class="text-center">
      <button
        on:click={downloadBooklet}
        class="inline-flex items-center px-6 py-3 bg-primary-color text-white font-semibold rounded-lg hover:bg-secondary-color transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Booklet
      </button>
    </div>
  </div>
</div>