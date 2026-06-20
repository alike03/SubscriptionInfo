<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ExternalLink } from 'lucide-svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import type { Translations } from '$lib/i18n';
	import Support from './Support.svelte';

	const LANGUAGE_REQUEST_URL = 'https://sub.aligueler.com/language';

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

<section class="border-b border-hover bg-card px-4 py-4">
	<div class="flex flex-col gap-5">
		<div>
			<h3 class="mb-2.5 text-xs font-bold uppercase tracking-label text-dim">{translations.options.platformsTitle}</h3>
			<div class="flex flex-wrap items-stretch gap-2">
				{#each platforms as item (item.platform)}
					<button
						class={`flex min-w-33 flex-1 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-all duration-200 ease-out ${
							options.enabled[item.platform]
								? 'border-primary/40 bg-primary/8 text-main'
								: 'border-white/8 bg-card/60 text-dim hover:-translate-y-0.5 hover:border-primary/30 hover:text-main'
						}`}
						on:click={() => dispatch('platformtoggle', item.platform)}
					>
						<div
							class={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-xs transition-colors duration-200 ${
								options.enabled[item.platform] ? item.details.bg : 'bg-white/8'
							}`}
						>
							<img src={item.details.icon} alt={item.details.name} class="h-3 w-3" />
						</div>
						<p class="min-w-0 text-xs font-semibold leading-tight">{item.details.name}</p>
					</button>
				{/each}
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<h3 class="mb-2.5 text-xs font-bold uppercase tracking-label text-dim">{translations.options.languageTitle}</h3>
				<Tabs
					activeTab={options.language}
					tabs={languageTabs}
					ariaLabel={translations.options.languageTitle}
					on:select={(event) => handleLanguageSelect(event.detail)}
				/>
			</div>
			<div>
				<h3 class="mb-2.5 text-xs font-bold uppercase tracking-label text-dim">{translations.options.timeFrameTitle}</h3>
				<Tabs
					activeTab={String(options.timeFrame)}
					tabs={timeFrameTabs}
					ariaLabel={translations.options.timeFrameTitle}
					on:select={(event) => handleTimeFrameSelect(event.detail)}
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<a
				href={LANGUAGE_REQUEST_URL}
				target="_blank"
				rel="noreferrer"
				class="flex items-center justify-between gap-4 rounded-md border border-white/8 bg-section/50 p-3.5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30"
			>
				<div class="min-w-0">
					<h3 class="text-xs font-bold uppercase tracking-label text-dim">{translations.options.requestLanguageTitle}</h3>
					<p class="mt-1.5 text-xs text-dim">{translations.options.requestLanguageSubtitle}</p>
				</div>
				<span
					class="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/12 px-3 py-2 text-xs font-extrabold text-primary"
				>
					{translations.options.requestLanguageAction}
					<ExternalLink class="h-3.5 w-3.5" />
				</span>
			</a>

			<div class="flex items-center justify-between gap-4 rounded-md border border-white/8 bg-section/50 p-3.5">
				<div class="min-w-0">
					<h3 class="text-xs font-bold uppercase tracking-label text-dim">{translations.options.displayTitle}</h3>
					<p class="mt-1.5 text-xs text-dim">{translations.options.displaySubtitle}</p>
				</div>
				<button
					type="button"
					class="inline-flex shrink-0 cursor-pointer items-center"
					aria-pressed={options.showNoInfoBar}
					on:click={() => dispatch('togglenoinfobar')}
				>
					<span
						class={`flex h-5.5 w-9.5 items-center rounded-full px-0.5 transition-colors duration-200 ${
							options.showNoInfoBar ? 'bg-primary/55' : 'bg-white/10'
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
	</div>
</section>

<Support {translations} />
