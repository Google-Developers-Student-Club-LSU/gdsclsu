<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import GDSCSponsorship from "$lib/assets/GDSCSponsorship.pdf";

  gsap.registerPlugin(ScrollTrigger);

  function downloadBooklet(): void {
    const link = document.createElement('a');
    link.href = GDSCSponsorship;
    link.download = 'sponsorship-booklet.pdf';
    link.click();
  }

  function handleContactSubmit(e: SubmitEvent) {
    // come back to this when the firebase project gets upgraded.
    e.preventDefault();
    alert("Thanks for reaching out! We'll be in touch soon.");
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
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });
  });
</script>

<div class="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-6 overflow-hidden">
  
  <div class="fade-container w-full max-w-4xl text-center mb-12 relative z-10">
    <h1 class="text-5xl md:text-7xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#9f86ff] to-[#3b82f6]">Empower the Next</span> Generation.
    </h1>
    <p class="text-xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
      We appreciate your consideration in becoming a sponsor. Review our comprehensive partnership booklet below to see how we can grow together.
    </p>
  </div>

  <div class="fade-container flex justify-center mb-16 relative z-10">
    <button
      onclick={downloadBooklet}
      class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#9f86ff] to-[#8b6fff] text-white font-bold rounded-2xl shadow-lg hover:shadow-[#9f86ff]/30 hover:scale-105 active:scale-95 transition-all"
    >
      <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download PDF Booklet
    </button>
  </div>

  <div class="fade-container w-full max-w-5xl bg-white dark:bg-slate-800 p-2 md:p-3 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative z-10 mb-32">
    <div class="bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden relative">
      <div class="h-10 bg-slate-200 dark:bg-slate-800 flex items-center px-4 gap-2 border-b border-slate-300 dark:border-slate-700">
        <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        <div class="mx-auto text-xs font-semibold text-slate-500 dark:text-slate-400">GDSC_Sponsorship_Deck.pdf</div>
        <div class="w-12"></div>
      </div>
      <iframe
        src={GDSCSponsorship}
        class="w-full h-[600px] md:h-[800px] border-0"
        title="Sponsorship Booklet"
      ></iframe>
    </div>
  </div>

  <div class="fade-container w-full max-w-6xl relative z-10 mb-32">
    <h2 class="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">Why Partner With Us?</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <div class="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Access Top Talent</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Connect directly with passionate, driven students who are actively building real-world projects and mastering modern tech stacks.</p>
      </div>

      <div class="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Brand Visibility</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Showcase your company logo at our events, hackathons, and on our digital platforms reaching hundreds of tech enthusiasts.</p>
      </div>

      <div class="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Community Impact</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Support technical education and help us provide resources, workshops, and opportunities to the next generation of developers.</p>
      </div>

    </div>
  </div>

  <div class="fade-container w-full max-w-4xl relative z-10">
    <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 p-8 md:p-12">
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Ready to Empower the Future?</h2>
        <p class="text-slate-600 dark:text-slate-400">Leave us a message and our partnership team will get back to you shortly.</p>
      </div>

      <form onsubmit={handleContactSubmit} class="space-y-6 max-w-2xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="name" class="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input type="text" id="name" required class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-[#9f86ff] focus:border-transparent outline-none transition-all text-slate-800 dark:text-white">
          </div>
          <div class="space-y-2">
            <label for="company" class="text-sm font-semibold text-slate-700 dark:text-slate-300">Company</label>
            <input type="text" id="company" required class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-[#9f86ff] focus:border-transparent outline-none transition-all text-slate-800 dark:text-white">
          </div>
        </div>

        <div class="space-y-2">
          <label for="email" class="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" id="email" required class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-[#9f86ff] focus:border-transparent outline-none transition-all text-slate-800 dark:text-white">
        </div>

        <div class="space-y-2">
          <label for="message" class="text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
          <textarea id="message" rows="4" required class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-[#9f86ff] focus:border-transparent outline-none transition-all text-slate-800 dark:text-white resize-none"></textarea>
        </div>

        <button type="submit" class="w-full py-4 bg-[#9f86ff] hover:bg-[#8b6fff] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0">
          Send Message
        </button>
      </form>
    </div>
  </div>

</div>