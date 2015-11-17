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
            },
            reorganizeOptions = function(opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                return opts;
            };

        if ('undefined' === typeof ws) {
            ws = new Websocket({
                method: 'usb-config',
                autoReconnect: false
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
            // list available port
            list: function(opts) {
                opts = reorganizeOptions(opts);

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
                opts = reorganizeOptions(opts);

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
                opts = reorganizeOptions(opts);

                ws.onError(opts.onError);

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        for (var i in data.wifi) {
                            data.items = data.items || [];

                            if (true === data.wifi.hasOwnProperty(i)) {
                                data.items.push({
                                    security: data.wifi[i].security,
                                    ssid: data.wifi[i].ssid,
                                    password: ('' !== data.wifi[i].security)
                                });
                            }
                        };

                        opts.onSuccess(data);
                    }
                };

                ws.send('scan_wifi');
            },

            setWifiNetwork: function(wifi, password, opts) {
                opts = reorganizeOptions(opts);

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
                opts = reorganizeOptions(opts);

                ws.onError(opts.onError);

                var sendCommand = function() {
                    ws.send('get network');
                };

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }

                    sendCommand();
                };

                sendCommand();

                return {
                    stop: function() {
                        sendCommand = function() {};
                    }
                };
            },

            setMachine: function(opts) {
                opts = reorganizeOptions(opts);

                var args;

                ws.onError(opts.onError);

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                return {
                    name: function(name, _opts) {
                        opts.onSuccess = _opts.onSuccess || function() {};
                        args = [
                            'set general',
                            JSON.stringify({
                                name: name
                            })
                        ];
                        ws.send(args.join(' '));
                    },
                    password: function(password, _opts) {
                        opts.onSuccess = _opts.onSuccess || function() {};
                        args = [
                            'set password',
                            password
                        ];

                        if ('' !== password) {
                            ws.send(args.join(' '));
                        }
                        else {
                            opts.onSuccess();
                        }
                    }
                };
            },

            setAPMode: function(opts) {
                opts = reorganizeOptions(opts);

                var args = [
                    'set network',
                    JSON.stringify({
                        wifi_mode: 'host',
                        method: 'dhcp'
                    })
                ];

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                ws.onError(opts.onError);
                ws.send(args.join(' '));
            },

            auth: function(password, opts) {
                password = password || '';
                opts = reorganizeOptions(opts);

                var args = [
                    'auth'
                ];

                if ('' !== password) {
                    args.push(password);
                }

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                ws.onError(opts.onError);
                ws.send(args.join(' '));
            },

            close: function() {
                ws.close();
                ws = null;
            }
        };
    };
});