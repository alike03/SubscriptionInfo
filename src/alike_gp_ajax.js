waitForElement('#store_nav_area .store_nav').then(function (element) {
    let title = document.createElement('h1');
    title.setAttribute('class', 'ag_changes_title');
    title.innerText = "Loading...";

    let xhr_data = document.createElement('div');
    xhr_data.setAttribute('class', 'alike_xhr_data');

    let container = document.createElement('div');
    container.setAttribute('class', 'ag_changes');
    container.appendChild(title);
    container.appendChild(xhr_data);

    let span = document.createElement('span');
    span.setAttribute('class', 'pulldown');
    span.innerText = "alike03's Sub Info";
    span.appendChild(document.createElement('span'));

    let button = document.createElement('a');
    button.setAttribute('class', 'tab');
    button.setAttribute('id', 'ag_changes_button');

    button.appendChild(span);
    button.appendChild(container);
    button.onmouseenter = function () {
        if (!container.classList.contains('open') && !container.classList.contains('closed')) {
            let date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate() + 1);
            date = date.toISOString().slice(0, 10);
            loadChanges(date);
        }
        container.classList.remove('closed');
        container.classList.add('open');
    };
    button.onmouseleave = function () {
        container.classList.remove('open');
        container.classList.add('closed');
    };
    element.querySelectorAll('#ag_changes_button').forEach((oldButton) => {
        oldButton.remove();
    });
    element.insertBefore(button, element.querySelector('.search_area'));

    // Adapt Search size
    let searchWidth = element.offsetWidth;
    element.childNodes.forEach((buttonElement) => {
        if (Number.isInteger(buttonElement.offsetWidth)) {
            if (buttonElement.classList.contains('search_area') && searchWidth < 230) {
                buttonElement.querySelector('#searchform').style.width = searchWidth + "px";
                buttonElement.querySelector('#store_nav_search_term').style.width = (searchWidth - 50) + "px";
                buttonElement.querySelector('.searchbox, #store_nav_search_term').style.width = 'auto';
            } else {
                searchWidth -= (buttonElement.offsetWidth + 5);
            }
        }
    });
});

function loadChanges(date) {
    transferData(2, "v=" + version.replaceAll(".", "-") + "&date=" + date, function(resp) {
		response = JSON.parse(resp);
		document.querySelector(".ag_changes_title").innerText = "alike03's Subscription Info on Steam v" + version;

        let buttons = document.createElement("div");
		buttons.setAttribute("class", "ag_buttons");

        let tabs = document.createElement("div");
		tabs.setAttribute("class", "ag_tabs");

		response.forEach(content => {
            let button = document.createElement("div");
			button.setAttribute("class", "ag_tab_button ag_button icon");
			button.dataset.id = content.id;
			button.innerHTML = content.button + '<span class="pulldown"></span>';
			buttons.appendChild(button);

            let tab = document.createElement("div");
			tab.setAttribute("class", "ag_tab");
			tab.setAttribute("id", content.id);
			tab.innerHTML = content.content;
			tabs.appendChild(tab);
        });

        let ajax_parent = document.querySelector(".alike_xhr_data");
        ajax_parent.appendChild(buttons);
		ajax_parent.appendChild(tabs);
		loadTabButtons();
		loadNavArrows();
		loadOptions();
    })
}

function loadOptions() {
    let title = document.createElement("h2");
    title.innerText = "Options";

    let content = document.createElement("div");
    content.setAttribute("class", "cont");
    let inner = '<h3>' + alike_lang.options.which_subs_title + '</h3>';
    inner = inner.concat('<span>(' + alike_lang.options.which_subs_info + ')</span><br>');
    (platforms).forEach(p => {
        inner = inner.concat('<br><div><input type="checkbox" class="ag_checkbox" '+ (save.options.enabled[p] ? 'checked' : '') + ' id="aSub_' + p + '" name="aSub_' + p + '" value="' + p + '">');
        inner = inner.concat('<label for="aSub_' + p + '">&nbsp;&nbsp;' + alike_lang.options.which_sub(p) + '</label></div>');
    });
    content.innerHTML = inner;

    let button = document.createElement("div");
    button.setAttribute("class", "ag_tab_button ag_button icon");
    button.dataset.id = "ag_options";
    button.innerHTML = "Options<span class='pulldown'></span>";
    document.querySelector(".alike_xhr_data .ag_buttons").appendChild(button);

    let tab = document.createElement("div");
    tab.setAttribute("class", "ag_tab");
    tab.setAttribute("id", "ag_options");
    tab.appendChild(title);
    tab.appendChild(content);
    document.querySelector(".alike_xhr_data .ag_tabs").appendChild(tab);

    loadOptionsFunctions();
}

function loadOptionsFunctions() {
    (platforms).forEach(p => {
        document.querySelector('#aSub_' + p).addEventListener('click', (e) => {
            save.options.enabled[e.target.value] = e.target.checked;
            saveData();
        });
    });
}

function loadTabButtons() {
    waitForElement('.ag_changes .ag_tab_button').then(function (e) {
        e.classList.add('active');
        document.getElementById(e.dataset.id).style.display = 'block';
        document.querySelectorAll('.ag_changes .ag_tab_button').forEach((button) => {
            button.addEventListener('mouseenter', (e) => {
                let hButton = e.currentTarget;
                Array.from(hButton.parentNode.children).forEach(lButton => {
                    if (lButton === hButton)
                        lButton.classList.add('active');
                    else
                        lButton.classList.remove('active');
                });
                let activeTab = document.getElementById(hButton.dataset.id);
                Array.from(activeTab.parentNode.children).forEach(tab => {
                    tab.style.display = (tab === activeTab ? 'block' : 'none');
                });
            });
        });
    });
}

function loadNavArrows() {
    waitForElement('.ag_changes .arrow.left').then(function () {
        document.querySelectorAll('.ag_changes .arrow.left').forEach((left) => {
            left.addEventListener('click', (e) => {
                slideSelection(e.currentTarget, -1, e.currentTarget.nextElementSibling);
            });
        });
        document.querySelectorAll('.ag_changes .arrow.right').forEach((right) => {
            right.addEventListener('click', (e) => {
                slideSelection(e.currentTarget, 1, e.currentTarget.previousElementSibling);
            });
        });
        function slideSelection(e, change, sib) {
            clist = e.classList;
            if (!clist.contains('disabled')) {
                let cont = e.parentNode.firstElementChild.firstElementChild;
                let pos = parseInt(cont.dataset.position) + change;
                sib.classList.remove('disabled');
                cont.setAttribute("data-position", pos);
                cont.style.transform = "translateX(-" + (100 * pos) + "%)";
                if (change === -1) {
                    if (parseInt(cont.dataset.position) <= 0)
                        clist.add('disabled');
                } else if (change === 1 && parseInt(cont.dataset.position) + 1 >= cont.childElementCount / 5) {
                    clist.add('disabled');
                }
            }
        }
    });
}