/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'helpers/websocket',
    'helpers/is-json',
    'helpers/convertToTypedArray'
], function(Websocket, isJson, convertToTypedArray) {
    'use strict';

    return function(serial, opts) {
        opts = opts || {};
        opts.onPrinting = opts.onPrinting || function() {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'control/' + serial,
                onMessage: function(result) {
                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data);

                    lastMessage = data;

                    if ('string' === typeof data.status && 'error' === data.status) {
                        opts.onError(data);
                    }
                    else {
                        events.onMessage(data);
                    }

                }
            }),
            lastOrder = '',
            lastMessage = '',
            events = {
                onMessage: function() {}
            };

        return {
            ws: ws,
            ls: function() {
                lastOrder = 'ls';
                ws.send(lastOrder);
            },
            selectFile: function(filename) {
                lastOrder = 'select';
                ws.send(lastOrder + ' ' + filename);
            },
            upload: function(filesize, print_data, opts) {
                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                var CHUNK_PKG_SIZE = 4096,
                    length = print_data.length || print_data.size,
                    interrupt = function(cmd) {
                        if ('start' === lastOrder) {
                            ws.send(cmd);
                        }
                    },
                    _uploading = function(data) {
                        if ('connected' === data.status) {
                            console.time('uploading');
                        }
                        else if ('continue' === data.status) {
                            var fileReader;

                            for (var i = 0; i < length; i += CHUNK_PKG_SIZE) {
                                chunk = print_data.slice(i, i + CHUNK_PKG_SIZE);

                                if (print_data instanceof Array) {
                                    chunk = convertToTypedArray(chunk, Uint8Array);
                                }

                                // blobs.push(chunk);
                                fileReader = new FileReader();

                                fileReader.onloadend = function(e) {
                                    ws.send(this.result);
                                }
                                fileReader.readAsArrayBuffer(chunk);
                            }

                        }
                        else if ('ok' === data.status) {
                            console.timeEnd('uploading');
                        }
                        else {
                            // TODO: do something
                        }
                    },
                    _startPrint = function(data) {
                        opts.onPrinting(data);
                    },
                    blobs = [],
                    chunk;

                lastOrder = 'upload';

                events.onMessage = _uploading;

                ws.send(lastOrder + ' ' + filesize);

                return {
                    pause: function() {
                        interrupt('pause');
                    },
                    resume: function() {
                        interrupt('resume');
                    },
                    abort: function() {
                        interrupt('abort');
                    }
                };
            }
        };
    };
});
