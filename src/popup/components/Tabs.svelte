<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import type { TabDefinition, TabType } from '$lib/types';

	export let activeTab: TabType;
	export let tabs: TabDefinition[];

	const dispatch = createEventDispatcher<{
		select: TabType;
	}>();
</script>

<nav class="flex border-b border-hover bg-card/50">
	{#each tabs as tab}
		<button
			class={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
				activeTab === tab.id
					? 'border-b-2 border-primary text-primary'
					: 'text-dim hover:bg-hover hover:text-main'
			}`}
			on:click={() => dispatch('select', tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</nav>