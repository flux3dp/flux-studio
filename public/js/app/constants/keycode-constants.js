/**
 * key code map
 */
define(function() {
    'use strict';

    return {
        KEY_L_CMD    : 91,  // or left window key
        KEY_R_CMD    : 93,  // or select key
        KEY_RETURN   : 13,  // enter
        KEY_PLUS     : 187,
        KEY_MINUS    : 189,
        KEY_MULTIPLY : 56,
        KEY_DIVIDE   : 191,
        KEY_SHIFT    : 16,
        KEY_CTRL     : 17,
        KEY_ALT      : 18,
        KEY_DEL      : ('windows' === window.FLUX.osType ? 46 : 8),   // windows: (46), osx: (8)
        KEY_BACK     : 8,
        KEY_TAB      : 9,
        KEY_ESC      : 27,
        KEY_LEFT     : 37,
        KEY_UP       : 38,
        KEY_RIGHT    : 39,
        KEY_DOWN     : 40
    };
});