<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { getPlatformDetails, getPlatforms } from '$lib/data';
	import type { ExtensionOptions, Platform } from '$lib/types';

	export let options: ExtensionOptions;

	const dispatch = createEventDispatcher<{
		platformtoggle: Platform;
		timeframechange: number;
		togglenoinfobar: void;
	}>();

	const platforms = getPlatforms().map((platform) => ({
		platform,
		details: getPlatformDetails(platform),
	}));

	function handleTimeFrameChange(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		dispatch('timeframechange', parseInt(target.value, 10));
	}
</script>

<div class="border-b border-hover bg-card px-4 py-4">
	<h2 class="mb-3 text-sm font-semibold text-dim">Settings</h2>

	<div class="mb-4">
		<label for="timeframe-select" class="mb-2 block text-xs text-dim">Time Frame</label>
		<select
			id="timeframe-select"
			class="rounded-md border border-hover bg-section px-3 py-1.5 text-sm text-main"
			value={options.timeFrame}
			on:change={handleTimeFrameChange}
		>
			<option value={7}>Last 7 days</option>
			<option value={14}>Last 14 days</option>
			<option value={30}>Last 30 days</option>
		</select>
	</div>

	<div class="mb-4">
		<span class="mb-2 block text-xs text-dim">Enabled Platforms</span>
		<div class="flex flex-wrap gap-2">
			{#each platforms as item}
				<button
					class={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all ${
						options.enabled[item.platform]
							? `${item.details.bg} text-white`
							: 'bg-section text-dim opacity-50'
					}`}
					on:click={() => dispatch('platformtoggle', item.platform)}
				>
					<img
						src={item.details.icon}
						alt={item.details.name}
						class="h-3.5 w-3.5"
					/>
					{item.details.name}
				</button>
			{/each}
		</div>
	</div>

	<div>
		<label class="flex items-center gap-2 text-sm">
			<input
				type="checkbox"
				checked={options.showNoInfoBar}
				on:change={() => dispatch('togglenoinfobar')}
				class="rounded"
			/>
			<span class="text-dim">Show info bar for games not in any service</span>
		</label>
	</div>
</div>