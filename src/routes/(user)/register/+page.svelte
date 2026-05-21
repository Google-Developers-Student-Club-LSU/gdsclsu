<script lang="ts">
  import { goto } from '$app/navigation';
  import { createUser } from '$lib/firebase/auth';
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let email = $state('');
  let password = $state('');
  let username = $state('');
  let errorMessage = $state('');
  let submitting = $state(false);
  let isVerificationSent = $state(false);

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
      isVerificationSent = true; 
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
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });
  });
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md fade-container">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
      Create your account
    </h2>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md fade-container">
    <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow rounded-lg sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-700">
      
      {#if isVerificationSent}
        <div class="text-center py-6 flex flex-col items-center gap-4">
          <div class="h-12 w-12 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center text-2xl">
            ✉️
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Verify Your Email</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            We have sent a verification link to <span class="font-semibold text-purple-500">{email}</span>. 
            Your account database record will be finalized as soon as you verify your email address.
          </p>
          <a href="/login" class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-color hover:bg-opacity-90 transition-all">
            Go to Login &rarr;
          </a>
        </div>
      {:else}
        <form class="space-y-6" onsubmit={handleRegister}>
          {#if errorMessage}
            <div class="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg font-medium">
              {errorMessage}
            </div>
          {/if}

          <label class="block">
            <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</span>
            <input type="text" bind:value={username} required class="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </label>

          <label class="block">
            <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (.edu only)</span>
            <input type="email" bind:value={email} required class="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </label>

          <label class="block">
            <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</span>
            <input type="password" bind:value={password} required class="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </label>

          <button 
            type="submit"
            disabled={submitting} 
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-color hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color disabled:opacity-50 transition-all"
          >
            {submitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      {/if}

    </div>
  </div>
</div>