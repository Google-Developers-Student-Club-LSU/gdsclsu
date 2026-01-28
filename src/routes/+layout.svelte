<script lang="ts">
	import './layout.css';

	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";

	import { lenis } from "lenis-svelte";
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<Header user={data.user} />
<div class="min-h-dvh flex flex-col justify-between item-center">
	<div class="min-h-dvh">
		<main use:lenis>
			{@render children()}
		</main>
	</div>
	<Footer/>
</div>
