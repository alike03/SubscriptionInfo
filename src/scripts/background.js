chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.type) {
		case 'fetch-game':
			fetchData(request.data, 'game').then(r => sendResponse(r));
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