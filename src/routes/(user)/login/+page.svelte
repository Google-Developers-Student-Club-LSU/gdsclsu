<script lang="ts">
  import { onMount } from 'svelte'; 
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  import { signIn } from '$lib/firebase/auth';
  import { goto} from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let errorMessage = $state('');

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = '';

    try {
      await signIn(email, password);
      goto('/');
    } catch (error: any) {
      errorMessage = error.message || 'An error occurred during login.';
    }
  }

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

<div class="fade-container min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h1 class="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">Log In</h1>
      

      <form onsubmit={handleLogin} class="flex flex-col gap-4 max-w-sm mx-auto mt-20">

        {#if errorMessage}
          <p class="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded" role="alert">
            {errorMessage}
          </p>
        {/if}

        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            bind:value={email}
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Email address"
            autocomplete="email"
            required
          />
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            bind:value={password}
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter password"
            autocomplete="current-password"
            required
          />
        </div>
        
        <button
          type="submit"
          class="w-full bg-primary-color hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Log In
        </button>
      </form>
    </div>
    <button class="align-center justify-center block w-full mt-4 bg-secondary-color hover:bg-opacity-90 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
      <a href="/register" class="text-primary-color no-underline">Register</a>
    </button>
  </div>
</div>