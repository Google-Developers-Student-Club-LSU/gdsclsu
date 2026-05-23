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

<div class="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-6 overflow-hidden">

  <div class="fade-container w-full max-w-4xl text-center mb-32 relative z-10">
    <h1 class="text-5xl md:text-7xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
      Bridging the gap between <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#9f86ff] to-[#3b82f6]">theory and practice.</span>
    </h1>
    <p class="text-xl md:text-2xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
      We are a university-based community group for students interested in Google developer technologies. We grow by learning together through hands-on workshops and real-world challenges that push us beyond the classroom.
    </p>
  </div>

  <div class="w-full max-w-6xl flex flex-col gap-32 relative z-10 mb-32">
    
    <div class="fade-container flex flex-col md:flex-row items-center gap-12 md:gap-20">
      <div class="flex-1 flex justify-center md:justify-start">
        <div class="w-40 h-40 md:w-56 md:h-56 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl border border-blue-200 dark:border-blue-800/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 md:w-28 md:h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <div class="flex-1 text-center md:text-left">
        <h2 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Connect</h2>
        <p class="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          Meet students interested in developer technologies at your university. All are welcome, including those with diverse backgrounds and different majors. Build a network that will support your academic and professional journey.
        </p>
      </div>
    </div>

    <div class="fade-container flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
      <div class="flex-1 flex justify-center md:justify-end">
        <div class="w-40 h-40 md:w-56 md:h-56 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-3xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl border border-green-200 dark:border-green-800/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 md:w-28 md:h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      <div class="flex-1 text-center md:text-right">
        <h2 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Learn</h2>
        <p class="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          Learn about a range of technical topics and gain new skills through hands-on workshops, events, talks, and project-building activities. Go beyond theory and master the modern tech stack in collaborative environments.
        </p>
      </div>
    </div>

    <div class="fade-container flex flex-col md:flex-row items-center gap-12 md:gap-20">
      <div class="flex-1 flex justify-center md:justify-start">
        <div class="w-40 h-40 md:w-56 md:h-56 bg-[#9f86ff]/20 text-[#9f86ff] rounded-3xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl border border-[#9f86ff]/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 md:w-28 md:h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
      <div class="flex-1 text-center md:text-left">
        <h2 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Grow</h2>
        <p class="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          Apply new learnings to build great solutions for local problems. Advance your skills, career, and network. Make a difference through tech-driven social impact and graduate with a robust portfolio.
        </p>
      </div>
    </div>

  </div>

  <div class="fade-container w-full max-w-5xl bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] p-10 md:p-16 text-center border border-slate-200 dark:border-slate-700 relative z-10">
    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">What We Do</h2>
    <p class="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
      Whether you're new to tech or an experienced builder, there's always more to explore. We host Study Jams, technical workshops, and collaborate on real-world community software projects.
    </p>
    
    <div class="flex flex-wrap justify-center gap-4">
      <span class="px-6 py-3 bg-white dark:bg-slate-700 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-600">Web Development</span>
      <span class="px-6 py-3 bg-white dark:bg-slate-700 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-600">Google Cloud</span>
      <span class="px-6 py-3 bg-white dark:bg-slate-700 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-600">UI/UX Design</span>
      <span class="px-6 py-3 bg-white dark:bg-slate-700 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-600">Community Outreach</span>
    </div>
  </div>

</div>