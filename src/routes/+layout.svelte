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
	<div class="min-h-dvh">
		<main use:lenis>
			{@render children()}
		</main>
	</div>
	<Footer/>
</div>
