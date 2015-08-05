/**
 * API config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-config
 */
define([
    'helpers/websocket',
    'helpers/is-json'
], function(Websocket, isJson) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'config',
                autoReconnect: false,
                onMessage: function(result) {

                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data),
                        error_code;

                    if ('string' === typeof data.status && 'fatal' === data.status) {
                        opts.onError(data.error, data);
                    }
                    else {
                        events.onMessage(data);
                    }

                },
                onClose: function(result) {
                    events.onClose();
                }
            }),
            events = {
                onMessage: function() {},
                onClose: function() {}
            };

        return {
            connection: ws,
            write: function(key, value, opts) {
                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                var blob = new Blob([value.toString()]),
                    args = [
                        'w',
                        key,
                        blob.size
                    ],
                    reader = new FileReader();

                events.onClose = opts.onFinished;

                events.onMessage = function(data) {
                    console.log(data);

                    switch (data.status) {
                    case 'opened':
                        reader.onloadend = function(e) {
                            ws.send(e.target.result);
                        };

                        reader.readAsArrayBuffer(blob);

                        break;
                    default:
                        // TODO: do something?
                        break;
                    }

                };

                ws.send(args.join(' '));

                return this;
            },
            read: function(key, opts) {
                opts = opts || {};
                opts.onFinished = opts.onFinished || function() {};

                var args = [
                        'r',
                        key
                    ],
                    reader = new FileReader();

                events.onClose = opts.onFinished;

                events.onMessage = function(data) {
                    if ('opened' === data.status) {
                        // TODO: do something?
                    }
                    else if (data instanceof Blob) {
                        reader.onloadend = function(e) {
                            var data = e.target.result;
                            opts.onFinished(data);
                        };

                        reader.readAsText(data);
                    }

                };

                ws.send(args.join(' '));

                return this;
            }
        };
    };
});