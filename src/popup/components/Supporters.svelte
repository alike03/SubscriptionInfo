<script lang="ts">
	import { fetchSupporters } from '$lib/api';
	import { onMount, tick } from 'svelte';
	import type { Supporter } from '$lib/api';
	import type { Translations } from '$lib/i18n';

	const PIXELS_PER_SECOND = 30;

	export let translations: Translations['supporters'];

	let supporters: Supporter[] = [];
	let isLoading = true;
	let loadError = false;
	let tickerTrackElement: HTMLDivElement | null = null;
	let tickerDurationSeconds = 24;

	$: tickerSupporters = supporters.length > 0 ? [...supporters, ...supporters] : [];
	$: if (tickerTrackElement && supporters.length > 0) {
		void syncTickerDuration();
	}

	function formatSupporter(supporter: Supporter) {
		return `${supporter.currency}${supporter.amount}`;
	}

	async function syncTickerDuration() {
		await tick();

		if (!tickerTrackElement || supporters.length === 0) {
			return;
		}

		const singleLoopWidth = tickerTrackElement.scrollWidth / 2;
		tickerDurationSeconds = singleLoopWidth / PIXELS_PER_SECOND;
	}

	function handleWindowResize() {
		void syncTickerDuration();
	}

	onMount(async () => {
		try {
			supporters = await fetchSupporters();
		} catch (error) {
			loadError = true;
			console.error('Failed to load supporters ticker:', error);
		} finally {
			isLoading = false;
		}
	});
</script>

<svelte:window on:resize={handleWindowResize} />

<section class="mt-5 overflow-hidden">
	<div class="mb-3 flex items-center justify-between">
		<h4 class="text-xs font-bold uppercase tracking-label text-dim">{translations.title}</h4>
		<span
			class="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xxs font-bold uppercase tracking-tag text-primary"
		>{translations.badge}</span>
	</div>

	{#if tickerSupporters.length > 0}
		<div class="ticker-shell">
			<div
				bind:this={tickerTrackElement}
				class="ticker-track"
				style={`animation-duration: ${tickerDurationSeconds}s;`}
			>
				{#each tickerSupporters as supporter, index (index)}
					<div class="ticker-pill" aria-hidden={index >= supporters.length}>
						<span class="ticker-name">{supporter.name}</span>
						<span class="ticker-amount">{formatSupporter(supporter)}</span>
					</div>
				{/each}
			</div>
		</div>
	{:else if isLoading}
		<p class="text-xs text-dim">{translations.loading}</p>
	{:else if loadError}
		<p class="text-xs text-dim">{translations.unavailable}</p>
	{:else}
		<p class="text-xs text-dim">{translations.empty}</p>
	{/if}
</section>

<style>
	.ticker-shell {
		overflow: hidden;
		mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
	}

	.ticker-track {
		display: flex;
		width: max-content;
		gap: 0.625rem;
		animation: supporters-marquee 28s linear infinite;
	}

	.ticker-track:hover {
		animation-play-state: paused;
	}

	.ticker-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid rgb(255 255 255 / 0.08);
		background: rgb(255 255 255 / 0.04);
		border-radius: 999px;
		padding: 0.45rem 0.75rem;
		white-space: nowrap;
	}

	.ticker-name {
		color: rgb(243 243 243);
		font-size: 0.6875rem;
		font-weight: 600;
	}

	.ticker-amount {
		color: rgb(161 205 68);
		font-size: 0.6875rem;
		font-weight: 700;
	}

	@keyframes supporters-marquee {
		from {
			transform: translateX(0);
		}

		to {
			transform: translateX(-50%);
		}
	}
</style>