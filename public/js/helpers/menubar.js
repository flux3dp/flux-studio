define([
    'jquery',
    'helpers/i18n'
], 
function(
    $,
    i18n
) {
    'use strict';
    const LANG = i18n.lang;
    if (process.platform !== 'win32') return () => {};

    return () => {
        const customTitlebar = require('custom-electron-titlebar');
        const Menu = require('electron').remote.Menu;
        const MenuItem = require('electron').remote.MenuItem;
        
        $('.top-menu').css({
            '-webkit-app-region': 'no-drag',
            'height': '75px',
        });
        $('.content').css({'height': 'calc(100% - 30px)'});
        let titlebar = new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#333'),
            shadow: false,
            icon: 'win-icon.ico'
        });
        titlebar.updateTitle(' ');
    }
});