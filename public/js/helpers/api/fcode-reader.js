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
                onError: function(response) {
                    events.onError(response);
                },
                onFatal: function(response) {
                    events.onFatal(response);
                }
            }),
            events = {
                onMessage: function() {},
                onError: opts.onError,
                onFatal: opts.onFatal
            };

        return {
            connection: ws,

            /**
             * upload fcode
             *
             * @param {ArrayBuffer} data       - binary data with array buffer type
             * @param {Int}         size       - binary data with array buffer type
             * @param {Function}    onFinished - fired when process finished
             */
            upload: function(data, size, onFinished, isGcode) {
                var args = [
                    'upload',
                    size
                ];

                events.onMessage = function(response) {

                    if ('continue' === response.status) {
                        ws.send(data);
                    }
                    else if ('ok' === response.status) {
                        onFinished();
                    }

                };

                events.onError = function(response) {
                    onFinished(response);
                };

                events.onFatal = function(response) {
                    onFinished(response);
                };

                args.push(isGcode ? '-g' : '-f');

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

                events.onError = function(response) {
                    onFinished(response);
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
                var d = $.Deferred();
                events.onMessage = function(result) {
                    console.timeEnd('fcode-get-path');
                    d.resolve(result);
                };
                console.time('fcode-get-path');
                ws.send('get_path');
                return d.promise();
            },

            getFCode: function() {
                var d = $.Deferred(),
                    totalLength = 0;

                events.onMessage = function(response) {
                    if (response.status === 'complete') {
                        totalLength = response.length;
                    }
                    else if (response instanceof Blob) {
                        if (totalLength === response.size) {
                            d.resolve(response);
                        }
                    }
                };

                ws.send('get_fcode');
                return d.promise();
            },

            changeImage: function(data, size) {

                return new Promise((resolve, reject) => {

                    events.onMessage = (response) => {
                        switch(response.status) {
                            case 'ok':
                                resolve('');
                                break;
                            case 'continue':
                                ws.send(data);
                                break;
                            default: break;
                        }
                    };

                    events.onError = (response) => {
                        reject(response);
                    };

                    events.onFatal = (response) => {
                        reject(response);
                    };

                    ws.send(`change_img ${data.size}`);

                });
            }
        };
    };
});
