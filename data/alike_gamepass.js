log('https://aligueler.com/GamePass/');
const version = '1-0-1';
var appId = window.location.pathname.split('/')[2];

transferData(0, 'v=' + version + '&id=' + appId, function(response) {
  game = JSON.parse(response)[0];

  if(game.gamepass) {
    gameOnGamePass(game.name, game.gamepass);
    log('Data for ' + game.name + ' loaded');
  }
});

waitForElement('.release_date .date').then(function(element) {
  transferData(1, 'v=' + version + '&id=' + appId + '&date=' + element.textContent);
});

/*******  Functions  *******/

function gameOnGamePass(name, gamepass) {
  if(gamepass.status == null)
    return false;

  dateSince = getDateString(gamepass.date.since);
  if(gamepass.date.until) dateTill = getDateString(gamepass.date.until);

  var text = {
    flag: 'IN',
    info: name + ' is since ' + dateSince + ' on Xbox Game Pass'
  }

  switch (gamepass.status) {
    case 'left':
      text = {
        flag: 'LEFT',
        info: name + ' left Xbox Game Pass' + (gamepass.date.until ? ' on ' + dateTill : '' )
      }
      break;
  
    case 'leaving':
      text = {
        flag: 'LEAVING',
        info: name + ' is leaving Xbox Game Pass ' + (gamepass.date.until ? 'on ' + dateTill : 'soon' )
      }
      break;
  
    case 'soon':
      text = {
        flag: 'SOON IN',
        info: name + ' is coming ' + dateSince +' to Xbox Game Pass'
      }
      break;
  }
  
  var flagDiv = document.createElement('div');
  flagDiv.setAttribute('class', 'gp_flag ds_flag');
  flagDiv.innerText = (text.flag + ' GAMEPASS');
  
  var textDiv = document.createElement('div');
  textDiv.setAttribute('class', 'gp_text');
  textDiv.innerText = (text.info);
  
  var errorDiv = document.createElement('div');
  errorDiv.setAttribute('class', 'gp_error');
  errorDiv.setAttribute('title', 'Report "' + name + '" for errors');
  errorDiv.innerHTML = '&#9888';
  errorDiv.onclick = function () {
    if (confirm('Do you really want to report ' + name + '?')) {
      transferData(1, 'v=' + version + '&id=' + appId + '&name=' + name + '&error=1', function(r) {
        alert(name + ' was successfully is reported\nThank you');
      });
    }
  };

  var container = document.createElement('div');
  container.setAttribute('class', 'page_content gp_container gp_' + gamepass.status);
  container.appendChild(flagDiv);
  container.appendChild(textDiv);
  container.appendChild(errorDiv);
  
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

function getDateString(date) {
  d = new Date(date);
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  return (da + ' ' + mo + ', ' + ye);
}

function transferData(target, param, callback = null) {
  switch (target) {
    case 1:
      url = 'passdata.php';
      break;
  
    default:
      url = 'gamedata.php';
      break;
  }

  var xhr = new XMLHttpRequest;

  xhr.open('POST', 'https://aligueler.com/GamePass/' + url, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (callback != null && this.readyState == 4 && this.status == 200) {
      callback(xhr.responseText);
    };
  }
  xhr.send(param);
}

function log(text) {
  console.log(
    '%c [Gamepass] %c ' + text,
    'color:#f7f7f7; background-color:#0f780f;',
    'color:inherit; background-color:inherit;'
  );
}