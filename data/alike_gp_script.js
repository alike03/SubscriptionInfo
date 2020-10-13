log('https://aligueler.com/GamePass/');
const version = '1-0-3-0';
const path = window.location.pathname;
var triggerLimit = false;

waitForElement('#store_nav_area .store_nav').then(function(element) {
  addButton(element);
});

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

    getGameList(gameListHome, 'h');

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

      getGameList(gameListHomeMore, 'hm');
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

      getGameList(gameListSearch, 's');
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
  
      getGameList(gameListWishlist, 'w');
      triggerLimit = false;
    }
  });
} else
// App store page
if (path.split('/')[1] === 'app') {
  let appId = path.split('/')[2];
  getGameList([appId], 'a');
  waitForElement('.release_date .date').then(function(element) {
    transferData(1, 'v=' + version + '&type=info&id=' + appId + '&xid=' + game.xbox_id + '&date=' + element.textContent);
  });
}

/*******  Functions  *******/

function addButton(element) {
  let title = document.createElement('h1');
  title.setAttribute('class', 'alike_gp_changes_title');
  title.innerText = "Loading...";

  let xhr_data = document.createElement('div');
  xhr_data.setAttribute('class', 'alike_xhr_data');

  let container = document.createElement('div');
  container.setAttribute('class', 'alike_gp_changes');
  container.appendChild(title);
  container.appendChild(xhr_data);

  let span = document.createElement('span');
  span.setAttribute('class', 'pulldown');
  span.innerText = "Xbox Game Pass";
  span.appendChild(document.createElement('span'));
  
  let button = document.createElement('a');
  button.setAttribute('class', 'tab');
  button.setAttribute('id', 'alike_gp_changes_button');

  button.appendChild(span);
  button.appendChild(container);
  button.onmouseenter = function () {
    if (!container.classList.contains('open') && !container.classList.contains('closed')) {
      let date = new Date(new Date().getFullYear(),new Date().getMonth() - 1, new Date().getDate());
      date = date.toISOString().slice(0,10);
      loadChanges(date);
    }
    container.classList.remove('closed');
    container.classList.add('open');
  };
  button.onmouseleave = function () {
    container.classList.remove('open');
    container.classList.add('closed');
  };
  element.insertBefore(button, element.querySelector('.search_area'));
}

function loadChanges(date) {
  document.querySelector('.alike_gp_changes_title').innerText = "Changes since " + getDateString(date);
  transferData(2, 'v=' + version + '&date=' + date, function(resp) {
    document.querySelector('.alike_xhr_data').innerHTML = resp;
    waitForElement('.alike_gp_changes .arrow.left').then(function() {
      document.querySelectorAll('.alike_gp_changes .arrow.left').forEach((left) => {
        left.addEventListener('click', (e) => {
          slideSelection(e, -1, e.currentTarget.nextElementSibling);
        });
      });
      document.querySelectorAll('.alike_gp_changes .arrow.right').forEach((right) => {
        right.addEventListener('click', (e) => {
          slideSelection(e, 1, e.currentTarget.previousElementSibling);
        });
      });
      function slideSelection(e, change, sib) {
        clist = e.currentTarget.classList;
        if (!clist.contains('disabled')) {
          let cont = e.currentTarget.parentNode.firstChild.firstChild;
          let pos = parseInt(cont.dataset.position) + change;
          sib.classList.remove('disabled');
          cont.setAttribute("data-position", pos);
          cont.style.transform = "translateX(-" + (162 * pos) + "px)";
          if (change === -1) {
            if (parseInt(cont.dataset.position) <= 0)
              clist.add('disabled');
          } else if (change === 1) {
            if (parseInt(cont.dataset.position) > (cont.childElementCount - 6))
              clist.add('disabled');
          }
        }
      }
    });
  });
}

function getGameList(list, type) {
  let uniq = [ ...new Set(list.filter(Boolean)) ];
  if (uniq.length > 0) {
    transferData(0, 'v=' + version + '&id=' + uniq.toString(), function(resp) {
      response = JSON.parse(resp);
      response.forEach(game => { addGamePassInfo(type, game) });
    });
  }
}

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

  if (t === 's') parent = 'a.alike_gp[data-ds-appid="' + g.steam_id + '"] .search_name p';
  else if (t === 'w') parent = 'div.alike_gp[data-app-id="' + g.steam_id + '"] .stats';
  else if (t === 'h') parent = 'a.alike_gp[data-ds-appid="' + g.steam_id + '"]';
  else if (t === 'hm') parent = 'div:not(.alike_gp_read) .alike_gp[data-ds-appid="' + g.steam_id + '"]';
  else parent = '.page_content_ctn > .block .queue_overflow_ctn';

  waitForElement(parent).then(function() {
    document.querySelectorAll(parent).forEach(element => {
      let cln = container.cloneNode(true);
      element.appendChild(cln);
    });
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
  
    case 2:
      url = 'changes.php';
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