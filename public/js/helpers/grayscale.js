/**
 * grayscale
 */
define(function() {
    'use strict';

    return function(data, opts) {
        opts = opts || {};
        opts.is_rgba = ('boolean' === typeof opts.is_rgba ? opts.is_rgba : false);
        opts.threshold = ('number' === typeof opts.threshold ? opts.threshold : 128);
        opts.is_shading = ('boolean' === typeof opts.is_shading ? opts.is_shading : true);
        opts.is_svg = ('boolean' === typeof opts.is_svg ? opts.is_svg : false);

        var binary = [],
            WHITE = 255,
            BLACK = 0,
            grayscale,
            red, green, blue, alpha;

        for (var i = 0; i < data.length; i += 4) {
            if (false === opts.is_svg) {
                // http://yolijn.com/convert-rgba-to-rgb
                alpha = data[i + 3] / 255;
                red = (1 - alpha) * data[i] + alpha * data[i];
                green = (1 - alpha) * data[i + 1] + alpha * data[i + 1];
                blue = (1 - alpha) * data[i + 2] + alpha * data[i + 2];
                // refers to http://en.wikipedia.org/wiki/Grayscale
                grayscale = parseInt(red * 0.299 + green * 0.587 + blue * 0.114, 10);

                // is shading?
                if (false === opts.is_shading && opts.threshold > grayscale) {
                    grayscale = BLACK;
                }

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