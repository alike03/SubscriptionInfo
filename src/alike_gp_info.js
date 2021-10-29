const path = window.location.pathname;
var triggerLimit = false;

if (path.split('/')[1] === '') {
	// Starting page
	waitForElement('.home_page_content .maincap .carousel_items a[data-ds-appid]').then(function () {
		let gameListHome = [];
		document.querySelectorAll('.home_page_content .home_tabs_content .tab_content a[data-ds-appid]').forEach(game => {
			if (!game.classList.contains('alike_sub')) {
				game.classList.add('alike_sub');
				game.dataset.subType = 6;
				game.dataset.subId = game.dataset.dsAppid;

				gameListHome.push(game.dataset.dsAppid);
			}
		});

		document.querySelectorAll(
			'.home_page_content .carousel_items a[data-ds-appid],' +
			'.home_page_content .carousel_items div[data-ds-appid],' +
			'.home_page_content .store_capsule_frame a[data-ds-appid],' +
			'.home_page_content .marketingmessage_container a[data-ds-appid]'
		).forEach(game => {
			if (!game.classList.contains('alike_sub')) {
				game.classList.add('alike_sub');
				game.dataset.subType = 1;
				game.dataset.subId = game.dataset.dsAppid;

				gameListHome.push(game.dataset.dsAppid);
			}
		});

		getGameList(gameListHome);

		document.addEventListener('scroll', function () { limitFunction(moreHomeList) });

		function moreHomeList() {
			let gameListHomeMore = [];
			document.querySelectorAll('.page_content_ctn:not(.alike_sub_read)').forEach(list => {
				list.classList.add('alike_sub_read');
				list.querySelectorAll('[data-ds-appid]:not(.screenshot)').forEach(game => {
					if (!game.classList.contains('alike_sub')) {
						game.classList.add('alike_sub');
						game.dataset.subType = 2;
						game.dataset.subId = game.dataset.dsAppid;

						gameListHomeMore.push(game.dataset.dsAppid);
					}
				});
			});

			getGameList(gameListHomeMore);
			triggerLimit = false;
		}
	})
} else if (path.split('/')[1] === 'search') {
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
					game.dataset.subType = 6;
					game.dataset.subId = game.dataset.dsAppid;
				}
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
					game.dataset.subType = 5;
					game.dataset.subId = game.dataset.appId;
				}
			});

			getGameList(list);
			triggerLimit = false;
		}
	});
} else if (path.split('/')[1] === 'app') {
	// App store page
	const appId = path.split('/')[2];

	transferData(0, 'v=' + version.replaceAll('.', '-') + '&id=' + appId, function (resp) {
		response = JSON.parse(resp)[0];
		waitForElement('.page_content_ctn > .block .queue_overflow_ctn').then(function (game) {
			game.classList.add('alike_sub');
			game.dataset.subType = 3;
			game.dataset.subId = appId;
			addSubInfo(response);
		});
	});
	waitForElement('.release_date .date').then(function (date) {
		transferData(
			1,
			'v=' + version.replaceAll('.', '-') + 
			'&type=info' +
			'&id=' + appId + 
			'&name=' + document.querySelector('#appHubAppName').textContent +
			'&date=' + date.textContent +
			'&lang=' + document.documentElement.lang
		);
	});
} else if (path.split('/')[1] === 'developer' || path.split('/')[1] === 'publisher' || path.split('/')[1] === 'curator' || path.split('/')[1] === 'bundle') {
	// Developer and Publisher
	document.addEventListener('scroll', function () { limitFunction(filterDev) });
	filterDev();

	function filterDev() {
		let list = [];
		document.querySelectorAll('[data-ds-appid]:not(.alike_sub)').forEach(game => {
			if (!game.classList.contains('alike_sub')) {
				list.push(game.dataset.dsAppid);
				game.classList.add('alike_sub');
				game.dataset.subType = 1;
				game.dataset.subId = game.dataset.dsAppid;
			}
		});

		getGameList(list);
		triggerLimit = false;
	}
}

/*******  Functions  *******/

function getGameList(list) {
	let uniq = [...new Set(list.filter(Boolean))];
	if (uniq.length > 0) {
		transferData(0, 'v=' + version.replaceAll('.', '-') + '&id=' + uniq.toString(), function (resp) {
			response = JSON.parse(resp);
			response.forEach(game => { addSubInfo(game) });
		});
	}
}

function limitFunction(f) {
	if (!triggerLimit) {
		triggerLimit = true;
		setTimeout(function () { f(); }, 700);
	}
}

function addSubInfo(g) {
	if (typeof g === 'undefined') return false;

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
		if (!save.options.showNoInfoBar) return;
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

function appendToContainer(container, g, sub, p, type) {
	let flagDiv = document.createElement('div');
	flagDiv.setAttribute('class', 'sub_flag ' + sub.status + ' ' + p);
	flagDiv.innerText = alike_lang.flag[sub.status](p);

	if (type === 3) {
		let textDiv = document.createElement('div');
		textDiv.setAttribute('class', 'sub_text ' + sub.status + ' ' + p);

		let textSpan = document.createElement('span');
		textSpan.appendChild(document.createTextNode(alike_lang.long[sub.status](p, g.name, sub.date)));

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
			link.setAttribute('target', '_blank');
			textDiv.appendChild(link);
		}

		container.appendChild(textDiv);
	} else if (type === 6) {
		let pName = document.createElement('span');
		pName.setAttribute('class', 'hover_info');
		pName.innerText = alike_lang.flag[sub.status](p);

		flagDiv.innerText = '';
		container.appendChild(flagDiv);
		flagDiv.appendChild(pName);
	} else {
		container.appendChild(flagDiv);
	}

	return container;
}