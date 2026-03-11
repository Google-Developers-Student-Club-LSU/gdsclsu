<script lang="ts">
    import { concurrent } from "svelte-typewriter";
    import { page } from "$app/stores";
</script>

<div class="relative min-h-screen flex flex-col items-center justify-center gap-20 py-16 px-5">
  <div class="text-center w-full h-full">
    <p class="text-[60px]">Sorry!</p>
    <p use:concurrent={{ interval: 120 }} class="font-bold text-[50px]">
        Error {$page.status}: {$page.error?.message}
    </p>
  </div>
</div>
