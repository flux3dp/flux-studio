/**
 * API usb config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-usb-config
 */
define([
    'helpers/websocket'
], function(Websocket) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onFatal = opts.onFatal || function() {};
        opts.onClose = opts.onClose || function() {};

        var ws = new Websocket({
                method: 'usb-config',
                onMessage: function(data) {

                    events.onMessage(data);

                },
                onError: opts.onError,
                onFatal: opts.onFatal,
                onClose: opts.onClose
            }),
            events = {
                onMessage: function() {}
            };

        return {
            connection: ws,
            // list available machine
            list: function(opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                var self = this,
                    goNext = true,
                    checkPorts = function(ports) {
                        if (true === goNext) {
                            goNext = false;

                            self.connect(
                                (ports.pop() || ''),
                                {
                                    onSuccess: function(response) {
                                        goNext = true;
                                        opts.onSuccess(response);
                                        clearInterval(timer);
                                    },
                                    onError: function(response) {
                                        goNext = true;

                                        if (0 === ports.length) {
                                            clearInterval(timer);
                                            opts.onError(response);
                                        }
                                    }
                                }
                            );
                        }
                    },
                    timer;

                events.onMessage = function(data) {

                    if ('ok' === data.status) {
                        timer = setInterval(function() {
                            checkPorts(data.ports);
                        }, 100);
                    }

                };

                ws.send('list');
            },
            connect: function(port, opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                var args = [
                    'connect',
                    port
                ];

                ws.onError(opts.onError);

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };


                ws.send(args.join(' '));
            }
        };
    };
});