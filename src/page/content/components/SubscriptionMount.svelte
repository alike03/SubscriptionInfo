<script lang="ts">
	import type { Game } from '$lib/types';
	import type { Language } from '$lib/types';
	import { subHasLeft } from '$lib/utils';

	import NoInfoBar from './NoInfoBar.svelte';
	import SubscriptionBadge from './SubscriptionBadge.svelte';

	export let game: Game;
	export let type: number;
	export let language: Language;
	export let hideLeft = false;
	export let showNoInfoBar = true;

	$: visibleSubs = hideLeft ? game.subs.filter((sub) => !subHasLeft(sub)) : game.subs;
</script>

{#if visibleSubs.length > 0}
	<div class={`alike_cont type-${type}`}>
		{#each visibleSubs as sub, index (sub.platform)}
			<SubscriptionBadge {game} {sub} {type} {language} showActions={index === 0} />
		{/each}
	</div>
{:else if type === 3 && showNoInfoBar}
	<NoInfoBar gameName={game.name} sid={game.sid} {language} />
{/if}
