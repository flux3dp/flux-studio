/**
 * nwjs menu factory
 */
define([
    'helpers/nwjs/gui',
    'helpers/nwjs/menu-map',
    'helpers/i18n',
    'helpers/observe',
    'helpers/api/discover'
], function(gui, menuMap, i18n, observe, discover) {
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

            function crossplatform_modifiers(modifiers){
                if(!modifiers) return;
                if ( 'osx' !== window.FLUX.osType ){
                    modifiers = modifiers.replace(/cmd/g,'ctrl');
                }
                console.log(modifiers);
                return modifiers;
            }

            items.forEach(function(el) {
                menuOption = {
                    label: el.label || '',
                    type: el.type || 'normal',
                    click: el.onClick || emptyFunction,
                    key: el.key || '',
                    modifiers: crossplatform_modifiers(el.modifiers) || '',
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
            initialize(menuMap.refresh());
        },

        updateMenu: function(menu, parentIndex) {
            var menuItem = mainmenu.items[parentIndex],
                subMenu = methods.createSubMenu(menu.subItems);

            menuItem.submenu = subMenu;
        }

    };

    function initialize(menuMap) {
        var subMenu;

        methods.clear();

        menuMap.forEach(function(menu) {
            subMenu = methods.createSubMenu(menu.subItems);
            methods.appendToMenu(menu.label, subMenu);
        });

        NWjsWindow.menu = mainmenu;
    }

    function singleCheckDefaultDevice(checkedMenuItem, checkedPrinter) {
        var subItems = menuMap.all[menuMap.parentIndex.DEVICE].subItems,
            defaultDeviceCheckBox;

        subItems.forEach(function(subItem) {
            if (true === subItem.isPrinter) {
                defaultDeviceCheckBox = subItem.subItems[3];

                if (subItem.uuid !== checkedPrinter.uuid) {
                    defaultDeviceCheckBox.checked = false;
                }
                else {
                    defaultDeviceCheckBox.checked = !defaultDeviceCheckBox.checked;
                }
            }
        });

        methods.updateMenu(menuMap.all[menuMap.parentIndex.DEVICE], menuMap.parentIndex.DEVICE);
    }

    if ('undefined' !== typeof requireNode) {
        initialize(menuMap.all);

        for (var key in menuMap.items) {
            if (true === menuMap.items.hasOwnProperty(key)) {
                (function(menuItem) {
                    observe(menuItem, function(changes) {
                        menuMap.all = menuMap.refresh();
                        methods.updateMenu(menuMap.all[menuItem.parent], menuItem.parent);
                    });
                })(menuMap.items[key]);
            }
        }

        menuMap.onDefaultDeviceChange(function(menuItem, checkedPrinter) {
            singleCheckDefaultDevice(menuItem, checkedPrinter);
        });
    }

    window.FLUX.refreshMenu = initialize;

    return {
        items: menuMap.items,
        methods: methods
    };
});