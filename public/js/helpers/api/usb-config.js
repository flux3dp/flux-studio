/**
 * API usb config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-usb-config
 */
define([
    'helpers/websocket'
], function(Websocket) {
    'use strict';

    var ws;

    return function(globalOpts) {
        globalOpts = globalOpts || {};
        globalOpts.onError = globalOpts.onError || function() {};
        globalOpts.onFatal = globalOpts.onFatal || function() {};
        globalOpts.onClose = globalOpts.onClose || function() {};

        var events = {
            onMessage: function() {}
        };

        if ('undefined' === typeof ws) {
            ws = new Websocket({
                method: 'usb-config'
            });
        }

        ws.onMessage(function(data) {

            events.onMessage(data);

        });

        // singleton object should reset events everytime.
        ws.onError(globalOpts.onError);
        ws.onFatal(globalOpts.onFatal);
        ws.onClose(globalOpts.onClose);

        return {
            connection: ws,
            // list available machine
            list: function(opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                var self = this,
                    goNext = true,
                    timer,
                    reset = function() {
                        clearInterval(timer);
                        goNext = true;
                    },
                    checkPorts = function(ports) {
                        if (true === goNext) {
                            goNext = false;

                            self.connect(
                                (ports.pop() || ''),
                                {
                                    onSuccess: function(response) {
                                        opts.onSuccess(response);
                                        reset();
                                    },
                                    onError: function(response) {
                                        goNext = true;

                                        if (0 === ports.length) {
                                            opts.onError(response);
                                            reset();
                                        }
                                    }
                                }
                            );
                        }
                    };

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
                        data.port = port;
                        opts.onSuccess(data);
                    }
                };

                ws.send(args.join(' '));
            },

            getWifiNetwork: function(opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                // TODO: remove fake wifi network
                var securities = [
                        '', 'WEP', 'WPA-PSK', 'WPA2-PSK'
                    ],
                    items = [],
                    security;

                // return flux 2.4g
                items.push({
                    security: 'WPA2-PSK',
                    ssid: 'Flux-2.4GHz',
                    password: true
                });

                for (var i = 0; i < 10; i++) {
                    security = securities[parseInt(Math.random() * 100 % 4, 10)];
                    items.push({
                        security: security,
                        ssid: 'test-' + i,
                        password: '' !== security
                    });
                };

                opts.onSuccess({
                    status: 'ok',
                    items: items
                });
            },

            setWifiNetwork: function(wifi, password, opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                var wifi = {
                        wifi_mode: 'client',
                        ssid: wifi.ssid,
                        security: wifi.security,
                        method: 'dhcp'
                    },
                    args = [
                        'set network'
                    ];

                switch (wifi.security.toUpperCase()) {
                case 'WEP':
                    wifi['wepkey'] = password;
                    break;
                case 'WPA-PSK':
                case 'WPA2-PSK':
                    wifi['psk'] = password;
                    break;
                default:
                    // do nothing
                    break;
                }

                args.push(JSON.stringify(wifi));

                ws.onError(opts.onError);

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                ws.send(args.join(' '));
            },

            getMachineNetwork: function(opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                ws.onError(opts.onError);

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                var timer = setInterval(function() {
                    ws.send('get network');
                }, 1000);

                return {
                    stop: function() {
                        clearInterval(timer);
                    }
                };
            },

            setMachine: function(opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                var args;

                ws.onError(opts.onError);

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                return {
                    name: function(name) {
                        args = [
                            'set general',
                            JSON.stringify({
                                name: name
                            })
                        ];
                        ws.send(args.join(' '));
                    },
                    password: function(password) {
                        args = [
                            'set password',
                            password
                        ];
                        ws.send(args.join(' '));
                    }
                };
            },

            close: function() {
                ws.close();
                ws = null;
            }
        };
    };
});