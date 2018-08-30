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
        opts.is_binary = ('boolean' === typeof opts.is_binary ? opts.is_binary : false);
        var binary = new Uint8Array(opts.is_rgba ? data.length : data.length / 4),
            WHITE = 255,
            BLACK = 0,
            grayscale,
            i, j,
            red, green, blue, alpha;

        for (i = 0; i < data.length; i += 4) {
            var binaryIndex = Math.floor(i / 4);
            if (false === opts.is_svg) {
                // http://yolijn.com/convert-rgba-to-rgb
                alpha = data[i + 3] / 255;
                // refers to http://en.wikipedia.org/wiki/Grayscale
                grayscale = (1 - alpha) * WHITE + alpha * Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);

                // is shading?
                if (false === opts.is_shading && opts.threshold > grayscale) {
                    grayscale = BLACK;
                }

                grayscale = (opts.threshold > grayscale ? grayscale : WHITE);

                if (false === opts.is_rgba) {
                    binary[binaryIndex] = data[i + 3] === 0 ? WHITE : grayscale;
                }
                else if (opts.is_binary) {
                    const grayscaleValue = (1 - alpha) * WHITE + alpha * Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);

                    if (grayscaleValue > opts.threshold) {
                        binary[i] = binary[i+1] = binary[i+2] = binary[i+3] = 255;
                    } else {
                        binary[i] = binary[i+1] = binary[i+2] = 0;
                        binary[i+3] = 255;
                    }
                }
                else {
                    binary[i] = binary[i + 1] = binary[i + 2] = grayscale;
                    binary[i + 3] = WHITE === grayscale ? 0 : data[i + 3];
                }
            }
            else {
                // 3 is alpha
                if (false === opts.is_rgba) {
                    binary[binaryIndex] = data[i + 3] > 0 ? BLACK : WHITE;
                } else {
                    for (j = 0; j < 3; j++) {
                        binary[i + j] = 0 < data[i + j] ? WHITE : BLACK;
                    }

                    binary[i + 3] = data[i + 3] > 0 ? WHITE : BLACK;
                }
            }
        }

        return binary;
    };
});
