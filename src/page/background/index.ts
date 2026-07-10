import browser from 'webextension-polyfill';

import { fetchGamesByIds, submitErrorReport } from '$lib/api';
import type { ErrorReportPayload } from '$lib/api';
import { getOptions } from '$lib/storage';
import type { Game } from '$lib/types';

const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_SIZE = 500;

interface FetchGameMessage {
	type: 'fetch-game';
	data: {
		ids: number[];
	};
}

interface ReportErrorMessage {
	type: 'report-error';
	data: ErrorReportPayload;
}

type BackgroundMessage = FetchGameMessage | ReportErrorMessage;

interface CachedGame {
	game: Game;
	expiresAt: number;
}

const gameCache = new Map<number, CachedGame>();

browser.storage.onChanged.addListener((changes, areaName) => {
	if (areaName === 'sync' && changes.aSub_options) {
		gameCache.clear();
	}
});

browser.runtime.onMessage.addListener(
	(message: unknown): Promise<Game[]> | Promise<{ ok: boolean }> | undefined => {
		if (isBackgroundMessage(message)) {
			switch (message.type) {
			case 'fetch-game':
				return handleFetchGame(message.data.ids);
			case 'report-error':
				return handleReportError(message.data);
			}
		}

		return undefined;
	}
);

async function handleReportError(data: ErrorReportPayload): Promise<{ ok: boolean }> {
	return { ok: await submitErrorReport(data) };
}

async function handleFetchGame(ids: number[]): Promise<Game[]> {
	const requestedIds = [...new Set(ids.filter(isValidSteamId))];
	if (requestedIds.length === 0) return [];

	const uncachedIds: number[] = [];
	const now = Date.now();
	pruneExpiredGames(now);

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

function pruneExpiredGames(now = Date.now()) {
	for (const [id, cached] of gameCache.entries()) {
		if (cached.expiresAt <= now) {
			gameCache.delete(id);
		}
	}
}

function isBackgroundMessage(message: unknown): message is BackgroundMessage {
	if (!isRecord(message)) {
		return false;
	}

	const data = message.data;
	if (message.type === 'fetch-game') {
		return isRecord(data) && Array.isArray(data.ids) && data.ids.every(isValidSteamId);
	}
	if (message.type === 'report-error') {
		return (
			isRecord(data) &&
			typeof data.sid === 'number' &&
			typeof data.game === 'string' &&
			typeof data.url === 'string' &&
			typeof data.message === 'string' &&
			data.message.trim().length > 0
		);
	}

	return false;
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
	if (gameCache.has(game.sid)) {
		gameCache.delete(game.sid);
	}

	gameCache.set(game.sid, {
		game,
		expiresAt: Date.now() + CACHE_TTL_MS
	});

	while (gameCache.size > MAX_CACHE_SIZE) {
		const oldestCacheKey = gameCache.keys().next().value;
		if (oldestCacheKey === undefined) {
			break;
		}

		gameCache.delete(oldestCacheKey);
	}
}
