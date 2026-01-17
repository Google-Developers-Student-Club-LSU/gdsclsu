<script lang="ts">
	import './layout.css';

	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";

	import { onMount } from 'svelte';
	import { lenis } from "lenis-svelte";

	const rootLenisInstance = lenis.instance('root');

	let { children } = $props();
</script>

<Header/>
<div class="min-h-dvh flex flex-col justify-between item-center">
	<div class="grid min-h-dvh place-items-center gap-10 grid-template-rows-[auto]">
		<main use:lenis>
			{@render children()}
		</main>
	</div>
	<Footer/>
</div>
