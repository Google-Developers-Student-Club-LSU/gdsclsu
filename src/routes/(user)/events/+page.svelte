<script lang="ts">
  import Calendar from '$lib/components/Calendar.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<Calendar user={data.user} />
