<script lang="ts">
  import Leaderboard from '$lib/components/Leaderboard.svelte';

  let { data } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16 px-5">
  <div class="max-w-4xl mx-auto">
    <Leaderboard members={data.members} />
  </div>
</div>