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
  
  transferData(0, 'v=' + version.replaceAll('.', '-') + '&id=' + appId, function(resp) {
    response = JSON.parse(resp)[0];
    waitForElement('.page_content_ctn > .block .queue_overflow_ctn').then(function() {
      addGamePassInfo('a', response);
    });
  });
  waitForElement('.release_date .date').then(function(element) {
    transferData(1, 'v=' + version.replaceAll('.', '-') + '&type=info&id=' + appId + '&date=' + element.textContent);
  });
}

/*******  Functions  *******/

function getGameList(list, type) {
  let uniq = [ ...new Set(list.filter(Boolean)) ];
  if (uniq.length > 0) {
    transferData(0, 'v=' + version.replaceAll('.', '-') + '&id=' + uniq.toString(), function(resp) {
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
    info: g.name + ' has been on Xbox Game Pass since  ' + dateSince
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
        info: g.name + ' is coming to Xbox Game Pass on ' + dateSince
      }
      break;
  }
  
  let flagDiv = document.createElement('div');
  flagDiv.setAttribute('class', 'gp_flag');
  flagDiv.innerText = (text.flag + ' GAMEPASS');

  let container = document.createElement('div');
  className = 'page_content gp_app_cont';
  if (t === 's') className = 'gp_search_cont';
  if (t === 'w') className = 'gp_wishlist_cont';
  if (t === 'h') className = 'gp_home_cont';
  if (t === 'hm') className = 'gp_home_cont';

  container.setAttribute('class', className + ' alike_gamepass gp_' + g.gamepass.status);
  container.appendChild(flagDiv);
  if (t === 'a') {
    let textDiv = document.createElement('div');
    textDiv.setAttribute('class', 'gp_text');
    textDiv.innerText = (text.info);
    container.appendChild(textDiv);
  }

  if (t === 's') parent = '.alike_gp[data-ds-appid="' + g.steam_id + '"] .search_name p';
  else if (t === 'w') parent = 'div.alike_gp[data-app-id="' + g.steam_id + '"] .stats';
  else if (t === 'h') parent = '.alike_gp[data-ds-appid="' + g.steam_id + '"]';
  else if (t === 'hm') parent = 'div:not(.alike_gp_read) .alike_gp[data-ds-appid="' + g.steam_id + '"]';
  else parent = '.page_content_ctn > .block .queue_overflow_ctn';

  document.querySelectorAll(parent).forEach(element => {
    if (!element.querySelector('.alike_gamepass')) {
      let cln = container.cloneNode(true);
      element.appendChild(cln);
    }
  });
}