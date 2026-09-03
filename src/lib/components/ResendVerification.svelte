<script lang="ts">
  import { onDestroy } from "svelte";
  import { resendVerificationEmail } from "$lib/firebase/auth";

  let { email, password }: { email: string; password: string } = $props();

  let sending = $state(false);
  let sent = $state(false);
  let message = $state("");
  let cooldown = $state(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  onDestroy(stopTimer);

  function startCooldown() {
    stopTimer();
    cooldown = 60;
    timer = setInterval(() => {
      cooldown -= 1;
      if (cooldown <= 0) stopTimer();
    }, 1000);
  }

  async function handleResend() {
    if (sending || cooldown > 0) return;
    sending = true;
    sent = false;
    message = "";
    try {
      await resendVerificationEmail(email, password);
      sent = true;
      message =
        "Verification email sent. Check your inbox (and spam folder), then log in once you've verified.";
      startCooldown();
    } catch (error) {
      const err = error as { message?: string };
      message =
        err.message ||
        "Could not resend the verification email. Try again in a moment.";
    } finally {
      sending = false;
    }
  }
</script>

<div class="w-full flex flex-col gap-2">
  <button
    type="button"
    onclick={handleResend}
    disabled={sending || cooldown > 0}
    class="w-full flex justify-center items-center py-2 px-4 border border-primary-color/30 rounded-lg text-sm font-medium text-primary-color bg-primary-color/10 hover:bg-primary-color/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
  >
    {#if sending}
      Resending...
    {:else if cooldown > 0}
      Resend available in {cooldown}s
    {:else if sent}
      Send it again
    {:else}
      Resend verification email
    {/if}
  </button>
  {#if message}
    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed" role="status">
      {message}
    </p>
  {/if}
</div>
