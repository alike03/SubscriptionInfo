<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface TabSwitchItem {
		id: string;
		label: string;
	}

	export let activeTab: string;
	export let tabs: TabSwitchItem[];
	export let ariaLabel = 'Tabs';

	const dispatch = createEventDispatcher<{
		select: string;
	}>();

	$: activeIndex = Math.max(
		tabs.findIndex((tab) => tab.id === activeTab),
		0,
	);
</script>

<nav
	class="tabs-shell relative grid gap-1 rounded-sm border border-white/8 bg-card/70 p-1 backdrop-blur"
	style={`--tab-count: ${tabs.length}; --active-index: ${activeIndex}; grid-template-columns: repeat(${tabs.length}, minmax(0, 1fr));`}
	aria-label={ariaLabel}
>
	<span class="tabs-active" aria-hidden="true"></span>

	{#each tabs as tab (tab.id)}
		<button
			class={`relative z-10 min-w-0 cursor-pointer rounded-[8px] border border-transparent px-2.5 py-2 text-xs font-semibold transition-colors duration-200 ease-out ${
				activeTab === tab.id
					? 'text-main'
					: 'text-dim hover:border-white/10 hover:bg-section/70 hover:text-main'
			}`}
			aria-pressed={activeTab === tab.id}
			on:click={() => dispatch('select', tab.id)}
		>
			<span class="block truncate">{tab.label}</span>
		</button>
	{/each}
</nav>

<style>
	.tabs-shell {
		--tab-gap: 0.25rem;
		--tab-padding: 0.25rem;
	}

	.tabs-active {
		position: absolute;
		top: var(--tab-padding);
		bottom: var(--tab-padding);
		left: var(--tab-padding);
		width: calc(
			(100% - (var(--tab-padding) * 2) - ((var(--tab-count) - 1) * var(--tab-gap))) /
				var(--tab-count)
		);
		border: 1px solid rgb(161 205 68 / 0.4);
		border-radius: 0.5rem;
		background: rgb(161 205 68 / 0.16);
		box-shadow: var(--shadow-glow);
		transform: translateX(calc(var(--active-index) * (100% + var(--tab-gap))));
		transition: transform 0.22s ease-out;
	}
</style>
