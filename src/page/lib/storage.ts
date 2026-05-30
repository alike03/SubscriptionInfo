import browser from 'webextension-polyfill';

import type { ExtensionOptions, Platform } from '$lib/types';

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
	language: 'en'
};

export async function getOptions(): Promise<ExtensionOptions> {
	try {
		const result = await browser.storage.sync.get('aSub_options');
		const data = result?.aSub_options as { options?: Partial<ExtensionOptions> } | undefined;
		if (data?.options) {
			return {
				...defaultOptions,
				...data.options,
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

export async function togglePlatform(platform: Platform, enabled: boolean): Promise<void> {
	const options = await getOptions();
	options.enabled[platform] = enabled;
	await saveOptions(options);
}

export async function setTimeFrame(timeFrame: number): Promise<void> {
	const options = await getOptions();
	options.timeFrame = timeFrame;
	await saveOptions(options);
}

export async function setShowNoInfoBar(show: boolean): Promise<void> {
	const options = await getOptions();
	options.showNoInfoBar = show;
	await saveOptions(options);
}