<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Tabs from '$lib/components/Tabs.svelte';
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

	$: languageTabs = languageOptions.map((language) => ({
		id: language,
		label: translations.languages[language],
	}));

	$: timeFrameTabs = timeFrameOptions.map((timeFrameOption) => ({
		id: String(timeFrameOption.value),
		label: translations.options[timeFrameOption.labelKey],
	}));

	function handleLanguageSelect(language: string) {
		dispatch('languagechange', language as Language);
	}

	function handleTimeFrameSelect(timeFrame: string) {
		dispatch('timeframechange', Number(timeFrame));
	}
</script>

<div class="space-y-3 border-b border-hover bg-card px-4 py-3">
	<div>
		<h2 class="text-sm font-semibold text-main">{translations.options.title}</h2>
	</div>

	<section class="rounded-2xl border border-white/8 bg-section/70 p-2.5">
		<div class="flex items-start justify-between gap-3">
			<div class="max-w-[13rem]">
				<h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{translations.options.languageTitle}</h3>
				<p class="mt-1 text-[11px] text-dim">{translations.options.languageSubtitle}</p>
			</div>

			<div class="w-64">
				<Tabs
					activeTab={options.language}
					tabs={languageTabs}
					ariaLabel={translations.options.languageTitle}
					on:select={(event) => handleLanguageSelect(event.detail)}
				/>
			</div>
		</div>

		<div class="mt-3 border-t border-white/6 pt-3">
			<div class="flex items-start justify-between gap-3">
				<div class="max-w-[13rem]">
					<h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{translations.options.timeFrameTitle}</h3>
					<p class="mt-1 text-[11px] text-dim">{translations.options.timeFrameSubtitle}</p>
				</div>

				<div class="w-64">
					<Tabs
						activeTab={String(options.timeFrame)}
						tabs={timeFrameTabs}
						ariaLabel={translations.options.timeFrameTitle}
						on:select={(event) => handleTimeFrameSelect(event.detail)}
					/>
				</div>
			</div>
		</div>

		<div class="mt-3 border-t border-white/6 pt-3">
			<div class="flex items-center justify-between gap-3">
				<div class="max-w-[13rem]">
					<h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{translations.options.displayTitle}</h3>
					<p class="mt-1 text-[11px] text-dim">{translations.options.displaySubtitle}</p>
				</div>
				<button
					type="button"
					class="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-main transition-colors duration-200"
					aria-pressed={options.showNoInfoBar}
					on:click={() => dispatch('togglenoinfobar')}
				>
					<span
						class={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors duration-200 ${
							options.showNoInfoBar ? 'bg-primary/60' : 'bg-white/10'
						}`}
					>
						<span
							class={`h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
								options.showNoInfoBar ? 'translate-x-4' : 'translate-x-0'
							}`}
						></span>
					</span>
				</button>
			</div>
		</div>

		<div class="mt-3 border-t border-white/6 pt-3">
			<div class="mb-2 max-w-[13rem]">
				<h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{translations.options.platformsTitle}</h3>
				<p class="mt-1 text-[11px] text-dim">{translations.options.platformsSubtitle}</p>
			</div>

			<div class="flex items-stretch gap-2">
				{#each platforms as item}
					<button
						class={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition-all duration-200 ease-out ${
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
		</div>
	</section>
</div>

<Support {translations} />
