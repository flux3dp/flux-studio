/**
 * API svg laser parser
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-svg-laser-parser
 */
define([
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'helpers/data-history',
    'helpers/api/set-params'
], function(Websocket, convertToTypedArray, history, setParams) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'svg-laser-parser',
                onMessage: function(data) {

                    events.onMessage(data);

                },
                onError: opts.onError,
                onFatal: opts.onFatal
            }),
            uploaded_svg = [],
            lastOrder = '',
            events = {
                onMessage: function() {}
            },
            get = function(name, opts) {
                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                lastOrder = 'get';

                var args = [
                    lastOrder,
                    name
                ],
                blobs = [],
                blob,
                total_length = 0,
                size = {
                    height: 0,
                    width: 0
                };

                events.onMessage = function(data) {

                    if ('continue' === data.status) {
                        total_length = data.length;
                        size.height = data.height;
                        size.width = data.width;
                    }
                    else if (true === data instanceof Blob) {
                        blobs.push(data);
                        blob = new Blob(blobs);

                        if (total_length === blob.size) {
                            History.push(name, { size: size, blob: blob });
                            opts.onFinished(blob, size);
                        }
                    }

                };

                ws.send(args.join(' '));
            },
            upload = function(name, file, opts) {

                var self = this,
                    order_name = 'upload',
                    args = [
                        order_name,
                        name,
                        file.size
                    ],
                    onFinished = opts.onFinished || function() {};

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'continue':
                        ws.send(file.data);
                        break;
                    case 'ok':

                        get(name, opts);
                        break;
                    }

                };

                ws.send(args.join(' '));
            },
            History = history(),
            goNextUpload = true,
            uploadQueue = [];

        // listen upload request
        Array.observe(uploadQueue, function(changes) {
            var change = changes[0],
                timer;

            // push a new entry will make this value greater than zero.
            if (0 < change.addedCount) {
                // keep the current change.
                timer = setInterval((function(change) {

                    return function() {

                        if (true === goNextUpload) {
                            var object = change.object[change.index],
                                onFinished = function(blob, size) {
                                    object.opts.onFinished(blob, size);
                                    goNextUpload = true;
                                    clearInterval(timer);
                                };

                            goNextUpload = false;

                            upload(object.name, object.file, {
                                onFinished: onFinished
                            });
                        }

                    };
                })(change), 0);
            }
        });

        return {
            connection: ws,
            History: History,
            /**
             * upload svg
             *
             * @param {String} name - name
             * @param {Json}   file - the file data that convert by File-Uploader
             * @param {Json}   opts - options
             *      {Function}   onFinished - fire on upload finish
             */
            upload: function(name, file, opts) {
                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                // NOTICE: it's very tricky for modified this array.
                // it will fire observe function then get what you changed (and where you changed)
                uploadQueue.push({ name: name, file: file, opts: opts });
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

                var svg = History.findByName(name)[0];

                opts.onFinished(svg.data.blob, svg.data.size);
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
                        obj.real_width,
                        obj.real_height,
                        obj.tl_position_x,
                        obj.tl_position_y,
                        obj.br_position_x,
                        obj.br_position_y,
                        obj.rotate,
                        obj.svg_data.blob.size,
                        obj.width,
                        obj.height
                    ];

                    requests_serial.push(request_header.join(' '));
                    requests_serial.push({
                        svg: obj.svg_data.blob,
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
            },
            params: setParams(ws, events)
        };
    };
});