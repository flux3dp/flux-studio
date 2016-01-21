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
            upload: function(name, file, opts) {
                opts = opts || {};
                History.push(name, file);
                (opts.onFinished || function() {})(file);
            },
            get: function(name, opts) {
                var file = History.findByName(name)[0];

                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                imageData(file.data.blob, {
                    type: file.type,
                    onComplete: function(result) {
                        opts.onFinished(file.data.blob, result.size);
                    }
                });
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
             * @param {Json} opts - options
             *      {Function}   onFinished - fire on upload finish
             */
            compute: function(args, opts) {
                opts = opts || {};
                opts.onStarting = opts.onStarting || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var CHUNK_PKG_SIZE = 4096,
                    requests_serial = [],
                    request_index = 0,
                    go_next = true,
                    request_header,
                    next_data,
                    timer;

                lastOrder = 'upload';

                args.forEach(function(obj) {
                    request_header = [
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

                    requests_serial.push(request_header.join(' '));

                    for (var i = 0; i < obj.image_data.length; i += CHUNK_PKG_SIZE) {
                        requests_serial.push(convertToTypedArray(obj.image_data.slice(i, i + CHUNK_PKG_SIZE), Uint8Array));
                    }

                });

                events.onMessage = function(data) {
                    switch (data.status) {
                    case 'continue':
                        // ready to sending binary
                        go_next = true;
                        break;
                    case 'accept':
                    // ready to sending next image set
                        go_next = true;
                        break;
                    default:
                        // TODO: do something?
                        break;
                    }
                };

                timer = setInterval(function() {
                    if (true === go_next) {
                        next_data = requests_serial[request_index];

                        go_next = ('string' !== typeof next_data);

                        ws.send(next_data);
                        request_index++;
                    }

                    if (request_index >= requests_serial.length) {
                        opts.onFinished();
                        clearInterval(timer);
                    }
                }, 0);

                opts.onStarting();
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