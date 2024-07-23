<script>
	import { onMount } from "svelte";
	import Icon from "../components/Icon.svelte";
	import { ListStore } from "../stores/ListStore";

	onMount(init);
	function init() {
		/* console.log("navigator", navigator);
		console.log("Height", window.innerHeight);
		console.log("Width", window.innerWidth);
		console.log("document", document); */
		const textareas = document.querySelectorAll("textarea");
		for (const textarea of textareas) {
			textarea.addEventListener("select", logSelection);
		}
		setTimeout(() => {
			searchText = "Beschluss";
		}, 1000);
	}
	$: currentSelection = undefined;
	function logSelection(event) {
		currentSelection = event.target.value.substring(event.target.selectionStart, event.target.selectionEnd);
		console.log(`SEL "${currentSelection}"`);
	}

	$: selectedFiles = undefined;
	$: reactOnSelectedFiles(selectedFiles);
	function reactOnSelectedFiles() {
		if (selectedFiles && selectedFiles.length == 1) {
			console.warn("reactOnSelectedFiles");
			processFile(selectedFiles[0]);
		}
	}

	function reset() {
		console.warn("reset");
		currentSelection = undefined;
		text1 = "";
		text2 = "";
		indexOfSearch = 0;
		parts = [];
	}

	async function processFile(file) {
		reset();
		console.warn("processFile", file);
		let result = await window.ipcElectron.invoke("extract-text", file.path);
		processText(result.text);
	}

	function searchTextChange() {
		processFile(selectedFiles[0]);
	}

	let searchText = undefined;
	$: text1 = "";
	$: text2 = "";

	$: indexOfSearch = 0;
	$: parts = [];

	function processText(text) {
		{
			// für eine kompakte Ansicht
			text = text.replace(/(\r\n|\n|\r)/gm, " ");
			// CSV
			text = text.replace(/(;)/gm, ",");
			parts = text.split(searchText);
			if (searchText && parts.length > 1) showParts();
		}
	}
	function showParts() {
		console.warn(`showParts indexOfSearch = ${indexOfSearch}`);
		text1 = parts[indexOfSearch];
		text2 = parts[indexOfSearch + 1];
	}
	function getKeyOffset() {
		let offset = 0;
		for (let i = 0; i <= indexOfSearch; i++) offset += parts[i].length;
		return offset;
	}

	function moveUp() {
		currentSelection = undefined;
		indexOfSearch--;
		showParts();
	}
	function moveDown() {
		currentSelection = undefined;
		indexOfSearch++;
		showParts();
	}

	function add() {
		console.warn(`add "${currentSelection}"`);
		ListStore.add(selectedFiles[0].name, searchText, getKeyOffset(), currentSelection);
	}
	function save() {
		window.ipcElectron.invoke("write-csv", ListStore.getCsv());
	}

	function selectFolder() {
		let files = window.ipcElectron.invoke("folder-files");
	}
	function selectFile() {
		let files = window.ipcElectron.invoke("file");
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
	<div>
		<div class="p-5">
			<button class="text-xl font-bold bg-orange-600 text-white" on:click={selectFolder}><Icon id="folder" /></button>
		</div>
	</div>
	<div>
		<div class="p-5">
			<button class="text-xl font-bold bg-orange-600 text-white" on:click={selectFile}><Icon id="file" /></button>
		</div>
	</div>
	<div>
		<div class="p-4">
			<input class="text-2xl" type="file" bind:files={selectedFiles} />
		</div>
	</div>

	<div class=" m-2">
		<div class="px-4 w-full text-orange-600">
			<input
				class="p-2 text-3xl w-full focus:outline-0"
				type="text"
				placeholder="Suchbegriff eingeben oder einsetzen..."
				bind:value={searchText}
				on:input={searchTextChange}
			/>
		</div>
	</div>

	{#if selectedFiles && searchText}
		<div class="mx-2 my-3 h-10 flex gap-2">
			{#if indexOfSearch > 0}
				<button class="text-xl font-bold bg-orange-600 text-white" on:click={moveUp}><Icon id="arrowUp" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}

			{#if parts.length > 1}
				<p class="text-4xl font-semibold">{`${indexOfSearch + 1}/${parts.length - 1}`}</p>
			{/if}

			{#if indexOfSearch < parts.length - 2}
				<button class=" text-xl font-bold bg-orange-600 text-white" on:click={moveDown}> <Icon id="arrowDown" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}
		</div>
		<div class="mx-2 my-3 h-10 flex gap-2">
			{#if currentSelection}
				<button class="text-xl font-bold bg-orange-600 text-white" on:click={add}><Icon id="plus" /></button>
				<button class="text-xl font-bold bg-orange-600 text-white" on:click={save}><Icon id="docUpdate" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}
		</div>
	{/if}
</div>

<div class="absolute left-2 bottom-2 right-2 p-1 border-2">
	<div class="px-4 w-full h-40 overflow-y-scroll">
		<textarea style="resize: none;" class="h-full w-full focus:outline-0">{text1}</textarea>
	</div>

	<div class="px-4 w-full text-orange-600">
		<p class="text-xl font-semibold">
			{searchText}
		</p>
	</div>

	<div class="px-4 w-full h-40 overflow-y-scroll">
		<textarea style="resize: none;" class="h-full w-full focus:outline-0">{text2}</textarea>
	</div>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
