import browser from 'webextension-polyfill';
import type { Storage } from 'webextension-polyfill';

import { defaultOptions, getOptions } from '$lib/storage';
import { throttle, waitForElement } from '$lib/utils';
import type { ExtensionOptions, Game, Language } from '$lib/types';
import SubscriptionMount from './components/SubscriptionMount.svelte';
import NoInfoBar from './components/NoInfoBar.svelte';
import './content.css';

const SEARCH_RESULTS_SELECTOR = '#search_resultsRows a[data-ds-appid]';
const WISHLIST_RESULTS_SELECTOR =
	'#StoreTemplate .Panel .Panel a[href*="/app/"]';
const SALE_WIDGET_SELECTOR =
	'[class^="salepreviewwidgets_"]:not(.alike_sub), .SaleSectionContainer:not(.alike_sub) .Panel';
// Intentionally matches already-tagged (.alike_sub) elements too: Steam recycles
// capsule DOM nodes on infinite-scroll/dynamic-store pages and swaps their
// data-ds-appid, so we must re-inspect them to replace a now-stale badge.
// collectTargets() cheaply skips the ones whose appid is unchanged.
const DATA_APP_SELECTOR = '[data-ds-appid]:not(.gutter_item)';
const APP_DETAILS_SELECTOR = '.page_content_ctn > .page_content';
const SEARCH_DEBOUNCE_MS = 700;
const OBSERVER_THROTTLE_MS = 1000;
const DEFAULT_MOUNT_TYPE = 2;
const APP_PAGE_MOUNT_TYPE = 3;
const ROW_MOUNT_TYPE = 6;
const MAX_GAME_CACHE_SIZE = 500;

interface MountedComponent {
	$set(props: { language?: Language }): void;
	$destroy(): void;
}

interface FetchGameMessage {
	type: 'fetch-game';
	data: {
		ids: number[];
	};
}

const currentPath = window.location.pathname;
const pageSection = currentPath.split('/')[1] ?? '';
// Per-page-load cache of fetched games, keyed by Steam appid. Intentionally has
// no TTL (unlike the background worker's 15-min cache) — it lives only as long as
// the tab, so staleness is bounded by a page reload. Map insertion order doubles
// as the LRU list: touchGameCache() moves hits to the end, pruneGamesCache()
// evicts from the front.
const games = new Map<number, Game>();
const mountedTargets = new Map<HTMLElement, MountedComponent>();
let currentLanguage: Language = defaultOptions.language;
let showNoInfoBar = defaultOptions.showNoInfoBar;

async function init() {
	try {
		const options = await getOptions();
		currentLanguage = options.language;
		showNoInfoBar = options.showNoInfoBar;
	} catch (error) {
		console.error('Error loading initial options:', error);
	}

	browser.storage.onChanged.addListener(handleStorageChange);

	switch (pageSection) {
		case 'search':
			initSearchPage();
			break;
		case 'wishlist':
			initWishlistPage();
			break;
		case 'app':
			void initAppPage();
			break;
	}

	initGeneralObserver();
}

function initSearchPage() {
	void waitForElement(
		'.search_results #search_result_container #search_resultsRows',
	).then(() => {
		const reloadSearchResults = createDelayedRunner(() => {
			void loadGamesForIds(collectSearchTargets());
		}, SEARCH_DEBOUNCE_MS);

		window.addEventListener('popstate', reloadSearchResults);
		document.addEventListener('scroll', reloadSearchResults);

		const form = document.getElementById('advsearchform');
		form?.addEventListener('submit', reloadSearchResults);
		form?.addEventListener('keyup', (event) => {
			if (event.key === 'Enter') {
				reloadSearchResults();
			}
		});

		void loadGamesForIds(collectSearchTargets());
	});
}

function collectSearchTargets() {
	return collectTargets(
		Array.from(document.querySelectorAll<HTMLAnchorElement>(SEARCH_RESULTS_SELECTOR)),
		(element) => parseAppId(element.dataset.dsAppid),
	);
}

function initWishlistPage() {
	void waitForElement('#StoreTemplate .Panel input.Focusable').then((input) => {
		const reloadWishlistResults = createDelayedRunner(() => {
			void loadGamesForIds(collectWishlistTargets());
		}, SEARCH_DEBOUNCE_MS);

		input.addEventListener('keyup', reloadWishlistResults);
		document
			.getElementById('StoreTemplate')
			?.addEventListener('scroll', reloadWishlistResults);

		void loadGamesForIds(collectWishlistTargets());
	});
}

function collectWishlistTargets() {
	return collectTargets(
		Array.from(document.querySelectorAll<HTMLAnchorElement>(WISHLIST_RESULTS_SELECTOR)),
		(element) =>
			element.querySelector('img') ? parseAppIdFromUrl(element.href) : 0,
	);
}

async function initAppPage() {
	const appId = parseAppIdFromUrl(currentPath);
	if (!appId) return;

	const [game] = await fetchGames([appId]);

	const details = await waitForElement(APP_DETAILS_SELECTOR);

	// The API only returns games that are on at least one tracked subscription,
	// so a missing (or empty) result means "no info". Show the bar if enabled.
	if (!game || game.subs.length === 0) {
		if (showNoInfoBar) {
			mountNoInfoBar(details, game?.name);
		}
		return;
	}

	games.set(game.sid, game);

	const mountTarget = document.createElement('div');
	details.before(mountTarget);

	setupTarget(mountTarget, appId, APP_PAGE_MOUNT_TYPE);
	mountGame(game);
}

function mountNoInfoBar(details: Element, gameName?: string) {
	const name =
		gameName ??
		document.querySelector('#appHubAppName')?.textContent?.trim() ??
		'';

	const mountTarget = document.createElement('div');
	details.before(mountTarget);

	new NoInfoBar({
		target: mountTarget,
		props: { gameName: name, language: currentLanguage },
	});
}

function initGeneralObserver() {
	const observe = throttle(() => {
		cleanupDisconnectedTargets();
		const ids = [
			...collectSaleWidgetTargets(document),
			...collectDataAppTargets(document)
		];
		void loadGamesForIds(ids);
	}, OBSERVER_THROTTLE_MS);

	void waitForElement('body').then((body) => {
		const observer = new MutationObserver((mutations) => {
			// Only the presence of added nodes matters — the throttled observe()
			// re-scans the whole document, so we never use the node list itself.
			if (!mutations.some((mutation) => mutation.addedNodes.length > 0)) {
				cleanupDisconnectedTargets();
				return;
			}

			observe();
		});
		observer.observe(body, { childList: true, subtree: true });
		observe();
	});
}

function collectSaleWidgetTargets(root: ParentNode = document) {
	const ids: number[] = [];

	queryElements<HTMLElement>(root, SALE_WIDGET_SELECTOR)
		.forEach((element) => {
			if (element.closest('.alike_sub')) return;

			const link = element.querySelector<HTMLAnchorElement>('a[href*="/app/"]');
			const appId = parseAppIdFromUrl(link?.href ?? '');
			if (setupTarget(element, appId, getSaleWidgetType(element))) {
				ids.push(appId);
			}

			element.classList.add('alike_sub');
		});

	return ids;
}

function collectDataAppTargets(root: ParentNode = document) {
	return collectTargets(
		queryElements<HTMLElement>(root, DATA_APP_SELECTOR),
		(element) => parseAppId(element.dataset.dsAppid),
		getDataAppIdType,
	);
}

function collectTargets<TElement extends HTMLElement>(
	elements: Iterable<TElement>,
	getAppId: (element: TElement) => number,
	getType?: (element: TElement) => number,
) {
	const ids: number[] = [];
	const resolveType = getType ?? (() => ROW_MOUNT_TYPE);

	for (const element of elements) {
		const appId = getAppId(element);
		// Already processed for this exact appid — skip. Keeps the observer's
		// full-document re-scans cheap, while still letting a recycled element
		// whose appid CHANGED fall through to setupTarget (which unmounts the
		// stale badge and re-tags it for the new game).
		if (element.classList.contains('alike_sub') && element.dataset.subId === String(appId)) {
			continue;
		}
		if (setupTarget(element, appId, resolveType(element))) {
			ids.push(appId);
		}
	}

	return ids;
}

async function loadGamesForIds(ids: number[]) {
	const uniqueIds = [...new Set(ids.filter(isValidAppId))];
	if (uniqueIds.length === 0) return;

	const missingIds: number[] = [];

	for (const id of uniqueIds) {
		const cachedGame = games.get(id);
		if (cachedGame) {
			touchGameCache(id, cachedGame);
			mountGame(cachedGame);
		} else {
			missingIds.push(id);
		}
	}

	if (missingIds.length === 0) return;

	const fetchedGames = await fetchGames(missingIds);
	for (const game of fetchedGames) {
		games.set(game.sid, game);
		mountGame(game);
	}
	pruneGamesCache();
}

/** Mark a cache hit as most-recently-used by reinserting it at the Map's end. */
function touchGameCache(id: number, game: Game) {
	games.delete(id);
	games.set(id, game);
}

function pruneGamesCache() {
	while (games.size > MAX_GAME_CACHE_SIZE) {
		const oldestGameId = games.keys().next().value;
		if (oldestGameId === undefined) {
			break;
		}

		games.delete(oldestGameId);
	}
}

async function fetchGames(ids: number[]) {
	try {
		const response = await browser.runtime.sendMessage(
			createFetchGameMessage(ids),
		);
		return isGameArray(response) ? response : [];
	} catch (error) {
		console.error('Error fetching games:', error);
		return [];
	}
}

function createFetchGameMessage(ids: number[]): FetchGameMessage {
	return {
		type: 'fetch-game',
		data: { ids },
	};
}

function mountGame(game: Game) {
	if (game.subs.length === 0) return;

	document
		.querySelectorAll<HTMLElement>(`.alike_sub[data-sub-id="${game.sid}"]`)
		.forEach((element) => {
			if (mountedTargets.has(element)) return;

			const component = new SubscriptionMount({
				target: element,
				props: {
					game,
					type: parseMountType(element.dataset.subType),
					language: currentLanguage,
				},
			}) as MountedComponent;

			mountedTargets.set(element, component);
		});
}

function setupTarget(element: HTMLElement, appId: number, type: number) {
	if (!isValidAppId(appId)) return false;

	const currentAppId = parseAppId(element.dataset.subId);
	if (currentAppId && currentAppId !== appId) {
		unmountTarget(element);
	}

	element.classList.add('alike_sub');
	element.dataset.subId = String(appId);
	element.dataset.subType = String(type);

	return true;
}

function unmountTarget(element: HTMLElement) {
	mountedTargets.get(element)?.$destroy();
	mountedTargets.delete(element);
	element.querySelector('.alike_cont')?.remove();
}

function cleanupDisconnectedTargets() {
	for (const [element, component] of mountedTargets.entries()) {
		if (!element.isConnected) {
			component.$destroy();
			mountedTargets.delete(element);
		}
	}
}

function handleStorageChange(
	changes: Record<string, Storage.StorageChange>,
	areaName: string,
) {
	if (areaName !== 'sync') return;

	const language = getLanguageFromStorageChange(changes.aSub_options);
	if (!language || language === currentLanguage) return;

	currentLanguage = language;
	for (const component of mountedTargets.values()) {
		component.$set({ language });
	}
}

function getLanguageFromStorageChange(
	change: Storage.StorageChange | undefined,
) {
	const data = change?.newValue as
		| { options?: Partial<ExtensionOptions> }
		| undefined;
	return data?.options?.language;
}

function getSaleWidgetType(element: HTMLElement) {
	const className = element.className;
	const isRow = [
		'salepreviewwidgets_StoreSaleItemReview',
		'salepreviewwidgets_SaleItemBrowserRow',
	].some((classFragment) => className.includes(classFragment));

	return isRow ? ROW_MOUNT_TYPE : DEFAULT_MOUNT_TYPE;
}

function getDataAppIdType(element: HTMLElement) {
	return element.className.includes('tab_item')
		? ROW_MOUNT_TYPE
		: DEFAULT_MOUNT_TYPE;
}

function parseMountType(value: string | undefined) {
	const type = Number.parseInt(value ?? '', 10);
	return Number.isInteger(type) && type > 0 ? type : DEFAULT_MOUNT_TYPE;
}

function parseAppId(value: string | undefined) {
	const appId = Number.parseInt(value ?? '', 10);
	return isValidAppId(appId) ? appId : 0;
}

function parseAppIdFromUrl(value: string) {
	return parseAppId(value.match(/\/app\/(\d+)/)?.[1]);
}

function isValidAppId(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function queryElements<TElement extends Element>(root: ParentNode, selector: string): TElement[] {
	const matches = Array.from(root.querySelectorAll<TElement>(selector));

	if (root instanceof Element && root.matches(selector)) {
		matches.unshift(root as TElement);
	}

	return matches;
}

function isGameArray(value: unknown): value is Game[] {
	return Array.isArray(value) && value.every(isGame);
}

function isGame(value: unknown): value is Game {
	if (!isRecord(value)) return false;

	return (
		typeof value.id === 'string' &&
		isValidAppId(value.sid) &&
		typeof value.name === 'string' &&
		typeof value.poster === 'string' &&
		Array.isArray(value.subs)
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function createDelayedRunner(callback: () => void, delay: number) {
	let timeout: ReturnType<typeof setTimeout> | undefined;

	return () => {
		if (timeout) return;

		timeout = setTimeout(() => {
			timeout = undefined;
			callback();
		}, delay);
	};
}

void init();


