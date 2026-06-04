<script lang="ts">
	import { onMount, tick } from 'svelte';
	import SubscriptionBadges from '$lib/components/SubscriptionBadges.svelte';
	import type { Game, Language } from '$lib/types';

	export let game: Game;
	export let language: Language;

	const TITLE_SCROLL_SPEED_PX_PER_SECOND = 50;

	let titleFrame: HTMLDivElement;
	let titleText: HTMLHeadingElement;
	let titleTravel = 0;
	let titleDuration = 0;
	let isTitleOverflowing = false;

	$: if (game.name) {
		void measureTitleOverflow();
	}

	async function measureTitleOverflow() {
		await tick();
		updateTitleOverflow();
	}

	function updateTitleOverflow() {
		if (!titleFrame || !titleText) return;

		titleTravel = Math.max(0, titleText.scrollWidth - titleFrame.clientWidth);
		isTitleOverflowing = titleTravel > 1;
		titleDuration = titleTravel / TITLE_SCROLL_SPEED_PX_PER_SECOND;
	}

	onMount(() => {
		void measureTitleOverflow();

		if (typeof ResizeObserver === 'undefined') {
			return;
		}

		const resizeObserver = new ResizeObserver(updateTitleOverflow);
		resizeObserver.observe(titleFrame);

		return () => resizeObserver.disconnect();
	});
</script>

<div class="group h-full rounded-md bg-card p-2.5 transition-colors hover:bg-section sm:p-3">
	<div
		class="relative aspect-2/3 overflow-hidden rounded-sm transition-[filter] group-hover:brightness-125"
	>
		<img src={game.poster} alt={game.name} class="h-full w-full object-cover" />
	</div>

	<div>
		<div
			bind:this={titleFrame}
			class={`title-frame relative -mx-2.5 my-2 min-w-0 overflow-hidden before:absolute before:inset-0 before:z-10 before:pointer-events-none before:transition-opacity before:duration-200 before:ease-out after:absolute after:inset-0 after:z-10 after:pointer-events-none after:opacity-0 after:transition-opacity after:duration-200 after:ease-out ${
				isTitleOverflowing
					? 'before:opacity-100 group-hover:after:opacity-100 group-focus-within:after:opacity-100'
					: 'before:opacity-0'
			}`}
		>
			<h2
				bind:this={titleText}
				class:title-track--scrolling={isTitleOverflowing}
				class="title-track box-border m-0 w-max min-w-full max-w-none translate-x-0 whitespace-nowrap px-2.5 text-lg font-semibold leading-7 transition-transform delay-300 ease-linear will-change-transform"
				style={`--title-travel: ${titleTravel}px; --title-duration: ${titleDuration}s;`}
			>
				{game.name}
			</h2>
		</div>

		<SubscriptionBadges subs={game.subs} {language} />
	</div>
</div>

<style>
	.title-track {
		transition-duration: var(--title-duration);
	}

	.title-frame::before {
		content: '';
		background: linear-gradient(
			90deg,
			rgb(14 20 27) 0,
			rgb(14 20 27 / 0) calc(var(--spacing) * 2.5),
			rgb(14 20 27 / 0) calc(100% - calc(var(--spacing) * 2.5)),
			rgb(14 20 27) 100%
		);
	}

	.title-frame::after {
		content: '';
		background: linear-gradient(
			90deg,
			rgb(30 35 41) 0,
			rgb(30 35 41 / 0) calc(var(--spacing) * 2.5),
			rgb(30 35 41 / 0) calc(100% - calc(var(--spacing) * 2.5)),
			rgb(30 35 41) 100%
		);
	}

	.group:hover .title-track--scrolling,
	.group:focus-within .title-track--scrolling {
		transform: translateX(calc(-1 * var(--title-travel)));
	}

	@media (prefers-reduced-motion: reduce) {
		.title-track {
			transition-duration: 0s;
			transition-delay: 0s;
		}

		.group:hover .title-track--scrolling,
		.group:focus-within .title-track--scrolling {
			transform: translateX(calc(-1 * var(--title-travel)));
		}
	}
</style>
