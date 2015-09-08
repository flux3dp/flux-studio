/**
 * grayscale
 */
define(function() {
    'use strict';

    return function(data, opts) {
        opts = opts || {};
        opts.is_rgba = ('boolean' === typeof opts.is_rgba ? opts.is_rgba : false);
        opts.threshold = ('number' === typeof opts.threshold ? opts.threshold : 128);
        opts.is_svg = ('boolean' === typeof opts.is_svg ? opts.is_svg : false);

        var binary = [],
            WHITE = 255;

        for (var i = 0; i < data.length; i += 4) {
            if (false === opts.is_svg) {
                // refers to http://en.wikipedia.org/wiki/Grayscale
                var grayscale = parseInt(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114, 10);

                grayscale = (opts.threshold > grayscale ? grayscale : WHITE);

                if (false === opts.is_rgba) {
                    if (0 === data[i + 3]) {
                        binary.push(WHITE);
                    }
                    else {
                        binary.push(grayscale);
                    }

                }
                else {
                    for (var j = 0; j < 3; j++) {
                        binary.push(grayscale);
                    }

                    binary.push(WHITE === grayscale ? 0 : data[i + 3]);
                }
            }
            else {
                // 3 is alpha
                if (0 < data[i + 3]) {
                    binary.push(0);
                }
                else {
                    binary.push(255);
                }
            }
        }

        return binary;
    };
});