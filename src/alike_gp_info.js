const path = window.location.pathname;
var triggerLimit = false;

// Starting page
if (path.split('/')[1] === '') {
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
} else
	// Search Page
	if (path.split('/')[1] === 'search') {
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
	} else
		// Wishlist page
		if (path.split('/')[1] === 'wishlist') {
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
		} else
			// App store page
			if (path.split('/')[1] === 'app') {
				let appId = path.split('/')[2];

				transferData(0, 'v=' + version.replaceAll('.', '-') + '&id=' + appId, function (resp) {
					response = JSON.parse(resp)[0];
					waitForElement('.page_content_ctn > .block .queue_overflow_ctn').then(function (game) {
						game.classList.add('alike_sub');
						game.dataset.subType = 3;
						game.dataset.subId = appId;
						addSubInfo(response);
					});
				});
				waitForElement('.release_date .date').then(function (element) {
					transferData(1, 'v=' + version.replaceAll('.', '-') + '&type=info&id=' + appId + '&date=' + element.textContent);
				});
			} else
				// Developer and Publisher
				if (path.split('/')[1] === 'developer' || path.split('/')[1] === 'publisher' || path.split('/')[1] === 'curator' || path.split('/')[1] === 'bundle') {
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
	if (typeof g === 'undefined' || Object.keys(g.subs).length < 1) return false;

	document.querySelectorAll('.alike_sub[data-sub-id="' + g.sid + '"]').forEach(element => {
		let container = document.createElement('div');
		for (const [p, sub] of Object.entries(g.subs)) {
			let flagDiv = document.createElement('div');
			flagDiv.setAttribute('class', 'sub_flag ' + sub.status + ' ' + p);
			flagDiv.innerText = alike_lang.flag[sub.status](p);
			container.appendChild(flagDiv);

			if (parseInt(element.dataset.subType) === 3) {
				let textDiv = document.createElement('div');
				textDiv.setAttribute('class', 'sub_text ' + sub.status + ' ' + p);

				let textSpan = document.createElement('span');
				textSpan.appendChild(document.createTextNode(alike_lang.long[sub.status](p, g.name, sub.date)));

				textDiv.appendChild(textSpan);
				container.appendChild(textDiv);
			} else if (parseInt(element.dataset.subType) === 6) {
				let pName = document.createElement('span');
				pName.setAttribute('class', 'hover_info');
				pName.innerText = alike_lang.flag[sub.status](p);

				flagDiv.innerText = '';
				flagDiv.appendChild(pName);
			}
		};

		container.setAttribute('class', 'alike_cont type-' + element.dataset.subType);
		element.appendChild(container);
	});
}