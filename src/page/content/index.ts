import browser from 'webextension-polyfill';

import { getPlatformDetails } from '$lib/data';
import { throttle, waitForElement } from '$lib/utils';
import type { Game, SubscriptionInfo } from '$lib/types';
import './content.scss';

const path = window.location.pathname;
let games: Game[] = [];

async function init() {
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
			const list: number[] = [];

			document
				.querySelectorAll<HTMLAnchorElement>('#search_resultsRows a[data-ds-appid]:not(.alike_sub)')
				.forEach((game) => {
					const appId = parseInt(game.dataset.dsAppid || '0', 10);
					if (appId) {
						list.push(appId);
						game.classList.add('alike_sub');
						game.dataset.subId = String(appId);
						game.dataset.subType = '6';
					}
				});

			void getGameList(list);
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

function initWishlistPage() {
	waitForElement('#StoreTemplate .Panel input.Focusable').then((input) => {
		let triggerLimit = false;

		const filterWishlistList = () => {
			const list: number[] = [];

			document.querySelectorAll('.alike_cont').forEach((badge) => badge.remove());

			document
				.querySelectorAll<HTMLAnchorElement>('#StoreTemplate .Panel .Panel a[href*="/app/"]')
				.forEach((game) => {
					if (!game.querySelector('img')) return;
					const appId = parseInt(game.href.split('app/')[1]?.split('/')[0] || '0', 10);
					if (appId) {
						list.push(appId);
						game.classList.add('alike_sub');
						game.dataset.subId = String(appId);
						game.dataset.subType = '6';
					}
				});

			void getGameList(list);
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

function initAppPage() {
	const appId = parseInt(path.split('/')[2] || '0', 10);
	if (!appId) return;

	document.querySelectorAll('#appHubAppName').forEach((game) => {
		game.classList.add('alike_sub');
	});

	browser.runtime.sendMessage({ type: 'fetch-game', data: { ids: [appId] } }).then((response) => {
		const gameData = (response as Game[])?.[0];
		if (!gameData) return;

		waitForElement('.page_content_ctn > .page_content').then((details) => {
			const game = document.createElement('div');
			details.before(game);

			game.classList.add('alike_sub');
			game.dataset.subType = '3';
			game.dataset.subId = String(appId);
			addSubInfo(gameData);
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
			.forEach((game) => {
				if (!game.closest('.alike_sub')) {
					const link = game.querySelector<HTMLAnchorElement>('a[href*="app/"]');
					if (link) {
						const appId = parseInt(link.href.split('/')[4] || '0', 10);
						if (appId) {
							list.push(appId);
							if (!game.dataset.subType) {
								const isRowContainer = [
									'salepreviewwidgets_StoreSaleItemReview',
									'salepreviewwidgets_SaleItemBrowserRow'
								];
								const className = game.getAttribute('class') || '';
								const isRow = isRowContainer.some((classFragment) => className.includes(classFragment));
								game.dataset.subType = isRow ? '6' : '2';
							}
							game.dataset.subId = String(appId);
						}
					}
					game.classList.add('alike_sub');
				}
			});

		document
			.querySelectorAll<HTMLElement>('[data-ds-appid]:not(.alike_sub):not(.gutter_item)')
			.forEach((game) => {
				const appId = parseInt(game.dataset.dsAppid || '0', 10);
				if (appId) {
					list.push(appId);
					game.classList.add('alike_sub');
					if (!game.dataset.subType) {
						const className = game.getAttribute('class') || '';
						const isRow = ['tab_item'].some((classFragment) => className.includes(classFragment));
						game.dataset.subType = isRow ? '6' : '2';
					}
					game.dataset.subId = String(appId);
				}
			});

		void getGameList(list);
	}, 1000);

	waitForElement('body').then((body) => {
		const observer = new MutationObserver(observe);
		observer.observe(body, { childList: true, subtree: true });
	});
}

async function getGameList(list: number[]) {
	const uniqueIds = [...new Set(list.filter(Boolean))];
	if (uniqueIds.length === 0) return;

	const gameMap = new Map(games.map((game) => [game.sid, game]));
	const newGameIds: number[] = [];

	for (const id of uniqueIds) {
		const existingGame = gameMap.get(id);
		if (existingGame) {
			addSubInfo(existingGame);
		} else {
			newGameIds.push(id);
		}
	}

	if (newGameIds.length > 0) {
		try {
			const response = (await browser.runtime.sendMessage({
				type: 'fetch-game',
				data: { ids: newGameIds }
			})) as Game[];

			if (response && response.length > 0) {
				for (const game of response) {
					games.push(game);
					addSubInfo(game);
				}
			}
		} catch (error) {
			console.error('Error fetching games:', error);
		}
	}
}

function addSubInfo(game: Game) {
	if (!game || game.subs.length === 0) return;

	document.querySelectorAll<HTMLElement>(`.alike_sub[data-sub-id="${game.sid}"]`).forEach((element) => {
		if (element.querySelector('.alike_cont')) return;

		const container = document.createElement('div');
		const subType = parseInt(element.dataset.subType || '2', 10);

		for (const sub of game.subs) {
			appendToContainer(container, game, sub, subType);
		}

		container.className = `alike_cont type-${subType}`;
		element.appendChild(container);
	});
}

function appendToContainer(container: HTMLElement, game: Game, sub: SubscriptionInfo, type: number) {
	const platform = getPlatformDetails(sub.platform);
	const statusClass = sub.leaving ? 'leaving' : sub.leave ? 'left' : 'active';

	const flagDiv = document.createElement('div');
	flagDiv.className = `sub_flag ${statusClass} ${sub.platform}`;

	if (type === 3) {
		const textDiv = document.createElement('div');
		textDiv.className = `sub_text ${statusClass} ${sub.platform}`;

		const flagSpan = document.createElement('div');
		flagSpan.className = `sub_flag ${sub.platform}`;
		textDiv.appendChild(flagSpan);

		const textSpan = document.createElement('span');
		let text = '';
		if (sub.leaving) {
			text = `${game.name} is leaving ${platform.name}${sub.leave ? ` on ${sub.leave}` : ' soon'}`;
		} else if (sub.leave) {
			text = `${game.name} left ${platform.name} on ${sub.leave}`;
		} else {
			text = `${game.name} has been on ${platform.name} since ${sub.entry}`;
		}
		textSpan.textContent = text;
		textDiv.appendChild(textSpan);

		container.appendChild(textDiv);
	} else if (type === 6) {
		const platformName = document.createElement('span');
		platformName.className = 'hover_info';
		platformName.textContent = `ON ${platform.name}`;

		flagDiv.appendChild(platformName);
		container.appendChild(flagDiv);
	} else {
		flagDiv.textContent = `ON ${platform.name}`;
		container.appendChild(flagDiv);
	}
}

void init();