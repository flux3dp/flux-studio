/**
 * API bitmap laser parser
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-bitmap-laser-parser
 */
define([
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'helpers/is-json'
], function(Websocket, convertToTypedArray, isJson) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'bitmap-laser-parser',
                onMessage: function(result) {

                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data),
                        error_code;

                    if ('string' === typeof data.status && 'fatal' === data.status) {
                        opts.onError(data.error, data);
                    }
                    else {
                        events.onMessage(data);
                    }

                    lastMessage = data;

                }
            }),
            lastOrder = '',
            lastMessage = '',
            events = {
                onMessage: function() {}
            };

        return {
            connection: ws,
            /**
             * upload bitmap
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
            uploadBitmap: function(args, opts) {
                opts = opts || {};
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
            },
            getGCode: function(opts) {
                opts = opts || {};
                opts.onProgressing = opts.onProgressing || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var blobs = [],
                    total_length = 0,
                    gcode_blob;

                events.onMessage = function(data) {

                    if ('processing' === data.status) {
                        opts.onProgressing();
                    }
                    else if ('complete' === data.status) {
                        total_length = data.length;
                    }
                    else if (true === data instanceof Blob) {
                        blobs.push(data);
                        gcode_blob = new Blob(blobs);

                        if (total_length === gcode_blob.size) {
                            opts.onFinished(gcode_blob);
                        }
                    }

                };

                ws.send('go');
                lastOrder = 'getGCode';
            }
        };
    };
});