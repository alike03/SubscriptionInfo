"use strict";

waitForElement('#global_action_menu').then(function (element) {
  var title = document.createElement('h1');
  title.setAttribute('class', 'ag_changes_title');
  title.innerText = "Loading...";
  var xhr_data = document.createElement('div');
  xhr_data.setAttribute('class', 'alike_xhr_data');
  var container = document.createElement('div');
  container.setAttribute('class', 'ag_changes');
  container.appendChild(title);
  container.appendChild(xhr_data);
  var span = document.createElement('span');
  span.setAttribute("class", "pulldown pulldownButton");
  span.innerText = "alike03's Subscription Info";
  var span2 = document.createElement('span');
  span2.setAttribute('class', 'pulldownButton');
  span.appendChild(span2);
  var button = document.createElement('div');
  button.setAttribute('id', 'ag_changes_button');
  button.appendChild(span);
  button.appendChild(container);

  if (save.options.menuToggle == 'mouseenter') {
    button.onmouseenter = function () {
      container.classList.remove('closed');
      container.classList.add('open');
    };

    button.onmouseleave = function () {
      container.classList.remove('open');
      container.classList.add('closed');
    };
  } else {
    button.onclick = function (e) {
      if (!e.target.classList.contains('pulldownButton')) return;

      if (document.querySelector('.ag_changes').classList.contains('open')) {
        container.classList.remove('open');
        container.classList.add('closed');
      } else {
        container.classList.remove('closed');
        container.classList.add('open');
      }
    };
  }

  element.querySelectorAll('#ag_changes_button').forEach(function (oldButton) {
    oldButton.remove();
  });
  element.prepend(button);
  loadChanges(save.options.timeFrame);
});

function createElementsFromJSON(content, parent) {
  if (content.hasOwnProperty('element')) {
    var obj = document.createElement(content.element);

    if (content.hasOwnProperty('attributes')) {
      for (var attr in content.attributes) {
        obj.setAttribute(attr, content.attributes[attr]);
      }
    }

    if (content.hasOwnProperty('text')) {
      obj.appendChild(document.createTextNode(content.text));
    }

    parent.appendChild(obj);

    if (content.hasOwnProperty('children')) {
      if (Array.isArray(content.children)) {
        for (var child in content.children) {
          createElementsFromJSON(content.children[child], obj);
        }
      } else {
        createElementsFromJSON(content.children, obj);
      }
    }
  } else if (Array.isArray(content)) {
    for (var _child in content) {
      createElementsFromJSON(content[_child], parent);
    }
  }
}

function loadChanges(tf) {
  transferData(2, "v=" + version.replaceAll(".", "-") + "&tf=" + tf, function (resp) {
    response = JSON.parse(resp);
    document.querySelector(".ag_changes_title").innerText = "alike03's Subscription Info on Steam v" + version;
    var ajax_parent = document.querySelector(".alike_xhr_data");
    createElementsFromJSON(response, ajax_parent);
    loadOptions();
    loadTabButtons();
    loadNavArrows();
  });
}

function loadOptions() {
  var button = document.createElement("div");
  button.setAttribute("class", "ag_tab_button ag_button icon");
  button.setAttribute("data-id", "ag_options");
  button.appendChild(document.createTextNode("Options"));
  var pulldown = document.createElement('span');
  pulldown.setAttribute("class", "pulldown");
  button.appendChild(pulldown);
  var page = currentBrowser.runtime.getURL("alike_gp_options.json");
  fetch(page).then(function (response) {
    return response.json();
  }).then(function (result) {
    createElementsFromJSON(result, document.querySelector(".alike_xhr_data .ag_tabs")); // Load menuToggle

    var menuToggle_parent = document.querySelector('.aSubO_menuToggle');
    var currToggle = menuToggle_parent.querySelector('option[value="' + save.options.menuToggle + '"]');
    currToggle.setAttribute('selected', '');
    menuToggle_parent.addEventListener('change', function (e) {
      save.options.menuToggle = e.target.value;
      saveData();
    }); // Load Timeframe

    var timeFrame_parent = document.querySelector('.aSubO_timeFrame');
    var currTime = timeFrame_parent.querySelector('option[value="' + save.options.timeFrame + '"]');
    currTime.setAttribute('selected', '');
    timeFrame_parent.addEventListener('change', function (e) {
      save.options.timeFrame = parseInt(e.target.value);
      saveData();
    });
    var sub_parent = document.querySelector('.aSubO_subCont');
    var br = document.createElement("br"); // Load Platform selection

    platforms.forEach(function (p) {
      var cont = document.createElement("div");
      sub_parent.appendChild(cont);
      var input = document.createElement("input");
      input.setAttribute("type", "checkbox");
      input.setAttribute("class", "ag_checkbox");
      input.setAttribute("id", "aSub_" + p);
      input.setAttribute("name", "aSub_" + p);
      input.setAttribute("value", p);
      if (save.options.enabled[p]) input.setAttribute("checked", "checked");
      cont.appendChild(input);
      var label = document.createElement("label");
      label.setAttribute("for", "aSub_" + p);
      label.appendChild(document.createTextNode("\xA0\xA0" + alike_lang.options.which_sub(p)));
      cont.appendChild(label);
      cont.appendChild(br.cloneNode(true));
      cont.appendChild(br.cloneNode(true));
      sub_parent.querySelector('#aSub_' + p).addEventListener('click', function (e) {
        save.options.enabled[e.target.value] = e.target.checked;
        saveData();
      });
    });
  });
  document.querySelector(".alike_xhr_data .ag_buttons").appendChild(button);
}

function loadTabButtons() {
  waitForElement('.ag_changes .ag_tab_button').then(function (e) {
    e.classList.add('active');
    document.getElementById(e.dataset.id).style.display = 'block';
    document.querySelectorAll('.ag_changes .ag_tab_button').forEach(function (button) {
      button.addEventListener('mouseenter', function (e) {
        var hButton = e.currentTarget;
        Array.from(hButton.parentNode.children).forEach(function (lButton) {
          if (lButton === hButton) lButton.classList.add('active');else lButton.classList.remove('active');
        });
        var activeTab = document.getElementById(hButton.dataset.id);
        Array.from(activeTab.parentNode.children).forEach(function (tab) {
          tab.style.display = tab === activeTab ? 'block' : 'none';
        });
      });
    });
  });
}

function loadNavArrows() {
  waitForElement('.ag_changes .arrow.left').then(function () {
    document.querySelectorAll('.ag_changes .arrow.left').forEach(function (left) {
      left.addEventListener('click', function (e) {
        slideSelection(e.currentTarget, -1, e.currentTarget.nextElementSibling);
      });
    });
    document.querySelectorAll('.ag_changes .arrow.right').forEach(function (right) {
      right.addEventListener('click', function (e) {
        slideSelection(e.currentTarget, 1, e.currentTarget.previousElementSibling);
      });
    });

    function slideSelection(e, change, sib) {
      clist = e.classList;

      if (!clist.contains('disabled')) {
        var cont = e.parentNode.firstElementChild.firstElementChild;
        var pos = parseInt(cont.dataset.position) + change;
        sib.classList.remove('disabled');
        cont.setAttribute("data-position", pos);
        cont.style.transform = "translateX(-" + 100 * pos + "%)";

        if (change === -1) {
          if (parseInt(cont.dataset.position) <= 0) clist.add('disabled');
        } else if (change === 1 && parseInt(cont.dataset.position) + 1 >= cont.childElementCount / 5) {
          clist.add('disabled');
        }
      }
    }
  });
}