/**
 * setting up shortcut
 */
define([
    'jquery',
    'app/constants/keycode-constants',
    'helpers/array-unique',
    'helpers/array-findindex'
], function($, keyCodeConstants) {
    'use strict';

    var root = window,
        isMetaKey = function(keyCode) {
            return (91 === keyCode || 93 === keyCode);
        },
        special_key_map = {
            'CMD'    : -91,
            'L_CMD'  : keyCodeConstants.KEY_L_CMD,
            'R_CMD'  : keyCodeConstants.KEY_R_CMD,
            'SHIFT'  : keyCodeConstants.KEY_SHIFT,
            'CTRL'   : keyCodeConstants.KEY_CTRL,
            'ALT'    : keyCodeConstants.KEY_ALT,
            'DEL'    : keyCodeConstants.KEY_DEL,
            'BACK'   : keyCodeConstants.KEY_BACK,
            'RETURN' : keyCodeConstants.KEY_RETURN,
            'TAB'    : keyCodeConstants.KEY_TAB,
            'ESC'    : keyCodeConstants.KEY_ESC,
            'LEFT'   : keyCodeConstants.KEY_LEFT,
            'UP'     : keyCodeConstants.KEY_UP,
            'RIGHT'  : keyCodeConstants.KEY_RIGHT,
            'DOWN'   : keyCodeConstants.KEY_DOWN
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
        },
        removeEvent = function(event) {
            var currentEvent;

            for (var i = events.length - 1; i >= 0; i--) {
                currentEvent = events[i];

                if (currentEvent.keyCode === event.keyCode) {
                    events.splice(i, 1);
                }
            }
        };

    return {
        on: function(keys, callback) {
            var keyCodes = convertToKeyCode(keys);

            events.push({ key: keys, keyCode: generateKey(keyCodes), callback: callback });

            initialize();

            return this;
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