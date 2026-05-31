import browser from 'webextension-polyfill';
import type { Storage } from 'webextension-polyfill';

import { defaultOptions, getOptions } from '$lib/storage';
import { throttle, waitForElement } from '$lib/utils';
import type { ExtensionOptions, Game, Language } from '$lib/types';
import SubscriptionMount from './components/SubscriptionMount.svelte';
import './content.css';

const SEARCH_RESULTS_SELECTOR = '#search_resultsRows a[data-ds-appid]';
const WISHLIST_RESULTS_SELECTOR =
	'#StoreTemplate .Panel .Panel a[href*="/app/"]';
const SALE_WIDGET_SELECTOR =
	'[class^="salepreviewwidgets_"]:not(.alike_sub), .SaleSectionContainer:not(.alike_sub) .Panel';
const DATA_APP_SELECTOR = '[data-ds-appid]:not(.alike_sub):not(.gutter_item)';
const APP_DETAILS_SELECTOR = '.page_content_ctn > .page_content';
const SEARCH_DEBOUNCE_MS = 700;
const OBSERVER_THROTTLE_MS = 1000;
const DEFAULT_MOUNT_TYPE = 2;
const APP_PAGE_MOUNT_TYPE = 3;
const ROW_MOUNT_TYPE = 6;

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
const games = new Map<number, Game>();
const mountedTargets = new Map<HTMLElement, MountedComponent>();
let currentLanguage: Language = defaultOptions.language;

async function init() {
	try {
		currentLanguage = (await getOptions()).language;
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
		document.querySelectorAll<HTMLAnchorElement>(SEARCH_RESULTS_SELECTOR),
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
		document.querySelectorAll<HTMLAnchorElement>(WISHLIST_RESULTS_SELECTOR),
		(element) =>
			element.querySelector('img') ? parseAppIdFromUrl(element.href) : 0,
	);
}

async function initAppPage() {
	const appId = parseAppIdFromUrl(currentPath);
	if (!appId) return;

	const [game] = await fetchGames([appId]);
	if (!game) return;

	games.set(game.sid, game);

	const details = await waitForElement(APP_DETAILS_SELECTOR);
	const mountTarget = document.createElement('div');
	details.before(mountTarget);

	setupTarget(mountTarget, appId, APP_PAGE_MOUNT_TYPE);
	mountGame(game);
}

function initGeneralObserver() {
	const observe = throttle(() => {
		const ids = [...collectSaleWidgetTargets(), ...collectDataAppTargets()];
		void loadGamesForIds(ids);
	}, OBSERVER_THROTTLE_MS);

	void waitForElement('body').then((body) => {
		const observer = new MutationObserver(observe);
		observer.observe(body, { childList: true, subtree: true });
		observe();
	});
}

function collectSaleWidgetTargets() {
	const ids: number[] = [];

	document
		.querySelectorAll<HTMLElement>(SALE_WIDGET_SELECTOR)
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

function collectDataAppTargets() {
	return collectTargets(
		document.querySelectorAll<HTMLElement>(DATA_APP_SELECTOR),
		(element) => parseAppId(element.dataset.dsAppid),
		getDataAppIdType,
	);
}

function collectTargets<TElement extends HTMLElement>(
	elements: NodeListOf<TElement>,
	getAppId: (element: TElement) => number,
	getType: (element: TElement) => number = () => ROW_MOUNT_TYPE,
) {
	const ids: number[] = [];

	elements.forEach((element) => {
		const appId = getAppId(element);
		if (setupTarget(element, appId, getType(element))) {
			ids.push(appId);
		}
	});

	return ids;
}

async function loadGamesForIds(ids: number[]) {
	const uniqueIds = [...new Set(ids.filter(isValidAppId))];
	if (uniqueIds.length === 0) return;

	const missingIds: number[] = [];

	for (const id of uniqueIds) {
		const cachedGame = games.get(id);
		if (cachedGame) {
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
