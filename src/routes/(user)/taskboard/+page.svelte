<script lang="ts">
  import Taskboard from "$lib/components/Taskboard.svelte";
  import { authState } from "$lib/firebase/auth.svelte";
  import { goto } from "$app/navigation";

  $effect(() => {
    if (!authState.user) {
      goto("/login");
      return;
    }

    if (!authState.isOfficer) {
      goto("/events");
      return;
    }
  });
</script>

<Taskboard />
