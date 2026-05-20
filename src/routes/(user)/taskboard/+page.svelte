<script lang="ts">
    import Taskboard from '$lib/components/Taskboard.svelte';
    import { authState } from "$lib/firebase/auth.svelte";
    import { goto } from "$app/navigation";

    $effect(() => {
        if (!authState.user) {
            goto("/login?redirectTo=/taskboard");
            return;
        }

        if (!authState.isOfficer) {
            goto("/calendar?error=unauthorized");
            return;
        }
    });
</script>

<Taskboard />