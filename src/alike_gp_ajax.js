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
    span.setAttribute("class", "pulldown pulldownButton");
    span.innerText = "alike03's Sub Info";
    
    let span2 = document.createElement('span');
    span2.setAttribute('class', 'pulldownButton');
    span.appendChild(span2);

    let button = document.createElement('a');
    button.setAttribute('class', 'tab');
    button.setAttribute('id', 'ag_changes_button');

    button.appendChild(span);
    button.appendChild(container);

    if (save.options.menuToggle == 'mouseenter') {
        button.onmouseenter = function () {
            container.classList.remove('closed');
            container.classList.add('open');
        }
        button.onmouseleave = function () {
            container.classList.remove('open');
            container.classList.add('closed');
        }
    } else {
        button.onclick = function (e) {
            if (!e.target.classList.contains('pulldownButton'))
                return;
            if (document.querySelector('.ag_changes').classList.contains('open')) {
                container.classList.remove('open');
                container.classList.add('closed');
            } else {
                container.classList.remove('closed');
                container.classList.add('open');
            }
        };
    }

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

    loadChanges(save.options.timeFrame);
});

function createElementsFromJSON(content, parent) {
    if (content.hasOwnProperty('element')) {
        let obj = document.createElement(content.element);

        if (content.hasOwnProperty('attributes')) {
            for(let attr in content.attributes) {
                obj.setAttribute(attr, content.attributes[attr]);
            }
        }

        if (content.hasOwnProperty('text')) {
            obj.appendChild(document.createTextNode(content.text));
        }

        parent.appendChild(obj);

        if (content.hasOwnProperty('children')) {
            if (Array.isArray(content.children)) {
                for (let child in content.children)
                    createElementsFromJSON(content.children[child], obj);
            } else {
                createElementsFromJSON(content.children, obj);
            }
        }
    } else if (Array.isArray(content)) {
        for (let child in content)
            createElementsFromJSON(content[child], parent);
    }
}

function loadChanges(tf) {
    transferData(2, "v=" + version.replaceAll(".", "-") + "&tf=" + tf, function(resp) {
		response = JSON.parse(resp);
		document.querySelector(".ag_changes_title").innerText = "alike03's Subscription Info on Steam v" + version;

        let ajax_parent = document.querySelector(".alike_xhr_data");

        createElementsFromJSON(response, ajax_parent);

		loadOptions();
		loadTabButtons();
		loadNavArrows();
    })
}

function loadOptions() {
    let button = document.createElement("div");
    button.setAttribute("class", "ag_tab_button ag_button icon");
    button.setAttribute("data-id", "ag_options");
    button.appendChild(document.createTextNode("Options"));

    let pulldown = document.createElement('span');
    pulldown.setAttribute("class", "pulldown");
    button.appendChild(pulldown);

    let page = currentBrowser.runtime.getURL("alike_gp_options.json");
    fetch(page).then(response => response.json()).then(result => {
        createElementsFromJSON(result, document.querySelector(".alike_xhr_data .ag_tabs"));

        // Load menuToggle
        let menuToggle_parent = document.querySelector('.aSubO_menuToggle');
        let currToggle = menuToggle_parent.querySelector('option[value="' + save.options.menuToggle + '"]');

        currToggle.setAttribute('selected', '');
        
        menuToggle_parent.addEventListener('change', (e) => {
            save.options.menuToggle = e.target.value;
            saveData();
        });

        // Load Timeframe
        let timeFrame_parent = document.querySelector('.aSubO_timeFrame');
        let currTime = timeFrame_parent.querySelector('option[value="' + save.options.timeFrame + '"]');

        currTime.setAttribute('selected', '');
        
        timeFrame_parent.addEventListener('change', (e) => {
            save.options.timeFrame = parseInt(e.target.value);
            saveData();
        });

        let sub_parent = document.querySelector('.aSubO_subCont');
        let br = document.createElement("br");

        // Load Platform selection
        platforms.forEach(p => {
            let cont = document.createElement("div");
            sub_parent.appendChild(cont);

            let input = document.createElement("input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("class", "ag_checkbox");
            input.setAttribute("id", "aSub_" + p);
            input.setAttribute("name", "aSub_" + p);
            input.setAttribute("value", p);
            if (save.options.enabled[p]) input.setAttribute("checked", "checked");
            cont.appendChild(input);

            let label = document.createElement("label");
            label.setAttribute("for", "aSub_" + p);
            label.appendChild(document.createTextNode("\u00A0\u00A0" + alike_lang.options.which_sub(p)));
            cont.appendChild(label);

            cont.appendChild(br.cloneNode(true));
            cont.appendChild(br.cloneNode(true));

            sub_parent.querySelector('#aSub_' + p).addEventListener('click', (e) => {
                save.options.enabled[e.target.value] = e.target.checked;
                saveData();
            });
        });
    })

    document.querySelector(".alike_xhr_data .ag_buttons").appendChild(button);

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
        document.querySelectorAll('.ag_changes .arrow.left').forEach(left => {
            left.addEventListener('click', (e) => {
                slideSelection(e.currentTarget, -1, e.currentTarget.nextElementSibling);
            });
        });
        document.querySelectorAll('.ag_changes .arrow.right').forEach(right => {
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