/**
 * setting up shortcut
 */
define([
    'jquery',
    'helpers/array-unique',
    'helpers/array-findindex',
], function($) {
    'use strict';

    var root = window,
        isMetaKey = function(keyCode) {
            return (91 === keyCode || 93 === keyCode);
        },
        special_key_map = {
            'CMD': -91,
            'L_CMD': 91,
            'R_CMD': 93,
            'SHIFT': 16,
            'CTRL': 17,
            'ALT': 18,
            'DEL': 8,
            'ENTER': 13,    // return
            'TAB': 9,
            'ESC': 27,
            'LEFT': 37,
            'UP': 38,
            'RIGHT': 39,
            'DOWN': 40
        },
        events = [],
        keyCodeStatus = [],
        has_bind = false,
        keyup_event = function(e) {
            keyCodeStatus = [];
        },
        keydown_event = function(e) {
            var matches = [];

            if (true === e.metaKey) {
                keyup_event();
                keyCodeStatus.push(special_key_map.CMD);

                if (false === isMetaKey(e.keyCode)) {
                    keyCodeStatus.push(e.keyCode);
                }
            }
            else {
                keyCodeStatus.push(e.keyCode);
            }

            keyCodeStatus = keyCodeStatus.unique().sort();

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
        };

    return {
        on: function(keys, callback) {
            var keyCodes = convertToKeyCode(keys);

            if (0 === matchedEvents(keyCodes).length) {
                events.push({ key: keys, keyCode: generateKey(keyCodes), callback: callback });
            }
            else {
                console.warn('Register same shortcut');
            }

            initialize();

            return this;
        },
        off: function(keys) {
            var keyCodes = convertToKeyCode(keys),
                keyCode = generateKey(keyCodes),
                index = events.findIndex(function(obj) {
                    return obj.keyCode === keyCode;
                });

            if (-1 < index) {
                events.splice(index, 1);
            }

            return this;
        },
        disableAll: function() {
            $(root).off('keyup keydown');
            has_bind = false;
        }
    };
});