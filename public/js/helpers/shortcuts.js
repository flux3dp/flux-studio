/**
 * setting up shortcut
 */
define([
    'jquery',
    'app/constants/keycode-constants',
    'helpers/array-findindex'
], function($, KeycodeConstants) {
    'use strict';

    var root = window,
        isMetaKey = function(keyCode) {
            return (91 === keyCode || 93 === keyCode);
        },
        special_key_map = {
            'CMD'    : -91,
            'L_CMD'  : KeycodeConstants.KEY_L_CMD,
            'R_CMD'  : KeycodeConstants.KEY_R_CMD,
            'SHIFT'  : KeycodeConstants.KEY_SHIFT,
            'CTRL'   : KeycodeConstants.KEY_CTRL,
            'ALT'    : KeycodeConstants.KEY_ALT,
            'DEL'    : KeycodeConstants.KEY_DEL,
            'BACK'   : KeycodeConstants.KEY_BACK,
            'RETURN' : KeycodeConstants.KEY_RETURN,
            'TAB'    : KeycodeConstants.KEY_TAB,
            'ESC'    : KeycodeConstants.KEY_ESC,
            'LEFT'   : KeycodeConstants.KEY_LEFT,
            'UP'     : KeycodeConstants.KEY_UP,
            'RIGHT'  : KeycodeConstants.KEY_RIGHT,
            'DOWN'   : KeycodeConstants.KEY_DOWN,
            'PLUS'   : KeycodeConstants.KEY_PLUS,
            'MINUS'  : KeycodeConstants.KEY_MINUS,
            'FNKEY'  : (process.platform === 'darwin') ? -91 : KeycodeConstants.KEY_CTRL
        },
        events = [],
        keyCodeStatus = [],
        has_bind = false,
        keyup_event = function(e) {
            keyCodeStatus = [];
        },
        keydown_event = function(e) {
            var matches = [];

            keyup_event();

            if (false === isMetaKey(e.keyCode)) {
                keyCodeStatus.push(e.keyCode);
            }

            if (true === e.ctrlKey) {
                keyCodeStatus.push(special_key_map.CTRL);
            }

            if (true === e.altKey) {
                keyCodeStatus.push(special_key_map.ALT);
            }

            if (true === e.shiftKey) {
                keyCodeStatus.push(special_key_map.SHIFT);
            }

            if (true === e.metaKey) {
                keyCodeStatus.push(special_key_map.CMD);
            }

            keyCodeStatus = _unique(keyCodeStatus).sort();

            matches = matchedEvents(keyCodeStatus);

            if (0 < matches.length) {
                keyCodeStatus = [];
            }

            matches.forEach(function(event, index) {
                event.callback.apply(null, [e]);
            });
        },
        initialize = function() {
            if (false === has_bind) {
                $(root).on('keyup', keyup_event);
                $(root).on('keydown', keydown_event);

                has_bind = true;
            }
        },
        convertToKeyCode = function(keys) {
            keys.forEach(function(key, index) {
                key = key.toUpperCase();

                if (true === special_key_map.hasOwnProperty(key)) {
                    key = special_key_map[key];
                }
                else {
                    key = key.charCodeAt(0);
                }

                keys[index] = key;
            });

            return keys;
        },
        generateKey = function(keyCodes) {
            return keyCodes.sort().join('+');
        },
        matchedEvents = function(keyCodes) {
            var keyCode = generateKey(keyCodes);

            return events.filter(function(event) {
                return event.keyCode === keyCode;
            });
        },
        removeEvent = function(event) {
            var currentEvent;

            for (var i = events.length - 1; i >= 0; i--) {
                currentEvent = events[i];

                if (currentEvent.keyCode === event.keyCode) {
                    events.splice(i, 1);
                }
            }
        },
        unsubscribe = function() {
            events = events.filter(e => e !== this);
        },
        _unique = function(arr) {
            //this is array-unique.js
            var unique_array = [],
                some = function(compare) {
                    return function(el) {
                        return compare === el;
                    };
                };

            arr.forEach(function(el, key) {
                if (false === unique_array.some(some(el))) {
                    unique_array.push(el);
                }
            });

            return unique_array;
        };

    return {
        on: function(keys, callback) {
            var keyCodes = convertToKeyCode(keys);
            let e = { key: keys, keyCode: generateKey(keyCodes), callback: callback };
            events.push(e);

            initialize();
            return unsubscribe.bind(e);
        },
        off: function(keys) {
            var keyCodes = convertToKeyCode(keys),
                keyCode = generateKey(keyCodes);

            removeEvent({ keyCode: keyCode });

            return this;
        },
        disableAll: function() {
            $(root).off('keyup keydown');
            has_bind = false;
            events = [];
        }
    };
});
