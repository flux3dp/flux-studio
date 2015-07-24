/**
 * API svg laser parser
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-svg-laser-parser
 */
define([
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'helpers/is-json',
    'helpers/data-history'
], function(Websocket, convertToTypedArray, isJson, history) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'svg-laser-parser',
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

                },
                onClose: function() {
                    setup_done = false;
                }
            }),
            uploaded_svg = [],
            lastOrder = '',
            lastMessage = '',
            setup_done = false,
            events = {
                onMessage: function() {}
            },
            History = history();

        return {
            connection: ws,
            History: History,
            setup: function(mode, args, opts) {
                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                var _args = [
                    mode
                ];

                _args = _args.concat(args);

                events.onMessage = function(data) {
                    switch (data.status) {
                    case 'ok':
                        setup_done = true;
                        opts.onFinished();

                        break;
                    default:
                        // TODO: do something?
                        break;
                    }

                };

                if (false === setup_done) {
                    ws.send(_args.join(' '));
                    lastOrder = 'setup';
                }
                else {
                    opts.onFinished();
                }
            },
            /**
             * upload svg
             *
             * @param {String} name - name
             * @param {Blob}   svg  - svg
             * @param {Json}   opts - options
             *      {Function}   onFinished - fire on upload finish
             */
            upload: function(name, svg, opts) {
                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                var self = this,
                    order_name = 'upload',
                    args = [
                        order_name,
                        name,
                        svg.size
                    ];

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'continue':
                        ws.send(svg);
                        break;
                    case 'ok':
                        opts.onFinished(data);
                        break;
                    }

                };

                ws.send(args.join(' '));
            },
            /**
             * get svg
             *
             * @param {String} name - svg name has been upload
             * @param {Json} opts - options
             *      {Function}   onFinished - fire on upload finish
             */
            get: function(name, opts) {
                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                lastOrder = 'get';

                var args = [
                    lastOrder,
                    name
                ],
                blobs = [],
                blob,
                total_length = 0;

                events.onMessage = function(data) {

                    if ('continue' === data.status) {
                        total_length = data.length;
                    }
                    else if (true === data instanceof Blob) {
                        blobs.push(data);
                        blob = new Blob(blobs);

                        if (total_length === blob.size) {
                            History.push(name, blob);
                            opts.onFinished(blob);
                        }
                    }

                };

                ws.send(args.join(' '));
            },
            /**
             * compute svg
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
                opts.onFinished = opts.onFinished || function() {};

                var requests_serial = [],
                    fileReader,
                    all_ok = false,
                    request_header,
                    next_data,
                    timer;

                lastOrder = 'compute';

                args.forEach(function(obj) {
                    request_header = [
                        lastOrder,
                        obj.name,
                        obj.width,
                        obj.height,
                        obj.tl_position_x,
                        obj.tl_position_y,
                        obj.br_position_x,
                        obj.br_position_y,
                        obj.rotate,
                        obj.svg_data.size,
                        obj.image_data.length
                    ];

                    requests_serial.push(request_header.join(' '));
                    requests_serial.push({
                        svg: obj.svg_data,
                        thumbnail: convertToTypedArray(obj.image_data, Uint8Array)
                    });
                });

                requests_serial.reverse();

                next_data = requests_serial.pop();

                events.onMessage = function(data) {
                    switch (data.status) {
                    case 'continue':
                        // ready to sending binary
                        next_data = requests_serial.pop();
                        break;
                    case 'ok':
                        // ready to sending next svg set
                        if (true === all_ok) {
                            opts.onFinished();
                        }
                        else {
                            next_data = requests_serial.pop();
                        }
                        break;
                    default:
                        // TODO: do something?
                        break;
                    }
                };

                timer = setInterval(function() {
                    if ('undefined' !== typeof next_data) {

                        if ('object' === typeof next_data) {
                            fileReader = new FileReader();

                            fileReader.onload = function() {
                                // send svg
                                ws.send(this.result);
                                // send thumbnail
                                ws.send(next_data.thumbnail);

                                fileReader.onload = null;

                                next_data = undefined;
                            };

                            fileReader.readAsArrayBuffer(next_data.svg);
                        }
                        else {
                            ws.send(next_data);
                            next_data = undefined;
                        }
                    }

                    if (0 === requests_serial.length) {
                        all_ok = true;
                        clearInterval(timer);
                    }
                }, 0);
            },
            getGCode: function(names, opts) {
                opts = opts || {};
                opts.onProgressing = opts.onProgressing || function() {};
                opts.onFinished = opts.onFinished || function() {};
                lastOrder = 'getGCode';

                var args = [
                        'go',
                        names.join(' ')
                    ],
                    blobs = [],
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

                ws.send(args.join(' '));
            }
        };
    };
});