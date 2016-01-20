/**
 * get element's angle
 */
define(function() {
    'use strict';

    return function(el, values) {
        // refs: https://css-tricks.com/get-value-of-css-rotation-through-javascript/
        var st = window.getComputedStyle(el, null),
            matrix = st.getPropertyValue("-webkit-transform"),
            values = (values || matrix).split('(')[1].split(')')[0].split(','),
            a, b, c, d, scale, sin;

        a = values[0];
        b = values[1];
        c = values[2];
        d = values[3];

        scale = Math.sqrt(a * a + b * b);
        sin = b / scale;

        return Math.round(Math.atan2(b, a) * (180 / Math.PI));
    };

});