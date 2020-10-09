log('https://aligueler.com/GamePass/');
const version = '1-0-2-1';
const path = window.location.pathname;
var triggerLimit = false;

// Starting page
if (path.split('/')[1] === '') {
  waitForElement('.home_page_content .maincap .carousel_items a[data-ds-appid]').then(function() {
    let gameListHome = [];
    document.querySelectorAll(
      '.home_page_content .carousel_items a[data-ds-appid],' +
      '.home_page_content .carousel_items div[data-ds-appid],' +
      '.home_page_content .store_capsule_frame a[data-ds-appid],' +
      '.home_page_content .home_tabs_content .tab_content a[data-ds-appid],' +
      '.home_page_content .marketingmessage_container a[data-ds-appid]'
    ).forEach(game => {
      if (!game.classList.contains('alike_gp')) {
        gameListHome.push(game.dataset.dsAppid);
        game.classList.add('alike_gp');
      }
    });
    if (gameListHome.filter(Boolean).length > 0) {
      let uniq = [ ...new Set(gameListHome.filter(Boolean)) ];
      transferData(0, 'v1=' + version + '&id=' + uniq.toString(), function(resp) {
        response = JSON.parse(resp);
        response.forEach(game => { addGamePassInfo('h', game) });
      });
    }

    document.addEventListener('scroll', limitHome);
    function limitHome() {
      if (!triggerLimit) {
        setTimeout(moreHomeList, 700);
        triggerLimit = true;
      }
    }
      
    function moreHomeList() {
      let gameListHomeMore = [];
      document.querySelectorAll('.page_content_ctn:not(.alike_gp_read)').forEach(list => {
        list.classList.add('alike_gp_read');
        list.querySelectorAll('[data-ds-appid]').forEach(game => {
          if (!game.classList.contains('alike_gp')) {
            gameListHomeMore.push(game.dataset.dsAppid);
            game.classList.add('alike_gp');
          }
        });
      });
  
      if (gameListHomeMore.filter(Boolean).length > 0) {
        let uniq = [ ...new Set(gameListHomeMore.filter(Boolean)) ];
        transferData(0, 'v1=' + version + '&id=' + uniq.toString(), function(resp) {
          response = JSON.parse(resp);
          response.forEach(game => { addGamePassInfo('hm', game) });
        });
      }
      triggerLimit = false;
    }
  })
} else
// Search Page
if (path.split('/')[1] === 'search') {
  waitForElement('.search_results #search_result_container #search_resultsRows').then(function() {

    window.addEventListener('popstate', limitSearch);
    document.addEventListener('scroll', limitSearch);
    document.getElementById('advsearchform').addEventListener("submit", limitSearch);
    document.getElementById('advsearchform').addEventListener('keyup', function(e){
      var char = e.which || e.keyCode;
      if (char === 13) limitSearch();
    })
    filterSearchList();

    function limitSearch() {
      if (!triggerLimit) {
        triggerLimit = true;
        setTimeout(filterSearchList, 700);
      }
    }

    function filterSearchList() {
      let gameListSearch = [];

      document.querySelectorAll('#search_resultsRows a[data-ds-appid]:not(.alike_gp)').forEach(game => {
        if (!game.classList.contains('alike_gp')) {
          gameListSearch.push(game.dataset.dsAppid);
          game.classList.add('alike_gp');
        }
      });
  
      if (gameListSearch.filter(Boolean).length > 0) {
        transferData(0, 'v1=' + version + '&id=' + gameListSearch.filter(Boolean).toString(), function(resp) {
          response = JSON.parse(resp);
          response.forEach(game => { addGamePassInfo('s', game) });
        });
      }
      triggerLimit = false;
    }
  });
} else
// Wishlist page
if (path.split('/')[1] === 'wishlist') {
  waitForElement('.page_content #wishlist_ctn .wishlist_row').then(function() {
    var triggerLimit = false;

    document.getElementById('wishlist_search').addEventListener("keyup", limitWishlist);
    document.addEventListener('scroll', limitWishlist);
    filterWishlistList();

    function limitWishlist() {
      if (!triggerLimit) {
        triggerLimit = true;
        setTimeout(filterWishlistList, 700);
      }
    }

    function filterWishlistList() {
      let gameListWishlist = [];
      Array.from(document.getElementById('wishlist_ctn').children).forEach(game => {
        if (!game.classList.contains('alike_gp')) {
          gameListWishlist.push(game.dataset.appId);
          game.classList.add('alike_gp');
        }
      });
  
      if (gameListWishlist.filter(Boolean).length > 0) {
        transferData(0, 'v1=' + version + '&id=' + gameListWishlist.filter(Boolean).toString(), function(resp) {
          response = JSON.parse(resp);
    
          response.forEach(game => { addGamePassInfo('w', game) });
        });
      }
      triggerLimit = false;
    }
  });
} else
// App store page
if (path.split('/')[1] === 'app') {
  let appId = path.split('/')[2];
  transferData(0, 'v=' + version + '&id=' + appId, function(response) {
    game = JSON.parse(response)[0];

    if(game.gamepass) {
      addGamePassInfo('a', game);

      waitForElement('.release_date .date').then(function(element) {
        transferData(1, 'v=' + version + '&type=info&id=' + appId + '&xid=' + game.xbox_id + '&date=' + element.textContent);
      });
    }
  });
}

/*******  Functions  *******/

function addGamePassInfo(t, g) {
  if(g.gamepass.status == null)
    return false;

  dateSince = getDateString(g.gamepass.date.since);
  if(g.gamepass.date.until) dateTill = getDateString(g.gamepass.date.until, 'on');

  let text = {
    flag: 'ON',
    info: g.name + ' is since ' + dateSince + ' on Xbox Game Pass'
  }

  switch (g.gamepass.status) {
    case 'left':
      text = {
        flag: 'LEFT',
        info: g.name + ' left Xbox Game Pass ' + (g.gamepass.date.until ? dateTill : '' )
      }
      break;
  
    case 'leaving':
      text = {
        flag: 'LEAVING',
        info: g.name + ' is leaving Xbox Game Pass ' + (g.gamepass.date.until ? dateTill : 'soon' )
      }
      break;
  
    case 'soon':
      text = {
        flag: 'SOON ON',
        info: g.name + ' is coming ' + dateSince +' to Xbox Game Pass'
      }
      break;
  }
  
  let flagDiv = document.createElement('div');
  flagDiv.setAttribute('class', 'gp_flag');
  flagDiv.innerText = (text.flag + ' GAMEPASS');
  
  let textDiv = document.createElement('div');
  textDiv.setAttribute('class', 'gp_text');
  textDiv.innerText = (text.info);
  
  let errorDiv = document.createElement('div');
  errorDiv.setAttribute('class', 'gp_error');
  errorDiv.setAttribute('title', 'Report "' + g.name + '" for errors');
  errorDiv.innerHTML = '&#9888';
  errorDiv.onclick = function () {
    if (confirm('Do you really want to report ' + g.name + '?')) {
      transferData(1, 'v=' + version + '&type=error&id=' + appId + '&name=' + g.name, function(r) {
        alert(g.name + ' was successfully is reported\nThank you');
      });
    }
  };

  let container = document.createElement('div');
  className = 'page_content gp_app_cont';
  if (t === 's') className = 'gp_search_cont';
  if (t === 'w') className = 'gp_wishlist_cont';
  if (t === 'h') className = 'gp_home_cont';
  if (t === 'hm') className = 'gp_home_cont';

  container.setAttribute('class', className + ' alike_gamepass gp_' + g.gamepass.status);
  container.appendChild(flagDiv);
  if (t === 'a') {
    container.appendChild(textDiv);
    container.appendChild(errorDiv);
  }

  parent = '.page_content_ctn > .block .queue_overflow_ctn';
  if (t === 's') parent = 'a.alike_gp[data-ds-appid="' + g.steam_id + '"] .search_name p';
  if (t === 'w') parent = 'div.alike_gp[data-app-id="' + g.steam_id + '"] .stats';
  if (t === 'h') parent = 'a.alike_gp[data-ds-appid="' + g.steam_id + '"]';
  if (t === 'hm') parent = 'div:not(.alike_gp_read) .alike_gp[data-ds-appid="' + g.steam_id + '"]';

  document.querySelectorAll(parent).forEach(element => {
    let cln = container.cloneNode(true);
    element.appendChild(cln);
  });
}

function waitForElement(selector) {
  return new Promise(function(resolve, reject) {
    let element = document.querySelector(selector);

    if(element) {
      resolve(element);
      return;
    }

    let observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        let nodes = Array.from(mutation.addedNodes);
        for(let node of nodes) {
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

function getDateString(date, str_b = '', str_a = '') {
  d = new Date(date);
  if(d.setHours(0,0,0,0) == new Date().setHours(0,0,0,0)) return ' today';
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  return (str_b + ' ' + da + ' ' + mo + ', ' + ye + ' ' + str_b);
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

  let xhr = new XMLHttpRequest;

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