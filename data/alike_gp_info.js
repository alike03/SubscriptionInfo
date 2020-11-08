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
      if (!game.classList.contains('alike_sub')) {
        gameListHome.push(game.dataset.dsAppid);
        game.classList.add('alike_sub');
      }
    });

    getGameList(gameListHome, 1);

    document.addEventListener('scroll', function() { limitFunction(moreHomeList) });
      
    function moreHomeList() {
      let gameListHomeMore = [];
      document.querySelectorAll('.page_content_ctn:not(.alike_sub_read)').forEach(list => {
        list.classList.add('alike_sub_read');
        list.querySelectorAll('[data-ds-appid]:not(.screenshot)').forEach(game => {
          if (!game.classList.contains('alike_sub')) {
            gameListHomeMore.push(game.dataset.dsAppid);
            game.classList.add('alike_sub');
          }
        });
      });

      getGameList(gameListHomeMore, 2);
      triggerLimit = false;
    }
  })
} else
// Search Page
if (path.split('/')[1] === 'search') {
  waitForElement('.search_results #search_result_container #search_resultsRows').then(function() {

    window.addEventListener('popstate', function() { limitFunction(filterSearchList) });
    document.addEventListener('scroll', function() { limitFunction(filterSearchList) });
    document.getElementById('advsearchform').addEventListener("submit", function() { limitFunction(filterSearchList) });
    document.getElementById('advsearchform').addEventListener('keyup', function(e) {
      if (e.key === 13) limitFunction(filterSearchList);
    })
    filterSearchList();

    function filterSearchList() {
      let list = [];

      document.querySelectorAll('#search_resultsRows a[data-ds-appid]:not(.alike_sub)').forEach(game => {
        if (!game.classList.contains('alike_sub')) {
          list.push(game.dataset.dsAppid);
          game.classList.add('alike_sub');
        }
      });

      getGameList(list, 4);
      triggerLimit = false;
    }
  });
} else
// Wishlist page
if (path.split('/')[1] === 'wishlist') {
  waitForElement('.page_content #wishlist_ctn .wishlist_row').then(function() {
    document.getElementById('wishlist_search').addEventListener("keyup", function() { limitFunction(filterWishlistList) });
    document.addEventListener('scroll', function() { limitFunction(filterWishlistList) });
    filterWishlistList();

    function filterWishlistList() {
      let list = [];
      Array.from(document.getElementById('wishlist_ctn').children).forEach(game => {
        if (!game.classList.contains('alike_sub')) {
          list.push(game.dataset.appId);
          game.classList.add('alike_sub');
        }
      });
  
      getGameList(list, 5);
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
      addSubInfo(3, response);
    });
  });
  waitForElement('.release_date .date').then(function(element) {
    transferData(1, 'v=' + version.replaceAll('.', '-') + '&type=info&id=' + appId + '&date=' + element.textContent);
  });
} else
// Developer and Publisher
if (path.split('/')[1] === 'developer' || path.split('/')[1] === 'publisher' || path.split('/')[1] === 'curator') {
  document.addEventListener('scroll', function() { limitFunction(filterDev) });
  filterDev();
      
  function filterDev() {
    let list = [];
    document.querySelectorAll('a[data-ds-appid]:not(.alike_sub)').forEach(game => {
      if (!game.classList.contains('alike_sub')) {
        list.push(game.dataset.dsAppid);
        game.classList.add('alike_sub');
      }
    });

    getGameList(list, 1);
    triggerLimit = false;
  }
}

/*******  Functions  *******/

function getGameList(list, type) {
  let uniq = [ ...new Set(list.filter(Boolean)) ];
  if (uniq.length > 0) {
    transferData(0, 'v=' + version.replaceAll('.', '-') + '&id=' + uniq.toString(), function(resp) {
      response = JSON.parse(resp);
      response.forEach(game => { addSubInfo(type, game) });
    });
  }
}

function limitFunction(f) {
  if (!triggerLimit) {
    triggerLimit = true;
    setTimeout(function() { f(); }, 700);
  }
}

function addSubInfo(t, g) {
  if(typeof g === 'undefined' || Object.keys(g.subs).length < 1) return false;

  let container = document.createElement('div');
  for (const [p, sub] of Object.entries(g.subs)) {
    let flagDiv = document.createElement('div');
    flagDiv.setAttribute('class', 'sub_flag ' + sub.status + ' ' + p);
    flagDiv.innerText = alike_lang.flag[sub.status](p);
    container.appendChild(flagDiv);

    if (t === 3) {
      let textDiv = document.createElement('div');
      textDiv.setAttribute('class', 'sub_text ' + sub.status + ' ' + p);
      textDiv.innerHTML = '<span>' + alike_lang.long[sub.status](p, g.name, sub.date) + '</span>';
      container.appendChild(textDiv);
    }
  };

  container.setAttribute('class', 'alike_cont type-' + t);
  switch (t) {
    case 1://done
      parent = '.alike_sub[data-ds-appid="' + g.sid + '"]';
      break;
    case 2://done
      parent = 'div:not(.alike_sub_read) .alike_sub[data-ds-appid="' + g.sid + '"]';
      break;
    case 3:
      parent = '.page_content_ctn > .block .queue_overflow_ctn';
      break;
    case 4://done
      parent = '.alike_sub[data-ds-appid="' + g.sid + '"] .search_name p';
      break;
    case 5://done
      parent = 'div.alike_sub[data-app-id="' + g.sid + '"]';
      break;
  
    default:
      return false;
      break;
  }

  document.querySelectorAll(parent).forEach(element => {
    if (!element.querySelector('.alike_cont')) {
      let cln = container.cloneNode(true);
      element.appendChild(cln);
    }
  });
}