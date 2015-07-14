/**
 * Array.findIndex (implement following the spec)
 * https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
 */
define(function() {
    'use strict';

    if ('undefined' === typeof Array.prototype.findIndex) {
        Array.prototype.findIndex = function(callback) {
            var matches_keys = [];

            this.forEach(function(el, key) {
                if (true === callback(el)) {
                    matches_keys.push(key);
                }
            });

            return (0 < matches_keys.length ? matches_keys[0] : -1);
        };
    }
});