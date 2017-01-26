/**
 * API usb config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-usb-config
 */
define([
    'jquery',
    'helpers/device-master',
    'helpers/websocket',
    'helpers/api/config',
    'helpers/rsa-key'
], function($, DeviceMaster, Websocket, Config, rsaKey) {
    'use strict';

    let ws = null,
        usbChannel = -1;

    return function(globalOpts) {
        globalOpts = globalOpts || {};
        globalOpts.onError = globalOpts.onError || function() {};
        globalOpts.onFatal = globalOpts.onFatal || function() {};
        globalOpts.onClose = globalOpts.onClose || function() {};

        if(usbChannel !== DeviceMaster.getAvailableUsbChannel()) {
            ws = null;
            usbChannel = DeviceMaster.getAvailableUsbChannel();
        }

        const initializeWebSocket = () => {
            let method = usbChannel === -1 ? 'usb-config' : `device-manager/usb/${usbChannel}`;
            ws = new Websocket({
                method: method,
                autoReconnect: false
            });
        };

        var events = {
                onMessage: function() {}
            },
            reorganizeOptions = function(opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};

                return opts;
            };

        if (null === ws) {
            initializeWebSocket();
        }

        ws.onMessage(data => { events.onMessage(data); });

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

                if(usbChannel === -1) {
                    ws.send('list');
                }
                else {
                    console.log('device info', DeviceMaster.getUsbDeviceInfo());
                    events.onMessage = (r) => {
                        if(r.status === 'connected') {
                            let deviceInfo = Object.assign({}, r);
                            delete deviceInfo.status;
                            console.log(deviceInfo);
                            opts.onSuccess(deviceInfo);
                        }
                    };

                    ws.send(rsaKey());
                }
            },

            connect: function(port, opts) {
                opts = reorganizeOptions(opts);

                var currentCommand = 'key',
                    args = [
                        currentCommand,
                        rsaKey()
                    ];

                ws.onError(opts.onError);

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        if ('key' === currentCommand) {
                            currentCommand = 'connect';
                            args = [
                                currentCommand,
                                port
                            ];
                            ws.send(args.join(' '));
                        }
                        else {
                            data.port = port;
                            opts.onSuccess(data);
                        }
                    }
                };

                ws.send(args.join(' '));
            },

            getWifiNetwork: function() {
                var $deferred = $.Deferred(),
                    strength = {
                        BEST: 'best',
                        GOOD: 'good',
                        POOR: 'poor',
                        BAD: 'bad'
                    };

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        data.items = data.items || [];
                        let w = data.wifi || data.access_points || [];

                        w.forEach(function(wifi, i) {
                            wifi.rssi = Math.abs(wifi.rssi || 0);

                            if (75 < wifi.rssi) {
                                wifi.strength = strength.BEST;
                            }
                            else if (50 < strength) {
                                wifi.strength = strength.GOOD;
                            }
                            else if (25 < strength) {
                                wifi.strength = strength.POOR;
                            }
                            else {
                                wifi.strength = strength.BAD;
                            }

                            data.items.push({
                                security: wifi.security,
                                ssid: wifi.ssid,
                                password: ('' !== wifi.security),
                                rssi: wifi.rssi,
                                strength: wifi.strength
                            });

                        });

                        $deferred.resolve(data);
                    }
                };

                ws.onError(function(response) {
                    $deferred.fail(response);
                });

                if(usbChannel === -1) {
                    ws.send('scan_wifi');
                }
                else {
                    ws.send('scan_wifi_access_points');
                }

                return $deferred.promise();
            },

            setWifiNetwork: function(wifi, password, opts) {
                opts = reorganizeOptions(opts);

                var wifiConfig = {
                        wifi_mode: 'client',
                        ssid: wifi.ssid,
                        security: wifi.security,
                        method: 'dhcp'
                    },
                    args = [
                        'set network'
                    ];

                switch (wifiConfig.security.toUpperCase()) {
                case 'WEP':
                    wifiConfig.wepkey = password;
                    break;
                case 'WPA-PSK':
                case 'WPA2-PSK':
                    wifiConfig.psk = password;
                    break;
                default:
                    // do nothing
                    break;
                }

                args.push(JSON.stringify(wifiConfig));

                ws.onError(opts.onError);

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                if(usbChannel === -1) {
                    ws.send(args.join(' '));
                }
                else {
                    let params = [];
                    Object.keys(wifiConfig).forEach(k => {
                        params.push(`${k}="${wifiConfig[k]}"`);
                    });

                    ws.send(`set_network ${params.join(' ')}`);
                }
            },

            getMachineNetwork: function(deferred) {
                var $deferred = deferred || $.Deferred(),
                    ipv4Pattern = /^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/g;

                events.onMessage = function(response) {
                    response.ipaddr = response.ipaddr || [];
                    response.ssid = response.ssid || '';

                    if(usbChannel === -1) {
                        if ('ok' === response.status &&
                            0 < response.ipaddr.length &&
                            true === ipv4Pattern.test(response.ipaddr[0]) &&
                            '' !== response.ssid
                        ) {
                            response.action = 'GOOD';
                            $deferred.resolve(response);
                        }
                        else {
                            $deferred.notify({ action: 'TRY_AGAIN' });
                        }
                    }
                    else {
                        if(response.status === 'ok' && response.ssid !== '') {
                            $deferred.resolve(response);
                        }
                        else if(response.status === 'error') {
                            $deferred.reject(response);
                        }
                        else {
                            $deferred.notify({ action: 'TRY_AGAIN' });
                        }
                    }
                };

                if(usbChannel === -1) {
                    ws.send('get network');
                }
                else {
                    ws.send('get_wifi_ssid');
                }

                ws.onError(function(data) {
                    $deferred.notify({ action: 'ERROR' });
                });

                return $deferred;
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
                        if(usbChannel === -1) {
                            args = [
                                'set general',
                                JSON.stringify({
                                    name: name
                                })
                            ];
                            ws.send(args.join(' '));
                        }
                        else {
                            ws.send(`set_nickname ${JSON.stringify(name)}`);
                        }
                    },
                    password: function(password, _opts) {
                        opts.onSuccess = _opts.onSuccess || function() {};

                        if ('' !== password) {
                            if(usbChannel === -1) {
                                args = [
                                    'set password',
                                    password
                                ];
                                ws.send(args.join(' '));
                            }
                            else {
                                ws.send(`reset_password ${JSON.stringify(password)}`);
                            }
                        }
                        else {
                            opts.onSuccess();
                        }
                    }
                };
            },

            setAPMode: function(ssid, pass, opts) {
                opts = reorganizeOptions(opts);

                var args = [ 'set network' ],
                    wifiConfig = {
                        ssid: ssid,
                        psk: pass,
                        security: 'WPA2-PSK',
                        wifi_mode: 'host',
                        method: 'dhcp'
                    }

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                ws.onError(opts.onError);

                if(usbChannel === -1) {
                    args.push(JSON.stringify(wifiConfig));
                    ws.send(args.join(' '));
                }
                else {
                    let params = [];
                    Object.keys(wifiConfig).forEach(k => {
                        params.push(`${k}="${wifiConfig[k]}"`);
                    });

                    ws.send(`set_network ${params.join(' ')}`);
                }
            },

            auth: function(password, opts) {
                password = password || '';
                opts = reorganizeOptions(opts);

                var args = [ 'auth' ];

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
