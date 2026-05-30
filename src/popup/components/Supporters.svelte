<script lang="ts">
	import { onMount, tick } from 'svelte';

	type Contributor = {
		name: string;
		amount: number;
		currency: string;
	};

	type ContributorsPayload = {
		supporter?: Contributor[];
	};

	type RuntimeWithGetUrl = {
		runtime?: {
			getURL?: (path: string) => string;
		};
	};

	const PIXELS_PER_SECOND = 30;

	let supporters: Contributor[] = [];
	let isLoading = true;
	let loadError = false;
	let tickerTrackElement: HTMLDivElement | null = null;
	let tickerDurationSeconds = 24;

	$: tickerSupporters = supporters.length > 0 ? [...supporters, ...supporters] : [];
	$: if (tickerTrackElement && supporters.length > 0) {
		void syncTickerDuration();
	}

	function formatSupporter(supporter: Contributor) {
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

	function getContributorsUrl() {
		if (import.meta.env.DEV) {
			return new URL('/contributors.json', 'http://localhost:5173').toString();
		}

		const runtimes = globalThis as typeof globalThis & {
			browser?: RuntimeWithGetUrl;
			chrome?: RuntimeWithGetUrl;
		};

		return (
			runtimes.browser?.runtime?.getURL?.('contributors.json') ??
			runtimes.chrome?.runtime?.getURL?.('contributors.json') ??
			new URL('/contributors.json', window.location.origin).toString()
		);
	}

	onMount(async () => {
		try {
			const response = await fetch(getContributorsUrl());

			if (!response.ok) {
				throw new Error(`Failed to fetch contributors: ${response.status}`);
			}

			const payload = (await response.json()) as ContributorsPayload;

			supporters =
				payload.supporter?.map((supporter) => ({
					...supporter,
					name: supporter.name.trim(),
				})) ?? [];
		} catch (error) {
			loadError = true;
			console.error('Failed to load supporters ticker:', error);
		} finally {
			isLoading = false;
		}
	});
</script>

<svelte:window on:resize={handleWindowResize} />

<section class="mt-3 overflow-hidden">
	<div class="mb-3">
		<h4 class="text-sm font-semibold text-main">Supporters</h4>
		<p class="mt-1 text-xs text-dim">Thanks to everyone who has contributed to the project.</p>
	</div>

	{#if tickerSupporters.length > 0}
		<div class="ticker-shell">
			<div
				bind:this={tickerTrackElement}
				class="ticker-track"
				style={`animation-duration: ${tickerDurationSeconds}s;`}
			>
				{#each tickerSupporters as supporter, index}
					<div class="ticker-pill" aria-hidden={index >= supporters.length}>
						<span class="ticker-name">{supporter.name}</span>
						<span class="ticker-amount">{formatSupporter(supporter)}</span>
					</div>
				{/each}
			</div>
		</div>
	{:else if isLoading}
		<p class="text-xs text-dim">Loading supporters...</p>
	{:else if loadError}
		<p class="text-xs text-dim">Supporter list unavailable right now.</p>
	{:else}
		<p class="text-xs text-dim">No supporters listed yet.</p>
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
		font-size: 0.75rem;
		font-weight: 600;
	}

	.ticker-amount {
		color: rgb(161 205 68);
		font-size: 0.75rem;
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