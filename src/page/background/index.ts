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

type BackgroundMessage = FetchGameMessage;

const gameCache = new Map<number, Game>();
const CACHE_DURATION = 15 * 60 * 1000;
let lastCacheTime = 0;

browser.runtime.onMessage.addListener(
	(message: unknown, _sender: Runtime.MessageSender): Promise<unknown> | undefined => {
		const msg = message as BackgroundMessage;

		switch (msg.type) {
			case 'fetch-game':
				return handleFetchGame(msg.data.ids);
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

console.log("[alike03's Subscription Info] Extension loaded");
