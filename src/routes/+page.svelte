<script>
	import { onMount } from "svelte";

	onMount(init);
	function init() {
		console.log("navigator", navigator);
		console.log("Height", window.innerHeight);
		console.log("Width", window.innerWidth);
		/* 		console.log("Height", document.height);
		console.log("Width", document.width); */
		console.log("document", document);
	}

	$: costuraFiles = undefined;
	$: reactOnCosturaFiles(costuraFiles);
	function reactOnCosturaFiles() {
		if (costuraFiles && costuraFiles.length == 1) {
			wolkensteinInput.value = "";
			console.warn("reactOnCosturaFiles");
			processFile(costuraFiles[0]);
		}
	}

	$: wolkensteinFiles = undefined;
	$: reactOnWolkensteinFiles(wolkensteinFiles);
	function reactOnWolkensteinFiles() {
		if (wolkensteinFiles && wolkensteinFiles.length == 1) {
			costuraInput.value = "";
			console.warn("reactOnWolkensteinFiles");
			processFile(wolkensteinFiles[0]);
		}
	}

	async function processFile(file) {
		console.warn("processFile", file);
		const result = await window.ipcElectron.invoke("extract-text", file.path);
		console.warn("result", result);
	}

	$: textRows = [];
	let costuraInput, wolkensteinInput;
</script>

<div class="flex justify-between">
	<img class="m-1 h-16 mt-2" src="tangoLibreLogoSquareTransparent.png" alt="logo" />
	<div class="w-full">
		<p class="m-5 text-3xl font-bold text-center text-orange-600">Xoyondo CSV Exporte auswerten</p>
	</div>
</div>

<div class="m-2 border-2 border-neutral-300">
	<p class="m-3 text-3xl font-bold">La Costura</p>
	<div class="p-4">
		<input bind:this={costuraInput} class="text-2xl" type="file" bind:files={costuraFiles} />
	</div>
</div>

<div class="m-2 border-2 border-neutral-300">
	<p class="m-3 text-3xl font-bold">Wolkenstein Milonga</p>
	<div class="p-4">
		<input bind:this={wolkensteinInput} class="text-2xl" type="file" accept=".csv" bind:files={wolkensteinFiles} />
	</div>
</div>
{#if textRows.length > 0}
	<div class="m-2 border-2 border-neutral-300">
		<div class="p-2">
			{#each textRows as textRow}
				<p>{textRow}</p>
			{/each}
		</div>
	</div>
{/if}

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
