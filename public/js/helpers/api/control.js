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
                    interrupt = function(cmd) {
                        if ('start' === lastOrder) {
                            ws.send(cmd);
                        }
                    },
                    _uploading = function(data) {
                        if ('continue' === data) {
                            for (var i = 0; i < print_data.length; i += CHUNK_PKG_SIZE) {
                                sub_data.push(convertToTypedArray(print_data.slice(i, i + CHUNK_PKG_SIZE), Uint8Array));
                            }
                        }
                        else if ('ok' === data) {
                            lastOrder = 'start';
                            onMessage = _startPrint;
                            ws.send(lastOrder);
                        }
                    },
                    _startPrint = function(data) {
                        opts.onPrinting(data);
                    },
                    sub_data = [];

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