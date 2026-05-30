import browser from 'webextension-polyfill';
import type { Storage } from 'webextension-polyfill';

import { defaultOptions, getOptions } from '$lib/storage';
import { throttle, waitForElement } from '$lib/utils';
import type { ExtensionOptions, Game, Language } from '$lib/types';
import SubscriptionMount from './components/SubscriptionMount.svelte';
import './content.css';

interface MountedComponent {
	$set(props: { language?: Language }): void;
	$destroy(): void;
}

const path = window.location.pathname;
const games = new Map<number, Game>();
const mountedTargets = new Map<HTMLElement, MountedComponent>();
let currentLanguage: Language = defaultOptions.language;

async function init() {
	currentLanguage = (await getOptions()).language;
	browser.storage.onChanged.addListener(handleStorageChange);

	if (path.split('/')[1] === 'search') {
		initSearchPage();
	} else if (path.split('/')[1] === 'wishlist') {
		initWishlistPage();
	} else if (path.split('/')[1] === 'app') {
		initAppPage();
	}

	initGeneralObserver();
}

function initSearchPage() {
	waitForElement('.search_results #search_result_container #search_resultsRows').then(() => {
		let triggerLimit = false;

		const filterSearchList = () => {
			const list = collectSearchTargets();
			void loadGamesForIds(list);
			triggerLimit = false;
		};

		const limitFunction = (callback: () => void) => {
			if (!triggerLimit) {
				triggerLimit = true;
				setTimeout(callback, 700);
			}
		};

		window.addEventListener('popstate', () => limitFunction(filterSearchList));
		document.addEventListener('scroll', () => limitFunction(filterSearchList));

		const form = document.getElementById('advsearchform');
		if (form) {
			form.addEventListener('submit', () => limitFunction(filterSearchList));
			form.addEventListener('keyup', (event) => {
				if ((event as KeyboardEvent).key === 'Enter') limitFunction(filterSearchList);
			});
		}

		filterSearchList();
	});
}

function collectSearchTargets() {
	const list: number[] = [];

	document
		.querySelectorAll<HTMLAnchorElement>('#search_resultsRows a[data-ds-appid]')
		.forEach((element) => {
			const appId = parseAppId(element.dataset.dsAppid);
			if (setupTarget(element, appId, 6)) {
				list.push(appId);
			}
		});

	return list;
}

function initWishlistPage() {
	waitForElement('#StoreTemplate .Panel input.Focusable').then((input) => {
		let triggerLimit = false;

		const filterWishlistList = () => {
			const list = collectWishlistTargets();
			void loadGamesForIds(list);
			triggerLimit = false;
		};

		const limitFunction = (callback: () => void) => {
			if (!triggerLimit) {
				triggerLimit = true;
				setTimeout(callback, 700);
			}
		};

		input.addEventListener('keyup', () => limitFunction(filterWishlistList));
		document
			.getElementById('StoreTemplate')
			?.addEventListener('scroll', () => limitFunction(filterWishlistList));

		filterWishlistList();
	});
}

function collectWishlistTargets() {
	const list: number[] = [];

	document
		.querySelectorAll<HTMLAnchorElement>('#StoreTemplate .Panel .Panel a[href*="/app/"]')
		.forEach((element) => {
			if (!element.querySelector('img')) return;

			const appId = parseAppIdFromUrl(element.href);
			if (setupTarget(element, appId, 6)) {
				list.push(appId);
			}
		});

	return list;
}

function initAppPage() {
	const appId = parseAppIdFromUrl(path);
	if (!appId) return;

	browser.runtime.sendMessage({ type: 'fetch-game', data: { ids: [appId] } }).then((response) => {
		const game = (response as Game[])?.[0];
		if (!game) return;

		games.set(game.sid, game);

		waitForElement('.page_content_ctn > .page_content').then((details) => {
			const mountTarget = document.createElement('div');
			details.before(mountTarget);

			setupTarget(mountTarget, appId, 3);
			mountGame(game);
		});
	});
}

function initGeneralObserver() {
	const observe = throttle(() => {
		const list: number[] = [];

		document
			.querySelectorAll<HTMLElement>(
				'[class^="salepreviewwidgets_"]:not(.alike_sub), .SaleSectionContainer:not(.alike_sub) .Panel'
			)
			.forEach((element) => {
				if (element.closest('.alike_sub')) return;

				const link = element.querySelector<HTMLAnchorElement>('a[href*="/app/"]');
				const appId = parseAppIdFromUrl(link?.href ?? '');
				if (appId) {
					setupTarget(element, appId, getSaleWidgetType(element));
					list.push(appId);
				}

				element.classList.add('alike_sub');
			});

		document
			.querySelectorAll<HTMLElement>('[data-ds-appid]:not(.alike_sub):not(.gutter_item)')
			.forEach((element) => {
				const appId = parseAppId(element.dataset.dsAppid);
				if (setupTarget(element, appId, getDataAppIdType(element))) {
					list.push(appId);
				}
			});

		void loadGamesForIds(list);
	}, 1000);

	waitForElement('body').then((body) => {
		const observer = new MutationObserver(observe);
		observer.observe(body, { childList: true, subtree: true });
		observe();
	});
}

async function loadGamesForIds(list: number[]) {
	const uniqueIds = [...new Set(list.filter(Boolean))];
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

	try {
		const response = (await browser.runtime.sendMessage({
			type: 'fetch-game',
			data: { ids: missingIds }
		})) as Game[];

		for (const game of response ?? []) {
			games.set(game.sid, game);
			mountGame(game);
		}
	} catch (error) {
		console.error('Error fetching games:', error);
	}
}

function mountGame(game: Game) {
	if (!game || game.subs.length === 0) return;

	document.querySelectorAll<HTMLElement>(`.alike_sub[data-sub-id="${game.sid}"]`).forEach((element) => {
		if (mountedTargets.has(element)) return;

		const type = parseInt(element.dataset.subType || '2', 10);
		const component = new SubscriptionMount({
			target: element,
			props: { game, type, language: currentLanguage }
		}) as MountedComponent;

		mountedTargets.set(element, component);
	});
}

function setupTarget(element: HTMLElement, appId: number, type: number) {
	if (!appId) return false;

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

function handleStorageChange(changes: Record<string, Storage.StorageChange>, areaName: string) {
	if (areaName !== 'sync' || !changes.aSub_options?.newValue) return;

	const data = changes.aSub_options.newValue as { options?: Partial<ExtensionOptions> };
	const language = data.options?.language;
	if (!language || language === currentLanguage) return;

	currentLanguage = language;
	for (const component of mountedTargets.values()) {
		component.$set({ language });
	}
}

function getSaleWidgetType(element: HTMLElement) {
	const className = element.getAttribute('class') || '';
	const isRow = ['salepreviewwidgets_StoreSaleItemReview', 'salepreviewwidgets_SaleItemBrowserRow'].some(
		(classFragment) => className.includes(classFragment)
	);

	return isRow ? 6 : 2;
}

function getDataAppIdType(element: HTMLElement) {
	const className = element.getAttribute('class') || '';
	return className.includes('tab_item') ? 6 : 2;
}

function parseAppId(value: string | undefined) {
	const appId = parseInt(value || '0', 10);
	return Number.isFinite(appId) ? appId : 0;
}

function parseAppIdFromUrl(value: string) {
	return parseAppId(value.match(/\/app\/(\d+)/)?.[1]);
}

void init();
