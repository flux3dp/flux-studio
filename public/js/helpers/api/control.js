/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/convertToTypedArray'
], function($, Websocket, convertToTypedArray) {
    'use strict';

    return function(serial, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'control/' + serial,
                onMessage: function(data) {

                    events.onMessage(data);

                },
                onError: opts.onError
            }),
            lastOrder = '',
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
                opts.onPrinting = opts.onPrinting || function() {};
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
                            // TODO: to be implement?
                        }
                        else if ('continue' === data.status) {
                            var fileReader;

                            for (var i = 0; i < length; i += CHUNK_PKG_SIZE) {
                                chunk = print_data.slice(i, i + CHUNK_PKG_SIZE);

                                if (print_data instanceof Array) {
                                    chunk = convertToTypedArray(chunk, Uint8Array);
                                }

                                fileReader = new FileReader();

                                fileReader.onloadend = function(e) {
                                    ws.send(this.result);
                                }
                                fileReader.readAsArrayBuffer(chunk);
                            }

                        }
                        else if ('ok' === data.status) {
                            lastOrder = 'start';
                            events.onMessage = _startPrint;
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
            },
            getStatus: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('position');
                lastOrder = 'status';

                return d.promise();
            },
            abort: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('abort');
                lastOrder = 'abort';

                return d.promise();
            },
            start: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('start');
                lastOrder = 'start';

                return d.promise();
            },
            reset: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('kick');
                lastOrder = 'kick';

                return d.promise();
            },
            quit: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('quit');
                lastOrder = 'quit';

                return d.promise();
            }
        };
    };
});
