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
            isConnected = false,
            ws,
            lastOrder = '',
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
            var _ws = new Websocket({
                method: 'camera/' + uuid,
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
                            isConnected = true;
                            events.onMessage(data);
                            break;
                        }
                    }
                },
                // onError: opts.onError,
                onError: function(response) {
                    events.onError(response);
                },
                onFatal: function(response) {
                    clearTimeout(timmer);
                    events.onError(response);
                },
                onClose: function(response) {
                    clearTimeout(timmer);
                    isConnected = false;
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
