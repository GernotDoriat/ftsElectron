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
			console.warn("reactOnCosturaFiles");
			processFile(costuraFiles[0]);
		}
	}

	async function processFile(file) {
		text1 = "";
		text2 = "";
		console.warn("processFile", file);
		let result = await window.ipcElectron.invoke("extract-text", file.path);

		processText(result.text);
	}
	let searchText = "Beschluss";
	let fileInput;

	$: text1 = "davor";
	$: text2 = "danach";

	function processText(text) {
		let parts = text.split(searchText);
		if (parts.length > 1) {
			text1 = parts[0];
			text2 = parts[1];
		}
	}
</script>

<div class="flex justify-between">
	<img class="m-1 h-16 mt-2" src="tangoLibreLogoSquareTransparent.png" alt="logo" />
	<div class="w-full">
		<p class="m-5 text-3xl font-bold text-center text-orange-600">Volltext Suche</p>
	</div>
</div>

<div class="flex">
	<div class="m-2 border-2 border-neutral-300">
		<div class="p-4">
			<input bind:this={fileInput} class="text-2xl" type="file" bind:files={costuraFiles} />
		</div>
	</div>

	<div class=" m-2 border-2 border-neutral-300">
		<div class="p-4 w-full">
			<input class="p-2 text-3xl w-full focus:outline-0" type="text" placeholder="Suchbegriff eingeben oder einsetzen..." bind:value={searchText} />
		</div>
	</div>
</div>

<div class="absolute left-2 bottom-2 right-2 p-1 border-2 border-neutral-300">
	<div class="px-4 w-full h-40 overflow-y-scroll">
		<p name="" id="" class="h-full">
			{text1}
		</p>
	</div>

	<div class="px-4 w-full text-red-700">
		<p name="" id="" class="h-full">
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
