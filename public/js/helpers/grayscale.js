/**
 * grayscale
 */
define(function() {
    'use strict';

    return function(data, opts) {
        opts = opts || {};
        opts.is_rgba = ('boolean' === typeof opts.is_rgba ? opts.is_rgba : false);
        opts.threshold = ('number' === typeof opts.threshold ? opts.threshold : 128);

        var binary = [],
            WHITE = 255;

        for (var i = 0; i < data.length; i += 4) {
            // refers to http://en.wikipedia.org/wiki/Grayscale
            var grayscale = parseInt(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114, 10);

            grayscale = (opts.threshold > grayscale ? grayscale : WHITE);

            if (false === opts.is_rgba) {
                binary.push(grayscale);
            }
            else {
                for (var j = 0; j < 3; j++) {
                    binary.push(grayscale);
                }

                binary.push(data[i + 3]);
            }
        }

        return binary;
    };
});