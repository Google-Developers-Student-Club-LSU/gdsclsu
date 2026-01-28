<script>
  import ImageTrack from "$lib/components/ImageTrack.svelte";
  import GridBackground from "$lib/components/GridBackground.svelte";
</script>

<div class="grid min-h-dvh place-items-center gap-10 grid-template-rows-[auto]">
  <div class="align-center flex flex-col justify-center">
    <GridBackground></GridBackground>
    <ImageTrack></ImageTrack>
  </div>
</div>