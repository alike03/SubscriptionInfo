// PS Plus game name lookup map (normalized name -> game data)
let psplusGamesMap = null;
let psplusLoadPromise = null;

// Load PS Plus games data
const loadPSPlusGames = async () => {
	if (psplusGamesMap) return psplusGamesMap;
	if (psplusLoadPromise) return psplusLoadPromise;

	psplusLoadPromise = (async () => {
		try {
			const url = 'https://www.playstation.com/bin/imagic/gameslist?locale=en-us&categoryList=plus-games-list';
			const response = await fetch(url);
			const data = await response.json();

			// Build normalized name lookup map
			psplusGamesMap = new Map();
			data.forEach(category => {
				if (category.games) {
					category.games.forEach(game => {
						const normalizedName = normalizeName(game.nameEn || game.name);
						psplusGamesMap.set(normalizedName, {
							name: game.nameEn || game.name,
							conceptUrl: game.conceptUrl,
							device: game.device
						});
					});
				}
			});
			return psplusGamesMap;
		} catch (error) {
			console.error('Failed to load PS Plus games:', error);
			psplusGamesMap = new Map();
			return psplusGamesMap;
		}
	})();

	return psplusLoadPromise;
};

// Normalize game name for matching
const normalizeName = (name) => {
	if (!name) return '';
	return name
		.toLowerCase()
		.replace(/[™®©]/g, '')
		.replace(/[:''"\-–—]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
};

// Check if game matches PS Plus by name
const checkPSPlus = async (gameName) => {
	const map = await loadPSPlusGames();
	const normalized = normalizeName(gameName);
	return map.get(normalized) || null;
};

// Add PS Plus info to game response
const addPSPlusToGames = async (games) => {
	if (!games || !Array.isArray(games)) return games;

	await loadPSPlusGames();

	for (const game of games) {
		if (game.name && game.status === 'found') {
			const psplusMatch = await checkPSPlus(game.name);
			if (psplusMatch) {
				if (!game.subs) game.subs = {};
				game.subs.psplus = {
					status: 'active',
					date: {
						since: null,
						until: null
					},
					link: psplusMatch.conceptUrl,
					target: '_blank'
				};
			}
		}
	}

	return games;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.type) {
		case 'fetch-game':
			fetchData(request.data, 'game')
				.then(r => addPSPlusToGames(r))
				.then(r => sendResponse(r));
		break;
		case 'fetch-pass':
			fetchData(request.data, 'pass').then(r => sendResponse(r));
		break;
		case 'fetch-menu':
			getMenu(request.data, 'menu').then(r => sendResponse(r));
		break;
	}

	return true;
});

const getMenu = async (data, url) => {
	// todo: clear cache if settings change
	const menu = await chrome.storage.session.get("menu");

	// Check if the menu is in the cache and if it's not older than 15 minutes
	if (menu?.menu?.timestamp > Date.now() - 1000 * 60 * 15) {
		return menu?.menu?.data;
	}

	return await fetchData(data, url);
}

const fetchData = async (data, url) => {
	const save = await chrome.storage.sync.get("aSub_options");
	const enabled = save?.aSub_options?.options?.enabled ?? {};

	// Add the extension options to the data
	const keys = Object.keys(enabled).filter(key => enabled[key] === false);
	if (keys.length > 0) {
		data.ec = keys;
	}

	// Add the extension version to the data
	const version = chrome.runtime.getManifest().version;
	data.v = version.replaceAll('.', '-');

	return fetch(`https://aligueler.com/SubscriptionInfo/ajax/${url}data.php`, {
		method: 'POST',
		headers: {
			// 'Autorization': 'Basic ' + btoa(''),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}).then(async response => {
		try {
			const jsonData = await response.json();
			if (url === 'menu') {
				chrome.storage.session.set({ menu: { data: jsonData, timestamp: Date.now() } });
			}
			return jsonData;
		} catch (error) {
			console.error(error, response);
		}
	});
}