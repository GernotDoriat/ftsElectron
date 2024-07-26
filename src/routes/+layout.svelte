<script>
	import "../app.css";
	import BusyOverlay from "../components/BusyOverlay.svelte";
	import { UiStore } from "../stores/UiStore";
</script>

<slot />

{#if $UiStore.busy}
	<BusyOverlay>{$UiStore.busyText}</BusyOverlay>
{/if}
