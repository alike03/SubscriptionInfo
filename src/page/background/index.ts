import browser from 'webextension-polyfill';

import { fetchGamesByIds } from '$lib/api';
import { getOptions } from '$lib/storage';
import type { Game } from '$lib/types';

const CACHE_TTL_MS = 15 * 60 * 1000;

interface FetchGameMessage {
	type: 'fetch-game';
	data: {
		ids: number[];
	};
}

type BackgroundMessage = FetchGameMessage;

interface CachedGame {
	game: Game;
	expiresAt: number;
}

const gameCache = new Map<number, CachedGame>();

browser.runtime.onMessage.addListener(
	(message: unknown): Promise<Game[]> | undefined => {
		if (isBackgroundMessage(message)) {
			switch (message.type) {
			case 'fetch-game':
				return handleFetchGame(message.data.ids);
			}
		}

		return undefined;
	}
);

async function handleFetchGame(ids: number[]): Promise<Game[]> {
	const requestedIds = [...new Set(ids.filter(isValidSteamId))];
	if (requestedIds.length === 0) return [];

	const uncachedIds: number[] = [];
	const now = Date.now();

	for (const id of requestedIds) {
		const cached = getCachedGame(id, now);
		if (!cached) {
			uncachedIds.push(id);
		}
	}

	if (uncachedIds.length > 0) {
		try {
			const options = await getOptions();
			const fetchedGames = await fetchGamesByIds(uncachedIds, options);

			for (const game of fetchedGames) {
				setCachedGame(game);
			}
		} catch (error) {
			console.error('Error fetching games:', error);
		}
	}

	return requestedIds
		.map((id) => getCachedGame(id))
		.filter((game): game is Game => Boolean(game));
}

function isBackgroundMessage(message: unknown): message is BackgroundMessage {
	if (!isRecord(message) || message.type !== 'fetch-game') {
		return false;
	}

	const data = message.data;
	return isRecord(data) && Array.isArray(data.ids) && data.ids.every(isValidSteamId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isValidSteamId(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function getCachedGame(id: number, now = Date.now()): Game | undefined {
	const cached = gameCache.get(id);
	if (!cached) return undefined;

	if (cached.expiresAt <= now) {
		gameCache.delete(id);
		return undefined;
	}

	return cached.game;
}

function setCachedGame(game: Game) {
	gameCache.set(game.sid, {
		game,
		expiresAt: Date.now() + CACHE_TTL_MS
	});
}

console.log("[alike03's Subscription Info] Extension loaded");
