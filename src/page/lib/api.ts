import { getPlatforms } from '$lib/data';
import type { ExtensionOptions, Game } from '$lib/types';

const WEB_API_BASE = 'https://sub.aligueler.com';

interface GameAPIResponse {
	games: Game[];
}

export interface Supporter {
	name: string;
	amount: number;
	currency: string;
}

interface ChangesAPIResponse {
	added: Game[];
	left: Game[];
	coming: Game[];
	leaving: Game[];
}

type SupportersAPIResponse =
	| Supporter[]
	| {
		supporter?: Supporter[];
	};

export async function fetchGamesByIds(
	steamIds: number[],
	options?: ExtensionOptions
): Promise<Game[]> {
	if (steamIds.length === 0) return [];

	try {
		let exclude = '';
		if (options?.enabled) {
			const excludedPlatforms = getPlatforms().filter((platform) => options.enabled[platform] === false);
			if (excludedPlatforms.length > 0) {
				exclude = excludedPlatforms.join(',');
			}
		}

		const url = new URL(`${WEB_API_BASE}/api/game`);
		url.searchParams.set('steamId', steamIds.join(','));
		if (exclude) {
			url.searchParams.set('exclude', exclude);
		}

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data: GameAPIResponse = await response.json();
		return data.games || [];
	} catch (error) {
		console.error('Error fetching games:', error);
		return [];
	}
}

export async function fetchAllChanges(
	timeFrame = 30,
	options?: ExtensionOptions
): Promise<ChangesAPIResponse> {
	try {
		let exclude = '';
		if (options?.enabled) {
			const excludedPlatforms = getPlatforms().filter((platform) => options.enabled[platform] === false);
			if (excludedPlatforms.length > 0) {
				exclude = excludedPlatforms.join(',');
			}
		}

		const url = new URL(`${WEB_API_BASE}/api/changes`);
		url.searchParams.set('timeFrame', timeFrame.toString());
		if (exclude) {
			url.searchParams.set('exclude', exclude);
		}

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data: ChangesAPIResponse = await response.json();
		return {
			added: data.added || [],
			left: data.left || [],
			coming: data.coming || [],
			leaving: data.leaving || []
		};
	} catch (error) {
		console.error('Error fetching all changes:', error);
		return { added: [], left: [], coming: [], leaving: [] };
	}
}

export async function fetchSupporters(): Promise<Supporter[]> {
	const url = new URL('/api/supporters', WEB_API_BASE);
	const response = await fetch(url.toString());

	if (!response.ok) {
		throw new Error(`API error: ${response.status}`);
	}

	const data = (await response.json()) as SupportersAPIResponse;
	const supporters = Array.isArray(data) ? data : data.supporter ?? [];

	return supporters
		.map((supporter) => ({
			name: supporter.name.trim(),
			amount: supporter.amount,
			currency: supporter.currency
		}))
		.filter((supporter) => supporter.name.length > 0);
}