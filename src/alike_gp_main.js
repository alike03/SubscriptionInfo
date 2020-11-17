

log('https://aligueler.com/GamePass/');

const isChrome = navigator.userAgent.match('Chrome');
//const isFirefox = navigator.userAgent.match('Firefox');
const currentBrowser = (isChrome ? chrome : browser);

const version = currentBrowser.runtime.getManifest().version;

const platforms = ["gamepasspc", "gamepasscon", "ubiplus", "eaplay"];

let save = {
    options: {
        enabled: {
            gamepasspc: true,
            gamepasscon: true,
            ubiplus: true,
            eaplay: true
        }
    }
};

let saveLoaded = loadData();

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

async function transferData(target, param, callback = null) {
    await saveLoaded;
    
    switch (target) {
        case 1:
            url = 'passdata.php';
            break;

        case 2:
            url = 'menudata.php';
            param += "&ns=" + getStatusAsString(save.options.enabled, false);
            break;

        default:
            url = 'gamedata.php';
            param += "&ns=" + getStatusAsString(save.options.enabled, false);
            break;
    }

    log(param);
    let xhr = new XMLHttpRequest;
    xhr.open('POST', 'https://aligueler.com/GamePass/ajax/' + url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (callback != null && this.readyState == 4 && this.status == 200) {
            callback(xhr.responseText);
        };
    }
    xhr.send(param);
}

function getStatusAsString(target, status) {
    let resp = '';

    Object.keys(target).forEach(function(child) {
        if (target[child] === status) 
            resp += child + ",";
    });

    return resp.substring(0, resp.length - 1);
}

function saveData() {
    currentBrowser.storage.sync.set({"aSub_options": save}, function() {
        log("Options saved");
    });
}

function loadData() {
    return new Promise(function (resolve, reject) {
        currentBrowser.storage.sync.get("aSub_options", function(result) {
            if (typeof result.aSub_options === 'object')
                loadSavedSettings(result.aSub_options, save);

            console.log(result);
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

function log(text) {
    console.log(
        '%c [alike03\'s Sub info] %c ' + text,
        'color:#f7f7f7; background-color:#0f780f;',
        'color:inherit; background-color:inherit;'
    );
}