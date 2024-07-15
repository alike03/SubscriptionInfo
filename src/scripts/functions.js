/*******  Variables  *******/
const version = chrome.runtime.getManifest().version;
const platforms = ["gamepasspc", "gamepasscon", "ubiplus", "eaplay", "eaplaypro"];

let save = {
    options: {
        enabled: {
            gamepasspc: true,
            gamepasscon: true,
            ubiplus: true,
            eaplay: true,
            eaplaypro: true
        },
        timeFrame: 30,
        menuToggle: 'click',
		showNoInfoBar: true
    }
};

/*******  Updated Functions  *******/
const log = (...args) => {
	let messageConfig = '%c%s ';

	args.forEach((argument) => {
		messageConfig += '%o';
	});

	console.log(messageConfig, 'color:#f7f7f7; background-color:#0f780f;', '[alike03\'s Sub info]', ...args);
};

let saveLoaded = loadData();

log('https://aligueler.com/SubscriptionInfo/');

/*******  Functions  *******/

function waitForElement(selector) {
    return new Promise(function (resolve, reject) {
        let element = document.querySelector(selector);

        if (element) {
            resolve(element);
            return;
        }

        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                let nodes = Array.from(mutation.addedNodes);
                for (let node of nodes) {
                    if (node.matches && node.matches(selector)) {
                        observer.disconnect();
                        resolve(node);
                        return;
                    }
                };
            });
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
}

function saveData() {
    chrome.storage.sync.set({"aSub_options": save}, function() {
        log("Options saved");
    });
}

function loadData() {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.get("aSub_options", function(result) {
            if (typeof result === 'object' && typeof result.aSub_options !== 'undefined' && typeof result.aSub_options === 'object')
                loadSavedSettings(result.aSub_options, save);

            resolve(true);
        })
    });
}

function loadSavedSettings(obj, save) {
    if (typeof obj !== 'object') return false;
    Object.keys(obj).forEach(function(child, key) {
        if (obj[child] === Object(obj[child])) loadSavedSettings(obj[child], save[child]);
        else save[child] = obj[child];
    });
}