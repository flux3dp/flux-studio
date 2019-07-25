define([
<<<<<<< HEAD
], 
function(
) {
    'use strict';

=======
    'jquery',
    'helpers/i18n'
], 
function(
    $,
    i18n
) {
    'use strict';
    const LANG = i18n.lang;
>>>>>>> fae51a7a... Update windows frameless browser style
    if (process.platform !== 'win32') return () => {};

    return () => {
        const customTitlebar = require('custom-electron-titlebar');
        const Menu = require('electron').remote.Menu;
        const MenuItem = require('electron').remote.MenuItem;
<<<<<<< HEAD

        const tempMenu = new Menu();
        tempMenu.append(new MenuItem({
            label: 'File',
            submenu: [
                {
                    label: 'Subitem 1',
                    click: () => console.log('Click on subitem 1')
                },
                {
                    type: 'separator'
                }
            ]
        }));

        tempMenu.append(new MenuItem({
            label: 'Machines',
            submenu: [
                {
                    label: 'Subitem checkbox',
                    type: 'checkbox',
                    checked: true
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Subitem with submenu',
                    submenu: [
                        {
                            label: 'Submenu &item 1',
                            accelerator: 'Ctrl+T'
                        }
                    ]
                }
            ]
        }));

        const titlebar = new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#444'),
            menu: tempMenu,
=======
        
        $('.top-menu').css({'-webkit-app-region': 'no-drag'});
        $('.content').css({'height': 'calc(100% - 60px)'});
        console.log($('.top-btn'));
        new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#333'),
            shadow: true,
>>>>>>> fae51a7a... Update windows frameless browser style
            menuPosition: 'bottom'
        });
    }
});