log('https://aligueler.com/GamePass/');
//var appId = document.getElementsByClassName('apphub_AppName')[0].dataset.dsAppid;
var appId = window.location.pathname.split('/')[2];

var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://aligueler.com/GamePass/is_on_gamepass.php?id=' + appId, true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    var resp = JSON.parse(xhr.responseText);

    if(resp.gamepass) {
      gameOnGamePass(resp.name, resp.since);
      log('Data for ' + resp.name + ' loaded');
    }
  }
}
xhr.send();

function log(text) {
  console.log(
    '%c [Gamepass] %c ' + text,
    'color:#f7f7f7; background-color:#0f780f;',
    'color:inherit; background-color:inherit;'
  );
}

function gameOnGamePass(name, date) {
  d = new Date(date);
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  var dateString = da + ' ' + mo + ', ' + ye;

  if (dateString == '27 Sep, 2020') {
    //dateString = 'before this database was created (' + dateString + ')'; 🛈
    dateString = 'before ' + dateString;
  }
  
  var flag = document.createElement('div');
  flag.setAttribute('class', 'on_gamepass_flag ds_flag');
  flag.innerText = 'IN GAMEPASS';
  
  var text = document.createElement('div');
  text.setAttribute('class', 'on_gamepass_text');
  text.innerText = name + ' is on Xbox Game Pass since ' + dateString;

  var container = document.createElement('div');
  container.setAttribute('class', 'game_area_on_gamepass page_content');
  container.appendChild(flag);
  container.appendChild(text);
  
  waitForElement('.page_content_ctn > .block .queue_overflow_ctn').then(function(element) {
    element.appendChild(container);
    log('Info added');
  });
}

function waitForElement(selector) {
  return new Promise(function(resolve, reject) {
    var element = document.querySelector(selector);

    if(element) {
      resolve(element);
      return;
    }

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var nodes = Array.from(mutation.addedNodes);
        for(var node of nodes) {
          if(node.matches && node.matches(selector)) {
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