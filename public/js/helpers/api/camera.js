/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'jquery',
    'helpers/websocket',
    'app/constants/device-constants',
    'helpers/rsa-key',
    'Rx'
], function($, Websocket, DeviceConstants, rsaKey) {
    'use strict';

    return function(uuid, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onConnect = opts.onConnect || function() {};

        var timeout = 10000,
            timmer,
            ws,
            events = {
                onMessage: function() {},
                onError: opts.onError
            },
            isTimeout = function() {
                var error = {
                    'status': 'error',
                    'error': 'TIMEOUT',
                    'info': 'connection timeoout'
                };
                opts.onError(error);
                ws.close();
            };

        function createWs() {
            let url = opts.availableUsbChannel >= 0 ? `usb/${opts.availableUsbChannel}` : uuid;
            let _ws = new Websocket({
                method: `camera/${url}`,
                onMessage: function(data) {
                    if(data instanceof Blob) {
                        events.onMessage(data);
                    }
                    else {
                        switch (data.status) {
                        case 'connecting':
                            opts.onConnect(data);
                            clearTimeout(timmer);
                            timmer = setTimeout(isTimeout, timeout);
                            break;
                        case 'connected':
                            clearTimeout(timmer);
                            opts.onConnect(data);
                            break;
                        default:
                            events.onMessage(data);
                            break;
                        }
                    }
                },
                onError: function(response) {
                    events.onError(response);
                },
                onFatal: function(response) {
                    clearTimeout(timmer);
                    events.onError(response);
                },
                onClose: function(response) {
                    clearTimeout(timmer);
                },
                autoReconnect: false
            });
            _ws.send(rsaKey());
            return _ws;
        }

        return {
            connection: ws,
            startStream: function(callback) {
                events.onMessage = function(result) {
                    callback(result);
                };
                ws = createWs();

            },
            closeStream: function() {
                ws.close(false);
            }
        };
    };
});
