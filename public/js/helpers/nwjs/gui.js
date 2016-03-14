/**
 * nwjs gui helper
 * https://github.com/nwjs/nw.js/wiki/MenuItem
 */
define(function() {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        mockGUI = {
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
            }),
            App: {
                quit: emptyFunction
            }
        },
        gui;

    gui = (true === window.FLUX.isNW ? nw : mockGUI);

    return gui;
});
