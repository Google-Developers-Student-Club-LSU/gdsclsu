<script lang="ts">
  import { onMount } from "svelte";
  import gsap from "gsap";

  import { checkVerificationStatus, signIn } from "$lib/firebase/auth";
  import ResendVerification from "$lib/components/ResendVerification.svelte";
  import { goto } from "$app/navigation";

  let email = $state("");
  let password = $state("");
  let errorMessage = $state("");
  let errorCode = $state("");
  let checkingStatus = $state(false);
  let statusMessage = $state("");
  let statusVerified = $state(false);

  async function doLogin() {
    errorMessage = "";
    errorCode = "";
    try {
      await signIn(email, password);
      goto("/");
    } catch (error: any) {
      errorMessage = error.message || "An error occurred during login.";
      errorCode = error?.code || "";
    }
  }

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    await doLogin();
  }

  async function handleCheckStatus() {
    if (checkingStatus) return;
    checkingStatus = true;
    statusMessage = "";
    try {
      const { verified } = await checkVerificationStatus(email, password);
      if (verified) {
        statusVerified = true;
        statusMessage = "Verified — signing you in...";
        await doLogin();
      } else {
        statusVerified = false;
        statusMessage =
          'Not verified yet. If you clicked the link and saw "link expired", your email may already be verified — just check again in a moment. Otherwise, check your spam folder or resend the email below.';
      }
    } catch (error: any) {
      statusVerified = false;
      statusMessage =
        error?.message ||
        "Could not check your verification status. Try again in a moment.";
    } finally {
      checkingStatus = false;
    }
  }

  onMount(() => {
    const containers = document.querySelectorAll(".fade-container");

    containers.forEach((container: Element) => {
      gsap.set(container, { autoAlpha: 0, y: 50 });

      gsap.to(container, {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      });
    });
  });
</script>

<div class="fade-container min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h1
        class="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white"
      >
        Log In
      </h1>

      <form
        onsubmit={handleLogin}
        class="flex flex-col gap-4 max-w-sm mx-auto mt-20"
      >
        {#if errorMessage}
          <p
            class="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded"
            role="alert"
          >
            {errorMessage}
          </p>
          {#if errorCode === "auth/email-not-verified"}
            <div
              class="mb-4 p-4 bg-purple-500/10 dark:bg-purple-500/10 border border-primary-color/30 rounded-lg flex flex-col gap-3"
            >
              <p class="text-sm font-medium text-primary-color">
                Didn't get the email? Check your status below or send a fresh
                link.
              </p>
              <button
                type="button"
                onclick={handleCheckStatus}
                disabled={checkingStatus}
                class="w-full flex justify-center items-center py-2 px-4 border border-primary-color/30 rounded-lg text-sm font-medium text-primary-color bg-primary-color/10 hover:bg-primary-color/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {checkingStatus
                  ? "Checking..."
                  : "I clicked the link — check status"}
              </button>
              {#if statusMessage}
                <p
                  class="text-xs rounded p-2 {statusVerified
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}"
                  role="status"
                >
                  {statusMessage}
                </p>
              {/if}
              <ResendVerification {email} {password} />
            </div>
          {/if}
        {/if}

        <div class="mb-4">
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
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
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
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
    <button
      class="align-center justify-center block w-full mt-4 bg-secondary-color hover:bg-opacity-90 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
    >
      <a href="/register" class="text-primary-color no-underline">Register</a>
    </button>
  </div>
</div>
