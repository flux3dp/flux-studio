/**
 * API fcode reader
 * Ref: https://github.com/flux3dp/fluxghost/wiki/fcode-reader
 */
define([
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'helpers/data-history',
    'helpers/api/set-params'
], function(Websocket, convertToTypedArray, history, setParams) {
    'use strict';

    // Because the preview image size is 640x640
    var MAXWIDTH = 640;

    return function(opts) {
        opts = opts || {};

        var ws = new Websocket({
                method: 'fcode-reader',
                onMessage: function(data) {

                    events.onMessage(data);

                },
                onError: opts.onError,
                onFatal: opts.onFatal
            }),
            events = {
                onMessage: function() {}
            };

        return {
            connection: ws,

            /**
             * upload fcode
             *
             * @param {ArrayBuffer} data       - binary data with array buffer type
             * @param {Function}    onFinished - fired when process finished
             */
            upload: function(data, onFinished) {
                var args = [
                    'upload',
                    data.byteLength
                ];

                events.onMessage = function(response) {

                    if ('continue' === response.status) {
                        ws.send(data);
                    }
                    else if ('ok' === response.status) {
                        onFinished();
                    }

                };

                ws.send(args.join(' '));
            },

            /**
             * get thumbnail from the last uploaded fcode
             *
             * @param {Function} onFinished - fired when process finished
             */
            getThumbnail: function(onFinished) {
                var blobs = [],
                    totalLength = 0,
                    blob;

                events.onMessage = function(response) {

                    if ('complete' === response.status) {
                        totalLength = response.length;
                    }
                    else if (response instanceof Blob) {
                        blobs.push(response);
                        blob = new Blob(blobs, { type: 'image/png' });

                        if (totalLength === blob.size) {
                            onFinished(blob);
                        }
                    }

                };

                ws.send('get_img');
            },

            /**
             * get metadata from the last uploaded fcode
             *
             * @param {Function} onFinished - fired when process finished
             */
            getMetadata: function(onFinished) {
                events.onMessage = function(response) {

                    if ('complete' === response.status) {
                        onFinished(response);
                    }

                };

                ws.send('get_meta');
            },

            getPath: function(onFinished) {
                // TODO: to be implemented
            }
        }
    };
});