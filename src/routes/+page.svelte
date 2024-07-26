<script>
	import { onMount } from "svelte";
	import Icon from "../components/Icon.svelte";
	import { ListStore } from "../stores/ListStore";
	import { UiStore } from "../stores/UiStore";

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
	let currentFile = "";

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
		console.log("extract-text", result);
		processText(result.text);
	}

	function inputSearchTextChange() {
		ListStore.clear();
		if (filesList.length > 0) processFilePath(currentFile);
	}

	let keyWord = "";
	$: text1 = "";
	$: text2 = "";

	$: indexOfKeyWord = 0;
	$: parts = [];

	function processText(text) {
		if (text) {
			// für eine kompakte Ansicht
			text = text.replace(/(\r\n|\n|\r)/gm, " ");
			// CSV
			text = text.replace(/(;)/gm, ",");
			parts = text.split(keyWord);
			console.log("parts", parts);
			if (keyWord && parts.length > 1) showParts();
		} else console.error("processText: text EMPTY");
	}
	let textarea2;
	function showParts() {
		console.warn(`showParts indexOfSearch = ${indexOfKeyWord}`);
		text1 = parts[indexOfKeyWord];
		text2 = parts[indexOfKeyWord + 1];
		let item = ListStore.getItem(currentFile.fileName, keyWord, getKeyOffset());
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
		ListStore.setItem(currentFile.fileName, keyWord, getKeyOffset(), currentSelection);
		showParts();
	}
	function save() {
		window.ipcElectron.invoke("write-csv", ListStore.getCsv(), ListStore.getFileName());
	}

	async function selectFolder() {
		/* let result = await window.ipcElectron.invoke("selectFolder", keyWord);
		console.warn("selectFolder", result);
		filesList = [...result.files]; */

		let result1 = await window.ipcElectron.invoke("selectFolder");
		console.warn("selectFolder", result1);
		UiStore.setBusy();
		let result2 = await window.ipcElectron.invoke("processFolder", result1.selectedDirPath, keyWord);
		UiStore.clearBusy();
		console.warn("processFolder", result2);
		filesList = [...result2.files];
	}
	async function selectFile() {
		let result = await window.ipcElectron.invoke("selectFile");
		console.warn("selectFile", result);
		if (result.success && !filesList.find((o) => o.filePath == result.file.filePath)) {
			filesList = [...filesList, result.file];
			currentFile = filesList[filesList.length - 1];
			processFilePath(currentFile.filePath);
		}
	}
	async function getListStoreData() {
		let result = await window.ipcElectron.invoke("getListStoreData");
		//console.warn("getListStoreData", result);
		if (result.success) {
			ListStore.init(result.json);
			console.log("STORE", $ListStore);
			if (result.json.length > 0 && result.json[0].keyWord) keyWord = result.json[0].keyWord;
			else keyWord = "";
			if (filesList.length > 0) processFilePath(filesList[0].filePath);
		}
	}

	let timer = undefined;
	function startBusy() {
		let msecs = 0;
		busy = true;
		timer = setInterval(() => {
			msecs += 100;
			busyText = `${(msecs / 1000).toFixed(2)}`;
		}, 100);
	}
	function stopBusy() {
		clearInterval(timer);
		busyText = "";
		busy = false;
	}

	function doTest() {
		UiStore.setBusy();
		setTimeout(() => {
			UiStore.clearBusy();
		}, 2000);
	}
</script>

<!-- 
<div class="flex justify-between">0
	<img class="m-1 h-16 mt-2" src="tangoLibreLogoSquareTransparent.png" alt="logo" />
	<div class="w-full">
		<p class="m-5 text-3xl font-bold text-center text-orange-600">Volltext Suche</p>
	</div>
</div>
 -->
<div class="flex">
	<div>
		<div class="flex gap-1 p-5">
			<button class="text-xl font-bold bg-sky-500 text-white rounded-md" on:click={getListStoreData}><Icon id="docImport" /></button>
		</div>
	</div>
	<div>
		<div class="flex gap-1 p-5">
			<button class="text-xl font-bold bg-orange-500 text-white rounded-md" on:click={selectFolder}><Icon id="folder" /></button>
			<button class="text-xl font-bold bg-orange-500 text-white rounded-md" on:click={selectFile}><Icon id="file" /></button>
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
				<button class="text-xl font-bold bg-orange-600 text-white rounded-md" on:click={moveUp}><Icon id="arrowUp" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}

			{#if parts.length > 1}
				<p class="text-4xl font-semibold">{`${indexOfKeyWord + 1}/${parts.length - 1}`}</p>
			{/if}

			{#if indexOfKeyWord < parts.length - 2}
				<button class=" text-xl font-bold bg-orange-600 text-white rounded-md" on:click={moveDown}> <Icon id="arrowDown" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}
		</div>
		<div class="mx-2 my-3 h-10 flex gap-2">
			{#if currentSelection}
				<button class="text-xl font-bold bg-orange-600 text-white rounded-md" on:click={setItem}><Icon id="plus" /></button>
				<button class="text-xl font-bold bg-sky-500 text-white rounded-md" on:click={save}><Icon id="docExport" /></button>
			{:else}
				<div class="w-8"></div>
			{/if}
		</div>
	{/if}
</div>

<div class="flex gap-2 p-4">
	<select
		class="bg-gray-50 border border-orange-600 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
		bind:value={currentFile}
		on:change={processFilePath(currentFile.filePath)}
	>
		{#each filesList as file (file.filePath)}
			<option value={file}>{file.fileName}</option>
		{/each}
	</select>
	<button class="px-2 text-xl font-bold bg-yellow-500 text-white rounded-md" on:click={doTest}>TEST</button>
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
