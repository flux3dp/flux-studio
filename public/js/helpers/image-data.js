/**
 * To get image data
 */
define([
    'helpers/grayscale',
    'helpers/convertToTypedArray'
],
function(grayScale, convertToTypedArray) {
    'use strict';

    return function(source, opts) {
        opts.onComplete = opts.onComplete || function() {};
        opts.type = opts.type || 'image/png';

        var img = new Image(),
            blobUrl = window.URL,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            onload = function(e) {
                var size = {
                        width: opts.width || e.target.naturalWidth,
                        height: opts.height || e.target.naturalHeight
                    },
                    imageBinary,
                    imageData;

                canvas.width = size.width;
                canvas.height = size.height;
                ctx.drawImage(
                    img,
                    0,
                    0,
                    size.width,
                    size.height
                );

                imageData = ctx.createImageData(size.width, size.height);
                imageBinary = ctx.getImageData(0, 0, size.width, size.height).data;

                if ('undefined' !== typeof opts.grayscale) {
                    imageBinary = grayScale(imageBinary, opts.grayscale);
                }

                imageData.data.set(imageBinary);

                ctx.putImageData(imageData, 0, 0);

                opts.onComplete({
                    canvas: canvas,
                    size: size,
                    data: imageData,
                    imageBinary: imageBinary,
                    blob: new Blob([imageData.data], { type: opts.type })
                });

                canvas = null;

                // remove event
                img.removeEventListener(
                    'load',
                    onload,
                    false
                );
            };

        img.addEventListener(
            'load',
            onload,
            false
        );

        if (source instanceof Blob) {
            img.src = blobUrl.createObjectURL(source);

        }
        else if ('string' === typeof source) {
            img.src = source;
        }
    };
});
