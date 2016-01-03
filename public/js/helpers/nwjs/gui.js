/**
 * nwjs gui helper
 * https://github.com/nwjs/nw.js/wiki/MenuItem
 */
define(function() {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        gui;

    try {
        gui = (window.requireNode || emptyFunction)('nw.gui');
    }
    catch (e) {
        // TODO: do something?
    }

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
            }),
            App: {
                quit: emptyFunction
            }
        };
    }

    return gui;
});
