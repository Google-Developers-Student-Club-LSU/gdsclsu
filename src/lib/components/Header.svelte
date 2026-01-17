<script lang="ts">
  import { onMount } from "svelte";

  import gdscLogo from "$lib/assets/GDSC.png";

  onMount(() => {
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.theme = document.body.classList.contains("dark") ? "dark" : "light";
    });
  });
</script>

<div class="flex items-center justify-between p-6 rounded-bl-lg rounded-br-lg w-full z-10 h-auto absolute">
  <div class="flex items-center gap-4">
    <a href="/">
      <img src={gdscLogo} alt="GDG Logo" class="h-8 w-12" />
    </a>
    <h1 class="">GDG LSU</h1>
  </div>

  <div>
    <button id="theme-toggle"></button>
  </div>

  <div class="flex gap-8">
    <a href="/about">About</a>
    <a href="/events">Events</a>
    <a href="/officers">Officers</a>
    <a href="/sponsor">Sponsor</a>
    <a href="/taskboard">Taskboard</a>
    <a href="/login">Login</a>
  </div>
</div>
