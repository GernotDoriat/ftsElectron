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
			keyWord = "Beschluss";
		}, 1000);
	}
	$: currentSelection = undefined;
	function logSelection(event) {
		currentSelection = event.target.value.substring(event.target.selectionStart, event.target.selectionEnd);
		console.log(`SEL "${currentSelection}"`);
	}

	$: filesList = [];
	$: filesListIndex = 0;

	function clear() {
		console.warn("clear");
		currentSelection = undefined;
		text1 = "";
		text2 = "";
		indexOfKeyWord = 0;
		parts = [];
	}

	async function processFilePath(filePath) {
		clear();
		console.log("processFilePath", filePath);
		let result = await window.ipcElectron.invoke("extract-text", filePath);
		processText(result.text);
	}

	function inputSearchTextChange() {
		ListStore.clear();
		if (filesList.length > 0) processFilePath(filesList[filesListIndex].filePath);
	}

	let keyWord = "";
	$: text1 = "";
	$: text2 = "";

	$: indexOfKeyWord = 0;
	$: parts = [];

	function processText(text) {
		{
			// für eine kompakte Ansicht
			text = text.replace(/(\r\n|\n|\r)/gm, " ");
			// CSV
			text = text.replace(/(;)/gm, ",");
			parts = text.split(keyWord);
			if (keyWord && parts.length > 1) showParts();
		}
	}
	let textarea2;
	function showParts() {
		console.warn(`showParts indexOfSearch = ${indexOfKeyWord}`);
		text1 = parts[indexOfKeyWord];
		text2 = parts[indexOfKeyWord + 1];
		let item = ListStore.getItem(filesList[filesListIndex].filePath, keyWord, getKeyOffset());
		//console.warn("ListStore.getItem", item);
		if (item) {
			//console.warn("item.keyValue", item.keyValue.length, item.keyValue);
			let toBeSelected = item.keyValue;
			let index = text2.indexOf(toBeSelected);
			//console.warn("text2.indexOf", index);
			if (index > 0) {
				let textarea2 = document.getElementById("textarea2");
				textarea2.focus();
				setTimeout(() => {
					textarea2.setSelectionRange(index, index + toBeSelected.length);
				}, 10);
			}
		}
	}
	function getKeyOffset() {
		let offset = 0;
		for (let i = 0; i <= indexOfKeyWord; i++) offset += parts[i].length;
		return offset;
	}

	function moveUp() {
		currentSelection = undefined;
		indexOfKeyWord--;
		showParts();
	}
	function moveDown() {
		currentSelection = undefined;
		indexOfKeyWord++;
		showParts();
	}

	function setItem() {
		console.warn(`setItem "${currentSelection}"`);
		ListStore.setItem(filesList[filesListIndex].filePath, keyWord, getKeyOffset(), currentSelection);
		showParts();
	}
	function save() {
		window.ipcElectron.invoke("write-csv", ListStore.getCsv(), ListStore.getFileName());
	}

	function selectFolder() {
		let files = window.ipcElectron.invoke("selectFolder");
		console.warn("selectFolder", files);
	}
	async function selectFile() {
		let result = await window.ipcElectron.invoke("selectFile");
		console.warn("selectFile", result);
		if (result.success) {
			filesList.push(result.file);
			filesListIndex = filesList.length - 1;
			console.warn(filesList, filesListIndex);
			processFilePath(filesList[filesListIndex].filePath);
		}
	}
	async function getListStoreData() {
		let result = await window.ipcElectron.invoke("getListStoreData");
		//console.warn("getListStoreData", result);
		if (result.success) {
			ListStore.init(result.json);
			console.log("STORE", $ListStore);

			if (result.json.length > 0 && result.json[0].key) keyWord = result.json[0].key;
			else keyWord = "";
			if (filesList.length > 0) processFilePath(filesList[filesListIndex].filePath);
		}
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
		<div class="flex gap-1 p-5">
			<button class="text-xl font-bold bg-sky-500 text-white" on:click={getListStoreData}><Icon id="docImport" /></button>
		</div>
	</div>
	<div>
		<div class="flex gap-1 p-5">
			<button class="text-xl font-bold bg-orange-600 text-white" on:click={selectFolder}><Icon id="folder" /></button>
			<button class="text-xl font-bold bg-orange-600 text-white" on:click={selectFile}><Icon id="file" /></button>
		</div>
	</div>

	<div class=" m-2">
		<div class="px-4 w-full text-orange-600">
			<input
				class="p-2 text-3xl w-full focus:outline-0"
				type="text"
				placeholder="Suchbegriff eingeben oder einsetzen..."
				bind:value={keyWord}
				on:input={inputSearchTextChange}
			/>
		</div>
	</div>

	{#if filesList && keyWord}
		<div class="mx-2 my-3 h-10 flex gap-2">
			{#if indexOfKeyWord > 0}
				<button class="text-xl font-bold bg-orange-600 text-white" on:click={moveUp}><Icon id="arrowUp" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}

			{#if parts.length > 1}
				<p class="text-4xl font-semibold">{`${indexOfKeyWord + 1}/${parts.length - 1}`}</p>
			{/if}

			{#if indexOfKeyWord < parts.length - 2}
				<button class=" text-xl font-bold bg-orange-600 text-white" on:click={moveDown}> <Icon id="arrowDown" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}
		</div>
		<div class="mx-2 my-3 h-10 flex gap-2">
			{#if currentSelection}
				<button class="text-xl font-bold bg-orange-600 text-white" on:click={setItem}><Icon id="plus" /></button>
				<button class="text-xl font-bold bg-orange-600 text-white" on:click={save}><Icon id="docUpdate" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}
		</div>
	{/if}
</div>

<div class="absolute left-2 bottom-2 right-2 p-1 border-2">
	<div class=" w-full h-40 overflow-y-scroll">
		<textarea style="resize: none;" class="h-full w-full focus:outline-0">{text1}</textarea>
	</div>

	<div class="text-center w-full text-orange-600">
		<p class="text-xl font-semibold">
			{keyWord}
		</p>
	</div>

	<div class=" w-full h-40 overflow-y-scroll">
		<textarea id="textarea2" style="resize: none;" class="h-full w-full focus:outline-0">{text2}</textarea>
	</div>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
