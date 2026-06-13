<script lang="ts">
	import type { Game } from '$lib/types';
	import type { Language } from '$lib/types';

	import SubscriptionBadge from './SubscriptionBadge.svelte';

	export let game: Game;
	export let type: number;
	export let language: Language;
</script>

<div class={`alike_cont type-${type}`}>
	{#each game.subs as sub (sub.platform)}
		<SubscriptionBadge {game} {sub} {type} {language} />
	{/each}
</div>
