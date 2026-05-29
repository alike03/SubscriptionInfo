<script lang="ts">
	import SubscriptionBadges from '$lib/components/SubscriptionBadges.svelte';
	import type { Game } from '$lib/types';

	export let game: Game;
</script>

<div class="group h-full rounded-md bg-card p-3 transition-colors hover:bg-section sm:p-4">
	<div
		class="relative aspect-[2/3] overflow-hidden rounded-sm transition-[filter] group-hover:brightness-125"
	>
		<img src={game.poster} alt={game.name} class="h-full w-full object-cover" />
	</div>

	<div>
		<div class="relative text-lg font-semibold">
			<h2 class="my-3 truncate">
				{game.name}
			</h2>
			<span
				class="absolute -left-2 -top-1 z-10 w-max rounded-md bg-section px-2 py-1 opacity-0 transition-all group-hover:opacity-100"
			>
				{game.name}
			</span>
		</div>

		<SubscriptionBadges subs={game.subs} />
	</div>
</div>