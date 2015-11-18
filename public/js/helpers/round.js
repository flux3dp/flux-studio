/**
 * advanced round
 */
define(function() {
    'use strict';

    /**
     * @param value     {number} - the value to round
     * @param precision {number} - the optional number of decimal digits to round to
     */
    return function(value, precision) {
        value = parseFloat(value, 10);

        var size = Math.pow(10, -precision);

        return Math.round(value * size) / size;
    };
});