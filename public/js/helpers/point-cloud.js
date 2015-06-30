/**
 * Point cloud helper
 */
define(function() {
    'use strict';

    // use "NEW" operator to create object
    return function() {
        var blobs = [],
            chunk = {
                left: [],
                right: []
            };

        return {
            push: function(data, left_len, right_len, opts) {
                opts = opts || {};
                opts.onProgress = opts.onProgress || function() {};

                var fileReader = new FileReader(),
                    blobs_len = 0,
                    typedArray, blob;

                if (true === data instanceof Blob) {
                    blobs.push(data);
                    blobs_len = blobs.length;

                    chunk.right.push(data.slice(0, left_len));
                    chunk.left.push(data.slice(left_len, left_len + right_len));

                    fileReader.onload = function() {
                        typedArray = new Float32Array(this.result);
                        opts.onProgress(typedArray, blobs_len);
                    };

                    blob = new Blob(blobs);
                    fileReader.readAsArrayBuffer(blob);
                }
                else {
                    // TODO: throw exception?
                }

                return this;
            },
            get: function() {
                return {
                    left: new Blob(chunk.left),
                    right: new Blob(chunk.right),
                    total: new Blob(chunk.left.concat(chunk.right))
                };
            }
        };
    };
});