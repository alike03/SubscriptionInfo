const main = document.querySelector('main');

const store_controls = document.createElement('div');
store_controls.setAttribute('id', 'store_controls');

const cart_status_data = document.createElement('div');
cart_status_data.setAttribute('id', 'cart_status_data');

main.appendChild(store_controls);
store_controls.appendChild(cart_status_data);

waitForElement('#ag_changes_button').then(function (element) {
    main.appendChild(element.querySelector('.ag_changes'));
    element.remove();
});