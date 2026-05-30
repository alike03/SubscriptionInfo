<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import GameCard from '$lib/components/GameCard.svelte';
	import type { Game } from '$lib/types';

	import type { TabType } from '../types';

	export let activeTab: TabType;
	export let loading = true;
	export let games: Record<TabType, Game[]>;
</script>

<main class="flex-1 overflow-y-auto p-4">
	{#if loading}
		<div class="flex h-full items-center justify-center">
			<div class="text-dim">Loading...</div>
		</div>
	{:else if games[activeTab].length === 0}
		<div class="flex h-full items-center justify-center">
			<div class="text-center text-dim">
				<p class="mb-2">No games found</p>
				<p class="text-xs">Try adjusting the time frame in settings</p>
			</div>
		</div>
	{:else}
		<Carousel>
			{#each games[activeTab] as game (game.id)}
				<div class="embla__slide">
					<GameCard {game} />
				</div>
			{/each}
		</Carousel>
	{/if}
</main>