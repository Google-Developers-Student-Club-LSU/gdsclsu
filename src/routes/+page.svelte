<script lang="ts">
  import test from "$lib/assets/test.png";

	import ImageTrack from "$lib/components/ImageTrack.svelte";
	import BlobBackground from "$lib/components/BlobBackground.svelte";

  import gsap from "gsap";
  import { onMount } from "svelte";

  onMount(() => {
    gsap.from(".mainCard", {
      duration: 2,
      opacity: 0,
      x: -200,
    }).play;
  });
</script>

<div class="flex flex-col items-center">
  <BlobBackground />
  <div class="flex absolute rounded-lg border border-primary-color backdrop-blur-[30px] h-150 w-300 brightness-84 items-center justify-center mainCard">
    <h1 class="text-primary-text-light dark:text-primary-text-dark text-9xl">GDSC LSU</h1>
  </div>

  <ImageTrack />
  <div>
    <h1 class="text-primary-text-light text-9xl"> about us </h1>
  </div>

  <div>
    <h1 class="text-primary-text-dark text-9xl"> Our socials </h1>
  </div>
</div>