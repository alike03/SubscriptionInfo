const isPopup = true;

const main = document.querySelector('main');

const breadcrumbs = document.createElement('div');
breadcrumbs.classList.add('breadcrumbs');
main.appendChild(breadcrumbs);

waitForElement('#ag_changes_button').then(function (element) {
    main.appendChild(element.querySelector('.ag_changes'));
    element.remove();
});