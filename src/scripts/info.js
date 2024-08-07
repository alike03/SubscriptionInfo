const path = window.location.pathname;
var triggerLimit = false;

if (path.split('/')[1] === 'search') {
	// Search Page
	waitForElement('.search_results #search_result_container #search_resultsRows').then(function () {

		window.addEventListener('popstate', function () { limitFunction(filterSearchList) });
		document.addEventListener('scroll', function () { limitFunction(filterSearchList) });
		document.getElementById('advsearchform').addEventListener("submit", function () { limitFunction(filterSearchList) });
		document.getElementById('advsearchform').addEventListener('keyup', function (e) {
			if (e.key === 13) limitFunction(filterSearchList);
		})
		filterSearchList();

		function filterSearchList() {
			let list = [];

			document.querySelectorAll('#search_resultsRows a[data-ds-appid]:not(.alike_sub)').forEach(game => {
				if (!game.classList.contains('alike_sub')) {
					list.push(game.dataset.dsAppid);
					game.classList.add('alike_sub');
					game.dataset.subId = game.dataset.dsAppid;
				}
				game.dataset.subType = 6;
			});

			getGameList(list);
			triggerLimit = false;
		}
	});
} else if (path.split('/')[1] === 'wishlist') {
	// Wishlist page
	waitForElement('.page_content #wishlist_ctn .wishlist_row').then(function () {
		document.getElementById('wishlist_search').addEventListener("keyup", function () { limitFunction(filterWishlistList) });
		document.addEventListener('scroll', function () { limitFunction(filterWishlistList) });
		filterWishlistList();

		function filterWishlistList() {
			let list = [];
			Array.from(document.getElementById('wishlist_ctn').children).forEach(game => {
				if (!game.classList.contains('alike_sub')) {
					list.push(game.dataset.appId);
					game.classList.add('alike_sub');
					game.dataset.subId = game.dataset.appId;
				}
				game.dataset.subType = 5;
			});

			getGameList(list);
			triggerLimit = false;
		}
	});
} else if (path.split('/')[1] === 'app') {
	// App store page
	const appId = parseInt(path.split('/')[2]);

	// add alike_sub class to avoid information on text
	document.querySelectorAll('#appHubAppName').forEach(game => {
		game.classList.add('alike_sub');
	});

	chrome.runtime.sendMessage({type: 'fetch-game', data:{ ids: [appId] }}, (response) => {
		waitForElement('.page_content_ctn > .block .queue_overflow_ctn').then(function (game) {
			game.classList.add('alike_sub');
			game.dataset.subType = 3;
			game.dataset.subId = appId;
			addSubInfo(response[0]);
		});
    });
	waitForElement('.release_date .date').then(function (date) {
		chrome.runtime.sendMessage({type: 'fetch-pass', data: {
			type: 'info',
			id: appId,
			name: document.querySelector('#appHubAppName').textContent,
			date: date.textContent,
			lang: document.documentElement.lang
		}});
	});
}

/**
 * Observes the page for changes and retrieves subscription information for new games
 */
observe(() => {
	let list = [];

	// query class starting with salepreviewwidgets_
	document.querySelectorAll('[class^="salepreviewwidgets_"]:not(.alike_sub)').forEach(game => {
		// check if game is not already checked with alike_sub class and also check if a parent element doesnt have .alike_sub class
		if (!game.closest('.alike_sub')) {
			// get Steam ID from a[href]
			const link = game.querySelector('a[href*="app/"]');
			if (link) {
				const appId = link.href.split('/')[4];
				if (appId) {
					list.push(appId);
					if (!game.dataset.subType) {
						const isRowContainer = ['salepreviewwidgets_StoreSaleItemReview', 'salepreviewwidgets_SaleItemBrowserRow'];
						const isRow = isRowContainer.some(c => game.attributes.class.value.includes(c));
						game.dataset.subType = (isRow ? 6 : 2);
					}
					game.dataset.subId = appId;
				}
			}
			game.classList.add('alike_sub');
		}
	});

	// query elements with data-ds-appid attribute
	document.querySelectorAll('[data-ds-appid]:not(.alike_sub):not(.gutter_item)').forEach(game => {
		list.push(game.dataset.dsAppid);
		game.classList.add('alike_sub');
		if (!game.dataset.subType) {
			const isRowContainer = ['tab_item'];
			const isRow = isRowContainer.some(c => game.attributes.class.value.includes(c));
			game.dataset.subType = (isRow ? 6 : 2);
		}
		game.dataset.subId = game.dataset.dsAppid;
	});
	getGameList(list);
});

/*******  Functions  *******/

/**
 * Retrieves subscription information for a list of games and adds it to the page.
 * 
 * @param {Array} list - An array of game IDs to retrieve subscription information for.
 */
function getGameList(list) {
	let uniq = [...new Set(list.filter(Boolean).map(Number))];
	if (uniq.length > 0) {
		chrome.runtime.sendMessage({type: 'fetch-game', data:{ ids: uniq }}, (response) => {
			if (response.length === 0) return false;
			response.forEach(game => { addSubInfo(game) });
		});
	}
}

function observe(callback, selector = 'body') {
	waitForElement(selector).then(function (element) {
		// triggerDynamic on page mutation with the use of throttle
		const observer = new MutationObserver(throttle(callback));
		observer.observe(element, { childList: true, subtree: true });
	});
}

/**
 * Limits the frequency of function calls to 700ms.
 * 
 * @param {Function} f - The function to be called with a delay.
 */
function limitFunction(f) {
	if (!triggerLimit) {
		triggerLimit = true;
		setTimeout(function () { f(); }, 700);
	}
}

/**
 * Throttles a function to be called at most once per `delay` milliseconds.
 * 
 * @param {Function} cb - The function to be throttled.
 * @param {number} [delay=1000] - The delay in milliseconds.
 * @returns {Function} Returns the throttled function.
 */
function throttle(cb, delay = 1000) {
	let shouldWait = false
	let waitingArgs
	const timeoutFunc = () => {
		if (waitingArgs == null) {
			shouldWait = false
		} else {
			cb(...waitingArgs)
			waitingArgs = null
			setTimeout(timeoutFunc, delay)
		}
	}

	return (...args) => {
		if (shouldWait) {
			waitingArgs = args
			return
		}

		cb(...args)
		shouldWait = true

		setTimeout(timeoutFunc, delay)
	}
}

/**
 * Adds subscription information to the game element based on the subscription type.
 * 
 * @param {Object} g - The game object containing information about the game.
 * @returns {boolean} Returns false if the game object is undefined.
 */
function addSubInfo(g) {
	if (typeof g === 'undefined' || typeof g === null) return false;

	if (g.status === 'found') {
		document.querySelectorAll('.alike_sub[data-sub-id="' + g.sid + '"]').forEach(element => {
			let container = document.createElement('div');
			for (const [p, sub] of Object.entries(g.subs)) {
				container = appendToContainer(container, g, sub, p, parseInt(element.dataset.subType));
			};

			container.setAttribute('class', 'alike_cont type-' + element.dataset.subType);
			element.appendChild(container);
		});
	} else if (g.status === 'missing') {
		if (!save.options.showNoInfoBar) return false;
		let element = document.querySelector('.alike_sub');

		if (parseInt(element.dataset.subType) === 3) {
			g.name = document.querySelector('#appHubAppName').textContent;
			let container = document.createElement('div');
			let p = 'alike';
			let type = 3;
			let sub = {
				'status': g.status,
				'date': ''
			}

			container = appendToContainer(container, g, sub, p, type);

			container.setAttribute('class', 'alike_cont type-' + element.dataset.subType);
			element.appendChild(container);
		}
	}
}

/**
 * Appends subscription information to a container element based on the subscription type.
 * 
 * @param {HTMLElement} container - The container element to append the subscription information to.
 * @param {Object} g - The game object containing information about the game.
 * @param {Object} sub - The subscription object containing information about the subscription.
 * @param {string} p - The subscription platform.
 * @param {number} type - The subscription badge type.
 * @returns {HTMLElement} The container element with the appended subscription information.
 */
function appendToContainer(container, g, sub, p, type) {
	let flagDiv = document.createElement('div');
	flagDiv.setAttribute('class', 'sub_flag ' + sub.status + ' ' + p);
	flagDiv.innerText = lang.flag[sub.status](p);

	if (type === 3) {
		let textDiv = document.createElement('div');
		textDiv.setAttribute('class', 'sub_text ' + sub.status + ' ' + p);

		let textSpan = document.createElement('span');
		textSpan.appendChild(document.createTextNode(lang.long[sub.status](p, g.name, sub.date)));

		flagDiv.setAttribute('class', 'sub_flag ' + p);
		textDiv.appendChild(flagDiv);
		textDiv.appendChild(textSpan);

		if (g.affiliate) {
			let affiliate = document.createElement('a');
			affiliate.setAttribute('class', 'button affiliate');
			affiliate.setAttribute('href', g.affiliate.replace("##NAME##", g.name));
			affiliate.setAttribute('title', 'Buy the game through my affiliate link, making a small contribution to me');
			affiliate.setAttribute('target', '_blank');
			textDiv.appendChild(affiliate);
		}

		if (sub.link) {
			let link = document.createElement('a');
			link.setAttribute('class', 'button link');
			link.setAttribute('href', sub.link);
			link.setAttribute('title', 'Show the Game on their Platform');
			link.setAttribute('target', sub.target);
			textDiv.appendChild(link);
		}

		container.appendChild(textDiv);
	} else if (type === 6) {
		let pName = document.createElement('span');
		pName.setAttribute('class', 'hover_info');
		pName.innerText = lang.flag[sub.status](p);

		flagDiv.innerText = '';
		container.appendChild(flagDiv);
		flagDiv.appendChild(pName);
	} else {
		container.appendChild(flagDiv);
	}

	return container;
}