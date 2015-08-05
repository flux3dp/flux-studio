/**
 * setting up shortcut
 */
define([
    'jquery',
    'helpers/array-unique'
], function($) {
    'use strict';

    var $document = $(document),
        special_key_map = {
            'L_CMD': 91,
            'R_CMD': 93,
            'SHIFT': 16,
            'CTRL': 17,
            'ALT': 18,
            'DEL': 8,
            'ENTER': 13,    // return
            'TAB': 9,
            'ESC': 27
        },
        events = [],
        keyCodeStatus = [],
        has_bind = false,
        initialize = function() {
            if (false === has_bind) {
                $document.on('keyup', function(e) {
                    var index = keyCodeStatus.findIndex(function(value) {
                        return value === e.keyCode;
                    });

                    if (-1 < index) {
                        keyCodeStatus.splice(index, 1);
                    }
                });

                $document.on('keydown', function(e) {
                    keyCodeStatus.push(e.keyCode);
                    keyCodeStatus = keyCodeStatus.unique().sort();

                    var matches = matchedEvents(keyCodeStatus);

                    if (0 < matches.length) {
                        e.preventDefault();
                        keyCodeStatus = [];
                    }

                    matches.forEach(function(event, index) {
                        event.callback.apply(null, [e]);
                    });
                });

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

            events.push({ key: keys, keyCode: generateKey(keyCodes), callback: callback });

            initialize();
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
        },
        disableAll: function() {
            $document.off('keyup keydown');
            has_bind = false;
        }
    };
});