<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  let { form, data }: { form: any; data: PageData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h1 class="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">Sign Up</h1>
      
      {#if form?.error}
        <div class="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded" role="alert">
          <span>{form.error}</span>
        </div>
      {/if}

      <form method="POST" action="?/register" use:enhance>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
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
            name="password"
            id="password"
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
          Sign Up 
        </button>
      </form>
    </div>
  </div>
</div>