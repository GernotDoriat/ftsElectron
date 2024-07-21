<script>
	import { onMount } from "svelte";
	import Icon from "../components/Icon.svelte";

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
			console.warn("reactOnCosturaFiles");
			processFile(costuraFiles[0]);
		}
	}

	async function processFile(file) {
		text1 = "";
		text2 = "";
		indexOfSearch = 0;
		parts = [];
		console.warn("processFile", file);
		let result = await window.ipcElectron.invoke("extract-text", file.path);

		processText(result.text);
	}
	let searchText = "Beschluss";
	let fileInput;

	$: text1 = "davor";
	$: text2 = "danach";

	$: indexOfSearch = 0;
	$: parts = [];

	function processText(text) {
		parts = text.split(searchText);
		if (parts.length > 1) {
			showParts();
		}
	}
	function showParts() {
		console.warn(`showParts indexOfSearch = ${indexOfSearch}`);
		text1 = parts[indexOfSearch];
		text2 = parts[indexOfSearch + 1];
	}

	function moveUp() {
		indexOfSearch--;
		showParts();
	}
	function moveDown() {
		indexOfSearch++;
		showParts();
	}
</script>

<!-- 
<div class="flex justify-between">
	<img class="m-1 h-16 mt-2" src="tangoLibreLogoSquareTransparent.png" alt="logo" />
	<div class="w-full">
		<p class="m-5 text-3xl font-bold text-center text-orange-600">Volltext Suche</p>
	</div>
</div>
 -->
<div class="flex">
	<div class="m-">
		<div class="p-4">
			<input bind:this={fileInput} class="text-2xl" type="file" bind:files={costuraFiles} />
		</div>
	</div>

	<div class=" m-2">
		<div class="px-4 w-full">
			<input class="p-2 text-3xl w-full focus:outline-0" type="text" placeholder="Suchbegriff eingeben oder einsetzen..." bind:value={searchText} />
		</div>
	</div>

	{#if costuraFiles}
		<div class="mx-2 my-3 h-10 flex gap-2">
			{#if indexOfSearch > 0}
				<button class="text-xl font-bold bg-orange-600 text-white" on:click={moveUp}><Icon id="arrowUp" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}
			<p class="text-4xl font-semibold">{indexOfSearch + 1}</p>

			{#if indexOfSearch < parts.length - 2}
				<button class=" text-xl font-bold bg-orange-600 text-white" on:click={moveDown}> <Icon id="arrowDown" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}
		</div>
	{/if}
</div>

<div class="absolute left-2 bottom-2 right-2 p-1 border-2">
	<div class="px-4 w-full h-40 overflow-y-scroll">
		<p name="" id="" class="h-full">
			{text1}
		</p>
	</div>

	<div class="px-4 w-full text-orange-600">
		<p class="text-xl font-semibold">
			{searchText}
		</p>
	</div>

	<div class="px-4 w-full h-40 overflow-y-scroll">
		<p name="" id="" class="h-full">
			{text2}
		</p>
	</div>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
