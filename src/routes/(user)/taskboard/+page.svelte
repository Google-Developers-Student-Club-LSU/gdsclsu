<script lang="ts">
    import Taskboard from '$lib/components/Taskboard.svelte';
    import { authState } from "$lib/firebase/auth.svelte";
    import { goto } from "$app/navigation";

    $effect(() => {
        if (authState.isLoading) return;

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

{#if authState.isLoading}
    <div class="loading-screen">
        <p>Verifying permissions...</p>
    </div>
{:else}
    <Taskboard />
{/if}

<style>
    .loading-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: sans-serif;
        color: #64748b;
    }
</style>d

