<script lang="ts">
  import { goto } from "$app/navigation";
  import { checkVerificationStatus, createUser } from "$lib/firebase/auth";
  import ResendVerification from "$lib/components/ResendVerification.svelte";
  import { onDestroy, onMount } from "svelte";
  import gsap from "gsap";

  let email = $state("");
  let password = $state("");
  let username = $state("");
  let errorMessage = $state("");
  let submitting = $state(false);
  let isVerificationSent = $state(false);
  let checkingStatus = $state(false);
  let statusMessage = $state("");
  let statusVerified = $state(false);
  let pollTimer: ReturnType<typeof setInterval> | undefined;
  let pollCount = 0;

  function stopStatusPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  }

  onDestroy(stopStatusPolling);

  function startStatusPolling() {
    stopStatusPolling();
    pollCount = 0;
    pollTimer = setInterval(async () => {
      pollCount += 1;
      if (pollCount > 20) {
        stopStatusPolling();
        return;
      }
      try {
        const { verified } = await checkVerificationStatus(email, password);
        if (verified) {
          stopStatusPolling();
          statusVerified = true;
          statusMessage =
            "Your email is verified — you're all set. Log in to get started.";
        }
      } catch {
        // Best-effort polling; the manual check surfaces real errors.
      }
    }, 6000);
  }

  async function handleCheckStatus() {
    if (checkingStatus) return;
    checkingStatus = true;
    statusMessage = "";
    try {
      const { verified } = await checkVerificationStatus(email, password);
      if (verified) {
        stopStatusPolling();
        statusVerified = true;
        statusMessage =
          "Your email is verified — you're all set. Log in to get started.";
      } else {
        statusVerified = false;
        statusMessage =
          'Not verified yet. If you clicked the link and saw "link expired", your email may already be verified — just check again in a minute. Otherwise, check your spam folder or resend the email below.';
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

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = "";
    submitting = true;

    if (!email.toLowerCase().endsWith(".edu")) {
      errorMessage = "Only .edu email addresses are allowed";
      submitting = false;
      return;
    }

    try {
      await createUser(email, password, username);
      isVerificationSent = true;
      startStatusPolling();
    } catch (error: any) {
      console.error("Registration failed:", error);
      errorMessage = error.message || "An unexpected error occurred.";
    } finally {
      submitting = false;
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

<div
  class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 px-6 lg:px-8"
>
  <div class="sm:mx-auto sm:w-full sm:max-w-md fade-container">
    <h2
      class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
    >
      Create your account
    </h2>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md fade-container">
    <div
      class="bg-white dark:bg-gray-800 py-8 px-4 shadow rounded-lg sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-700"
    >
      {#if isVerificationSent}
        <div class="text-center py-6 flex flex-col items-center gap-4">
          <div
            class="h-12 w-12 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center text-2xl"
          >
            {statusVerified ? "✅" : "✉️"}
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            {statusVerified ? "Email Verified" : "Verify Your Email"}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {#if statusVerified}
              Your email <span class="font-semibold text-green-500"
                >{email}</span
              > is confirmed — you're all set.
            {:else}
              We have sent a verification link to <span
                class="font-semibold text-purple-500">{email}</span
              >. Your account database record will be finalized as soon as you
              verify your email address.
            {/if}
          </p>

          {#if statusMessage}
            <div
              class="w-full text-left text-sm rounded-lg p-3 border {statusVerified
                ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'}"
              role="status"
            >
              {statusMessage}
            </div>
          {/if}

          <button
            type="button"
            onclick={handleCheckStatus}
            disabled={checkingStatus}
            class="w-full flex justify-center items-center py-2 px-4 border border-primary-color/30 rounded-lg text-sm font-medium text-primary-color bg-primary-color/10 hover:bg-primary-color/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {checkingStatus
              ? "Checking..."
              : statusVerified
                ? "Check again"
                : "I clicked the link — check status"}
          </button>

          <a
            href="/login"
            class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-color hover:bg-opacity-90 transition-all"
          >
            {statusVerified ? "Log In &rarr;" : "Go to Login &rarr;"}
          </a>
          <div class="w-full mt-4">
            <p
              class="text-xs text-slate-500 dark:text-slate-400 text-center mb-2"
            >
              Didn't get it? Check your spam folder, or send a new link below.
            </p>
            <ResendVerification {email} {password} />
          </div>
        </div>
      {:else}
        <form class="space-y-6" onsubmit={handleRegister}>
          {#if errorMessage}
            <div
              class="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg font-medium"
            >
              {errorMessage}
            </div>
          {/if}

          <label class="block">
            <span
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Username</span
            >
            <input
              type="text"
              bind:value={username}
              required
              class="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>

          <label class="block">
            <span
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Email (.edu only)</span
            >
            <input
              type="email"
              bind:value={email}
              required
              class="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>

          <label class="block">
            <span
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Password</span
            >
            <input
              type="password"
              bind:value={password}
              required
              class="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-color hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color disabled:opacity-50 transition-all"
          >
            {submitting ? "Registering..." : "Sign Up"}
          </button>
        </form>
      {/if}
    </div>
  </div>
</div>
