

log('https://aligueler.com/GamePass/');

const isChrome = navigator.userAgent.match('Chrome');
//const isFirefox = navigator.userAgent.match('Firefox');

const version = (isChrome ? chrome : browser).runtime.getManifest().version;

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

function transferData(target, param, callback = null) {
    switch (target) {
        case 1:
            url = 'passdata.php';
            break;

        case 2:
            url = 'menudata.php';
            break;

        default:
            url = 'gamedata.php';
            break;
    }

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

function log(text) {
    console.log(
        '%c [alike03\'s Sub info] %c ' + text,
        'color:#f7f7f7; background-color:#0f780f;',
        'color:inherit; background-color:inherit;'
    );
}