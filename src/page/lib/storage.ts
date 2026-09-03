import browser from 'webextension-polyfill';

import type { ExtensionOptions, Language } from '$lib/types';

export const defaultOptions: ExtensionOptions = {
	enabled: {
		gamepasspc: true,
		gamepasscon: true,
		ubiplus: true,
		eaplay: true,
		eaplaypro: true
	},
	timeFrame: 30,
	showNoInfoBar: true,
	language: 'en-US'
};

// Older versions stored bare codes; sync storage can still deliver them from an outdated install.
const legacyLanguages: Record<string, Language> = { en: 'en-US', de: 'de-DE', tr: 'tr-TR' };

export function normalizeLanguage(language: string | undefined): Language {
	if (!language) return defaultOptions.language;
	return legacyLanguages[language] ?? (language as Language);
}

export async function getOptions(): Promise<ExtensionOptions> {
	try {
		const result = await browser.storage.sync.get('aSub_options');
		const data = result?.aSub_options as { options?: Partial<ExtensionOptions> } | undefined;
		if (data?.options) {
			return {
				...defaultOptions,
				...data.options,
				language: normalizeLanguage(data.options.language),
				enabled: {
					...defaultOptions.enabled,
					...data.options.enabled
				}
			};
		}
		return defaultOptions;
	} catch (error) {
		console.error('Error loading options:', error);
		return defaultOptions;
	}
}

export async function saveOptions(options: ExtensionOptions): Promise<void> {
	try {
		await browser.storage.sync.set({ aSub_options: { options } });
	} catch (error) {
		console.error('Error saving options:', error);
	}
}
