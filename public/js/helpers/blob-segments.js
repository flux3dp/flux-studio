/**
 * blob segments
 */
define(function() {
    'use strict';

    return function(blob, callback) {
        callback = callback || function() {};

        var chunk,
            CHUNK_PKG_SIZE = 4096;

        // split up to pieces
        for (var i = 0; i < blob.size; i += CHUNK_PKG_SIZE) {
            chunk = blob.slice(i, i + CHUNK_PKG_SIZE);
            callback(chunk);
        }
    };
})