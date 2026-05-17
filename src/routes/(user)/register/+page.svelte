<script lang="ts">
  import { goto } from '$app/navigation';
  import { createUser, signIn } from '$lib/firebase/auth';
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let email = $state('');
  let password = $state('');
  let username = $state('');
  let errorMessage = $state('');
  let submitting = $state(false);

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = '';
    submitting = true;

    if (!email.toLowerCase().endsWith('.edu')) {
      errorMessage = 'Only .edu email addresses are allowed';
      submitting = false;
      return;
    }

    try {
      await createUser(email, password, username);
      await signIn(email, password);
      goto('/');
    } catch (error: any) {
      console.error('Registration failed:', error);
      errorMessage = error.message || 'An unexpected error occurred.';
    } finally {
      submitting = false;
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
        <div class="auth-container">
          <form onsubmit={handleRegister} class="flex flex-col gap-4 max-w-md mx-auto p-6">
            {#if errorMessage}
              <p class="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded" role="alert">
                {errorMessage}
              </p>
            {/if}

            <label>
              <span class="block">Username</span>
              <input type="text" bind:value={username} required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </label>

            <label>
              <span class="block">Email (.edu only)</span>
              <input type="email" bind:value={email} required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </label>

            <label>
              <span class="block">Password</span>
              <input type="password" bind:value={password} required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </label>

            <button 
             type="submit"
             disabled={submitting} 
             class="w-full bg-primary-color hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
             >
              {submitting ? 'Creating Account...' : 'Sign Up'}
            </button>

          </form>
      </div>
    </div>
  </div>
</div>