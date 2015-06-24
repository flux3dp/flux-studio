/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'helpers/websocket',
    'helpers/convertToTypedArray'
], function(Websocket, convertToTypedArray) {
    'use strict';

    return function(serial, opts) {
        opts = opts || {};
        opts.onPrinting = opts.onPrinting || function() {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'control/' + serial,
                onMessage: function(result) {
                    var data = JSON.parse(JSON.stringify(result.data)),
                        error_code;

                    lastMessage = data;

                    if (false === result.data.startsWith('error')) {
                        onMessage(data);
                    }
                    else {
                        error_code = result.data.replace('error ');
                        opts.onError(error_code, data);
                    }

                }
            }),
            lastOrder = '',
            lastMessage = '',
            onMessage = function() {};

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
            upload: function(filesize, print_data) {
                var CHUNK_PKG_SIZE = 4096,
                    length = print_data.length || print_data.size,
                    interrupt = function(cmd) {
                        if ('start' === lastOrder) {
                            ws.send(cmd);
                        }
                    },
                    _uploading = function(data) {
                        if ('connected' === data) {
                            for (var i = 0; i < length; i += CHUNK_PKG_SIZE) {
                                chunk = print_data.slice(i, i + CHUNK_PKG_SIZE);

                                if (print_data instanceof Array) {
                                    chunk = convertToTypedArray(chunk, Uint8Array);
                                }

                                blobs.push(chunk);
                            }
                        }
                        else if('continue' === data) {
                            blobs.forEach(function(blob, k) {
                                ws.send(blob);
                            });
                        }
                        else if ('ok' === data) {
                            lastOrder = 'start';
                            onMessage = _startPrint;
                            ws.send(lastOrder);
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

                onMessage = _uploading;

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