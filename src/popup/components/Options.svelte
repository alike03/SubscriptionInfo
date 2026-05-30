<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Translations } from '$lib/i18n';
	import Support from './Support.svelte';

	import { getPlatformDetails, getPlatforms } from '$lib/data';
	import type { ExtensionOptions, Language, Platform } from '$lib/types';

	export let options: ExtensionOptions;
	export let translations: Translations;

	const dispatch = createEventDispatcher<{
		platformtoggle: Platform;
		timeframechange: number;
		togglenoinfobar: void;
		languagechange: Language;
	}>();

	const platforms = getPlatforms().map((platform) => ({
		platform,
		details: getPlatformDetails(platform),
	}));

	type TimeFrameLabelKey = 'timeFrame7' | 'timeFrame14' | 'timeFrame30';

	const timeFrameOptions: Array<{ value: number; labelKey: TimeFrameLabelKey }> = [
		{ value: 7, labelKey: 'timeFrame7' },
		{ value: 14, labelKey: 'timeFrame14' },
		{ value: 30, labelKey: 'timeFrame30' },
	];

	const languageOptions: Language[] = ['en', 'de', 'tr'];
</script>

<div class="space-y-3 border-b border-hover bg-card px-4 py-3">
	<div>
		<h2 class="text-sm font-semibold text-main">{translations.options.title}</h2>
	</div>

	<section class="rounded-2xl border border-white/8 bg-section/70 p-2.5">
		<div class="mb-2">
			<h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{translations.options.languageTitle}</h3>
			<p class="mt-1 text-[11px] text-dim">{translations.options.languageSubtitle}</p>
		</div>

		<div class="grid grid-cols-3 gap-2">
			{#each languageOptions as languageOption}
				<button
					class={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${
						options.language === languageOption
							? 'border-primary/35 bg-primary/15 text-main shadow-[0_12px_24px_-18px_rgba(161,205,68,0.9)]'
							: 'border-white/8 bg-card/70 text-dim hover:-translate-y-0.5 hover:border-primary/25 hover:text-main'
					}`}
					on:click={() => dispatch('languagechange', languageOption)}
				>
					{translations.languages[languageOption]}
				</button>
			{/each}
		</div>
	</section>

	<section class="rounded-2xl border border-white/8 bg-section/70 p-2.5">
		<div class="mb-2">
			<h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{translations.options.timeFrameTitle}</h3>
			<p class="mt-1 text-[11px] text-dim">{translations.options.timeFrameSubtitle}</p>
		</div>

		<div class="grid grid-cols-3 gap-2">
			{#each timeFrameOptions as timeFrameOption}
				<button
					class={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${
						options.timeFrame === timeFrameOption.value
							? 'border-primary/35 bg-primary/15 text-main shadow-[0_12px_24px_-18px_rgba(161,205,68,0.9)]'
							: 'border-white/8 bg-card/70 text-dim hover:-translate-y-0.5 hover:border-primary/25 hover:text-main'
					}`}
					on:click={() => dispatch('timeframechange', timeFrameOption.value)}
				>
					{translations.options[timeFrameOption.labelKey]}
				</button>
			{/each}
		</div>
	</section>

	<section class="rounded-2xl border border-white/8 bg-section/70 p-2.5">
		<div class="mb-2">
			<h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{translations.options.platformsTitle}</h3>
			<p class="mt-1 text-[11px] text-dim">{translations.options.platformsSubtitle}</p>
		</div>

		<div class="grid grid-cols-5 gap-1.5">
			{#each platforms as item}
				<button
					class={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2 text-center transition-all duration-200 ease-out ${
						options.enabled[item.platform]
							? `${item.details.bg} border-white/0 text-white shadow-[0_14px_28px_-18px_rgba(0,0,0,0.7)]`
							: 'border-white/8 bg-card/70 text-dim hover:-translate-y-0.5 hover:border-primary/25 hover:text-main'
					}`}
					on:click={() => dispatch('platformtoggle', item.platform)}
				>
					<div
						class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
							options.enabled[item.platform] ? 'bg-white/15' : 'bg-white/5'
						}`}
					>
						<img
							src={item.details.icon}
							alt={item.details.name}
							class="h-3.5 w-3.5"
						/>
					</div>
					<p class="min-w-0 text-[11px] font-medium leading-tight">{item.details.name}</p>
				</button>
			{/each}
		</div>
	</section>

	<section class="rounded-2xl border border-white/8 bg-section/70 p-2.5">
		<div class="flex items-center justify-between gap-3">
			<div>
				<h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{translations.options.displayTitle}</h3>
				<p class="mt-1 text-[11px] text-dim">{translations.options.displaySubtitle}</p>
			</div>
			<button
				type="button"
				class={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-semibold transition-all duration-200 ease-out ${
					options.showNoInfoBar
						? 'border-primary/35 bg-primary/15 text-main'
						: 'border-white/8 bg-card/70 text-dim hover:border-primary/25 hover:text-main'
				}`}
				aria-pressed={options.showNoInfoBar}
				on:click={() => dispatch('togglenoinfobar')}
			>
				<span
					class={`flex h-4.5 w-8 items-center rounded-full px-0.5 transition-colors duration-200 ${
						options.showNoInfoBar ? 'bg-primary/25' : 'bg-white/10'
					}`}
				>
					<span
						class={`h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 ${
							options.showNoInfoBar ? 'translate-x-4' : 'translate-x-0'
						}`}
					></span>
				</span>
				<span>{options.showNoInfoBar ? translations.options.shown : translations.options.hidden}</span>
			</button>
		</div>
	</section>
</div>

<Support {translations} />