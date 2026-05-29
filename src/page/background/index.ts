import browser from 'webextension-polyfill';
import type { Runtime } from 'webextension-polyfill';

import { fetchGamesByIds } from '$lib/api';
import { getOptions } from '$lib/storage';
import type { Game } from '$lib/types';

interface FetchGameMessage {
	type: 'fetch-game';
	data: {
		ids: number[];
	};
}

interface LegacyFetchMessage {
	type: 'fetch-pass' | 'fetch-menu';
	data: Record<string, unknown>;
}

interface LegacyMenuCache {
	data: unknown;
	timestamp: number;
}

type BackgroundMessage = FetchGameMessage | LegacyFetchMessage;
type LegacyRoute = 'pass' | 'menu';

const gameCache = new Map<number, Game>();
const CACHE_DURATION = 15 * 60 * 1000;
let lastCacheTime = 0;
const LEGACY_API_BASE = 'https://aligueler.com/SubscriptionInfo/ajax';

browser.runtime.onMessage.addListener(
	(message: unknown, _sender: Runtime.MessageSender): Promise<unknown> | undefined => {
		const msg = message as BackgroundMessage;

		switch (msg.type) {
			case 'fetch-game':
				return handleFetchGame(msg.data.ids);
			case 'fetch-pass':
				return fetchLegacyData(msg.data, 'pass');
			case 'fetch-menu':
				return handleLegacyMenu(msg.data);
			default:
				return undefined;
		}
	}
);

async function handleFetchGame(ids: number[]): Promise<Game[]> {
	if (Date.now() - lastCacheTime > CACHE_DURATION) {
		gameCache.clear();
		lastCacheTime = Date.now();
	}

	const cachedGames: Game[] = [];
	const uncachedIds: number[] = [];

	for (const id of ids) {
		const cached = gameCache.get(id);
		if (cached) {
			cachedGames.push(cached);
		} else {
			uncachedIds.push(id);
		}
	}

	if (uncachedIds.length > 0) {
		try {
			const options = await getOptions();
			const fetchedGames = await fetchGamesByIds(uncachedIds, options);

			for (const game of fetchedGames) {
				gameCache.set(game.sid, game);
				cachedGames.push(game);
			}
		} catch (error) {
			console.error('Error fetching games:', error);
		}
	}

	return cachedGames;
}

async function handleLegacyMenu(data: Record<string, unknown>): Promise<unknown> {
	try {
		const result = await browser.storage.session.get('menu');
		const menu = result.menu as LegacyMenuCache | undefined;

		if (menu?.timestamp && menu.timestamp > Date.now() - CACHE_DURATION) {
			return menu.data;
		}
	} catch (error) {
		console.error('Error reading legacy menu cache:', error);
	}

	return fetchLegacyData(data, 'menu');
}

async function fetchLegacyData(
	data: Record<string, unknown>,
	route: LegacyRoute
): Promise<unknown> {
	const payload = await buildLegacyPayload(data);

	try {
		const response = await fetch(`${LEGACY_API_BASE}/${route}data.php`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw new Error(`Legacy API error: ${response.status}`);
		}

		const jsonData = (await response.json()) as unknown;

		if (route === 'menu') {
			await browser.storage.session.set({
				menu: { data: jsonData, timestamp: Date.now() } satisfies LegacyMenuCache
			});
		}

		return jsonData;
	} catch (error) {
		console.error(`Error fetching legacy ${route} data:`, error);
		return null;
	}
}

async function buildLegacyPayload(data: Record<string, unknown>): Promise<Record<string, unknown>> {
	const options = await getOptions();
	const disabledPlatforms = Object.entries(options.enabled)
		.filter(([, enabled]) => enabled === false)
		.map(([platform]) => platform);

	return {
		...data,
		...(disabledPlatforms.length > 0 ? { ec: disabledPlatforms } : {}),
		v: browser.runtime.getManifest().version.replaceAll('.', '-')
	};
}

console.log("[alike03's Subscription Info] Extension loaded");
