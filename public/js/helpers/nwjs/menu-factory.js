/**
 * nwjs menu factory
 */
define([
    'helpers/nwjs/gui',
    'helpers/nwjs/menu-map',
    'helpers/i18n',
    'helpers/observe'
], function(gui, menuMap, i18n, observe) {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        originalMenuMap = JSON.parse(JSON.stringify(menuMap)),
        lang = i18n.get().topmenu,
        itemMap = [],
        NWjsWindow,
        mainmenu,
        Menu,
        MenuItem,
        methods;

    MenuItem = gui.MenuItem;
    NWjsWindow = gui.Window.get();
    Menu = gui.Menu;
    mainmenu = new Menu({ type: 'menubar', title: 'FLUX Studio', label: 'FLUX Studio' });

    methods = {
        createMenu: function() {
            return new Menu();
        },

        createSubMenu: function(items) {
            var subMenu = this.createMenu(),
                menuItem,
                menuOption;

            if (undefined === items) {
                return undefined;
            }

            items.forEach(function(el) {
                menuOption = {
                    label: el.label || '',
                    type: el.type || 'normal',
                    click: el.onClick || emptyFunction,
                    key: el.key || '',
                    modifiers: el.modifiers || '',
                    enabled: ('boolean' === typeof el.enabled ? el.enabled : true),
                    checked: el.checked || false
                };

                if (true === el.subItems instanceof Array) {
                    menuOption.submenu = methods.createSubMenu(el.subItems);
                }

                menuItem = new MenuItem(menuOption);

                menuItem.on('click', function() {
                    window.GA('send', 'event', 'menubar-button', 'click', el.label);
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

        clear: function() {
            mainmenu = new Menu({ type: 'menubar', title: 'FLUX Studio', label: 'FLUX Studio' });
        },

        refresh: function() {
            NWjsWindow.menu = mainmenu;
        }

    };

    function initialize(menuMap) {
        var subMenu;

        methods.clear();

        menuMap.forEach(function(menu) {
            subMenu = methods.createSubMenu(menu.subItems);
            methods.appendToMenu(menu.label, subMenu);
        });

        methods.refresh();
    }

    initialize(menuMap.all);

    observe(menuMap.items, function(changes) {
        initialize(menuMap.all);
    });

    return {
        items: menuMap.items,
        methods: methods
    };
});