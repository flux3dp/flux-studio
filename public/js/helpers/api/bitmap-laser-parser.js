/**
 * API bitmap laser parser
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-bitmap-laser-parser
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'helpers/is-json',
    'helpers/data-history',
    'helpers/api/set-params',
    'helpers/image-data'
], function(
    $,
    Websocket,
    convertToTypedArray,
    isJson,
    history,
    setParams,
    imageData
) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'bitmap-laser-parser',
                onMessage: function(data) {

                    events.onMessage(data);

                },
                onError: opts.onError
            }),
            lastOrder = '',
            events = {
                onMessage: function() {}
            },
            History = history();

        return {
            connection: ws,
            upload: function(files) {
                var self = this,
                    $deferred = $.Deferred(),
                    currIndex = 0,
                    sendFile = function(file) {
                        file.isBroken = false;

                        self.get(file).done(function(response) {
                            file.blob = response.blob;
                            file.imgSize = response.size;
                            $deferred.notify('next');
                        });
                    };

                $deferred.progress(function(action) {
                    var file,
                        hasBadFiles = false;

                    if ('next' === action) {
                        file = files[currIndex];

                        if ('undefined' === typeof file) {
                            $deferred.resolve({files: files, hasBadFiles: false });
                        }
                        else {
                            sendFile(file);
                            currIndex += 1;
                        }
                    }
                });

                $deferred.notify('next');

                return $deferred.promise();
            },
            get: function(file) {
                var $deferred = $.Deferred();

                imageData(file.blob, {
                    type: file.type,
                    onComplete: function(result) {
                        $deferred.resolve({
                            size: result.size,
                            blob: file.blob
                        });
                    }
                });

                return $deferred.promise();
            },
            /**
             * compute bitmap
             *
             * @param {ArrayObject} args - detail json object below [{}, {}, ...]
             *      {Int}   width         - width pixel
             *      {Int}   height        - height pixel
             *      {Float} tl_position_x - top left x
             *      {Float} tl_position_y - top left y
             *      {Float} br_position_x - bottom right x
             *      {Float} br_position_y - bottom right y
             *      {Float} rotate        - rotate
             *      {Int}   threshold     - threshold (0~255)
             *      {Array} image_data    - grayscale image data
             * @return {Promise}
             */
            compute: function(args) {
                var $deferred = $.Deferred(),
                    CHUNK_PKG_SIZE = 4096,
                    requests = [],
                    currIndex = 0,
                    nextRequest,
                    requestHeader,
                    nextData,
                    sendData = (nextData) => {
                        ws.send(nextData);
                        currIndex += 1;

                        nextData = requests[currIndex];

                        if (true === nextData instanceof Uint8Array) {
                            sendData(nextData);
                        }
                    };

                lastOrder = 'upload';

                args.forEach(function(obj) {
                    requestHeader = [
                        lastOrder,
                        obj.width,
                        obj.height,
                        obj.tl_position_x,
                        obj.tl_position_y,
                        obj.br_position_x,
                        obj.br_position_y,
                        obj.rotate,
                        obj.threshold
                    ];

                    requests.push(requestHeader.join(' '));

                    for (var i = 0; i < obj.image_data.length; i += CHUNK_PKG_SIZE) {
                        requests.push(convertToTypedArray(obj.image_data.slice(i, i + CHUNK_PKG_SIZE), Uint8Array));
                    }

                });

                events.onMessage = function(data) {
                    switch (data.status) {
                    // ready to sending binary
                    case 'continue':
                    case 'accept':
                        $deferred.notify('next');
                        break;
                    default:
                        // TODO: do something?
                        break;
                    }
                };

                $deferred.progress((action) => {
                    nextData = requests[currIndex];

                    if ('next' === action && 'undefined' !== typeof nextData) {
                        sendData(nextData);
                    }
                    else {
                        $deferred.resolve();
                    }
                });

                $deferred.notify('next');

                return $deferred.promise();
            },
            getTaskCode: function(opts) {
                opts = opts || {};
                opts.onStarting = opts.onStarting || function() {};
                opts.onProgressing = opts.onProgressing || function() {};
                opts.onFinished = opts.onFinished || function() {};

                lastOrder = 'getTaskCode';

                var self = this,
                    blobs = [],
                    args = [
                        'go',
                        opts.fileMode || '-f'
                    ],
                    duration,
                    total_length = 0,
                    blob;

                events.onMessage = function(data) {

                    if ('computing' === data.status) {
                        opts.onProgressing(data);
                    }
                    else if ('complete' === data.status) {
                        total_length = data.length;
                        duration = data.time;
                    }
                    else if (true === data instanceof Blob) {
                        blobs.push(data);
                        blob = new Blob(blobs);

                        if (total_length === blob.size) {
                            opts.onFinished(blob, args[1], duration);
                        }
                    }

                };

                ws.send(args.join(' '));

                opts.onStarting();
            },

            clear: function() {
                var deferred = $.Deferred();

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        deferred.resolve(data);
                    }
                };

                ws.send('clear_imgs');

                return deferred.promise();
            },

            params: setParams(ws, events)
        };
    };
});