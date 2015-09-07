/**
 * nwjs menu helper
 * https://github.com/nwjs/nw.js/wiki/MenuItem
 */
define(function() {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        gui = (window.requireNode || emptyFunction)('nw.gui'),
        itemMap = [],
        NWjsWindow,
        mainmenu,
        Menu,
        MenuItem;

    // fake gui object
    if ('object' !== typeof gui) {
        gui = {
            Menu: emptyFunction(function() {
                return {
                    append: emptyFunction
                };
            }),
            MenuItem: emptyFunction(function() {
                return {
                    on: emptyFunction
                };
            }),
            Window: emptyFunction({
                get: emptyFunction
            })
        };
    }

    MenuItem = gui.MenuItem;
    NWjsWindow = gui.Window.get();
    Menu = gui.Menu;
    mainmenu = new Menu({ type: 'menubar', title: 'FLUX Studio', label: 'FLUX Studio' });

    return {
        createMenu: function() {
            return new Menu();
        },

        createSubMenu: function(items) {
            var subMenu = this.createMenu(),
                menuItem;

            items.forEach(function(el) {
                menuItem = new MenuItem({
                    label: el.label || '',
                    type: el.type || 'normal',
                    click: el.onClick || emptyFunction,
                    key: el.key || '',
                    modifiers: el.modifiers || '',
                    enabled: ('boolean' === typeof el.enabled ? el.enabled : true)
                });

                itemMap.push(menuItem);

                menuItem.on('click', function() {
                    window.GA('send', 'event', 'menubar-button', 'click', this.label);
                });

                subMenu.append(menuItem);
            });

            return subMenu;
        },

        appendToMenu: function(label, subMenu) {
            var item = new MenuItem({ label: label, submenu: subMenu });
            itemMap.push(item);
            mainmenu.append(item);
        },

        getMenu: function() {
            return mainmenu;
        },

        findByLabel: function(label) {
            var matches = [];

            itemMap.forEach(function(item) {
                if (label === item.label) {
                    matches.push(item);
                }
            });

            return matches;
        },

        refresh: function() {
            NWjsWindow.menu = mainmenu;
        }
    };
});