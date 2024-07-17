<script>
	import { onMount } from "svelte";
	import Papa from "papaparse";

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
	$: reactOn(costuraFiles);
	function reactOn() {
		if (costuraFiles && costuraFiles.length == 1) {
			wolkensteinInput.value = "";
			doParse("costura");
		}
	}

	$: wolkensteinFiles = undefined;
	$: reactOn2(wolkensteinFiles);
	function reactOn2() {
		if (wolkensteinFiles && wolkensteinFiles.length == 1) {
			costuraInput.value = "";
			doParse("wolkenstein");
		}
	}

	function doParse(type) {
		console.log("doParse");
		textRows = [];
		let file = type == "costura" ? costuraFiles[0] : wolkensteinFiles[0];

		// Parse local CSV file
		Papa.parse(file, {
			complete: function (results) {
				console.log("Finished:", results.data);
				if (Array.isArray(results.data) && results.data.length > 0) {
					let rows = results.data;
					let rowLength = rows[0].length;
					let index = indexOfLastEmptyRow(rows, rowLength);
					if (index > -1) {
						let relevantRows = [];
						for (let i = index + 1; i < results.data.length; i++) {
							if (results.data[i].length == rowLength && results.data[i][0] == "") {
								let relevantRow = [];
								for (let j = 1; j < results.data[i].length; j++) {
									relevantRow.push(results.data[i][j]);
								}
								relevantRows.push(relevantRow);
							}
						}
						let items = [];
						if (relevantRows.length == 4) {
							let monthYear = "";
							let day = "";
							let time = "";
							let commited = 0;
							let needed = 0;

							for (let i = 0; i < rowLength - 1; i++) {
								// ohne YEAR!
								if (relevantRows[0][i] != "") monthYear = relevantRows[0][i].split(" ")[0];
								if (relevantRows[1][i] != "") day = relevantRows[1][i];
								if (relevantRows[2][i] != "") time = relevantRows[2][i];
								let commitedToNeeded = relevantRows[3][i].split("/");
								commited = Number.parseInt(commitedToNeeded[0].trim());
								needed = Number.parseInt(commitedToNeeded[1].trim());
								let item = {
									monthYear: monthYear,
									day: day,
									time: time,
									commited: commited,
									needed: needed,
								};
								items.push(item);
							}
						}
						console.log("items", items);
						let critcals = items.filter((i) => i.commited < i.needed);
						console.log("critcals", critcals);
						let wrkRows = [];
						// ohne ort zeile
						//wrkRows.push(`${rows[9][0]}:`);
						// aber mit leerzeile
						wrkRows.push("");
						for (const critcal of critcals) {
							if (type == "costura") wrkRows.push(`${critcal.day.trim()}. ${critcal.monthYear} ${critcal.time}`);
							else
								wrkRows.push(
									`Für  ${critcal.day.trim()}. ${critcal.monthYear} ${
										critcal.time
									} Uhr benötigen wir noch ${critcal.needed - critcal.commited} Helfer.`,
								);
						}
						textRows = wrkRows;
					}
				}
			},
		});
	}

	function indexOfLastEmptyRow(rows, rowLength) {
		let result = -1;
		if (Array.isArray(rows) && rows.length > 0) {
			for (let i = 0; i < rows.length; i++) {
				if (rowEmpty(rows[i], rowLength)) result = i;
			}
		}
		return result;
	}

	function rowEmpty(row, length) {
		if (Array.isArray(row) && row.length == length) {
			for (const cell of row) {
				if (cell != "") return false;
			}
			return true;
		}
		return false;
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
	<p class="m-3 text-3xl font-bold">Für Kassendienst La Costura</p>
	<div class="p-4">
		<input bind:this={costuraInput} class="text-2xl" type="file" accept=".csv" bind:files={costuraFiles} />
	</div>
</div>

<div class="m-2 border-2 border-neutral-300">
	<p class="m-3 text-3xl font-bold">Für Helfer Wolkenstein Milonga</p>
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
