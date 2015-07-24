/**
 * Array.unique
 */
define(function() {
    'use strict';

    if ('undefined' === typeof Array.prototype.unique) {
        Array.prototype.unique = function() {
            var self = this,
                unique_array = [],
                some = function(compare) {
                    return function(el) {
                        return compare === el;
                    };
                };

            self.forEach(function(el, key) {
                if (false === unique_array.some(some(el))) {
                    unique_array.push(el);
                }
            });

            return unique_array;
        };
    }
});