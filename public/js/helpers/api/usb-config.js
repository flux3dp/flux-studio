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

        if(usbChannel !== DeviceMaster.getAvailableUsbChannel() || usbChannel === undefined) {
            ws = null;
            usbChannel = DeviceMaster.getAvailableUsbChannel();
        } else if (globalOpts.forceReconnect) {
            if (ws !== null) {
                ws.close();
            }
            ws = null;
        }

        const initializeWebSocket = () => {
            let isWifi = usbChannel === -1;
            let method = isWifi ? 'usb-config' : `device-manager/usb/${usbChannel}`;
            ws = new Websocket({
                method: method,
                autoReconnect: false
            });
        };

        var events = {
                onMessage: function() {},
                onError: function() {},
                onFatal: function() {}
            },
            reorganizeOptions = function(opts) {
                opts = opts || {};
                opts.onSuccess = opts.onSuccess || function() {};
                opts.onError = opts.onError || function() {};
                opts.onFatal = opts.onFatal || function() {};

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
            // connect available port
            list: function(opts) {
                opts = reorganizeOptions(opts);

                var self = this,
                    goNext = true,
                    timer = setTimeout(() => {
                        opts.onError('timeout');
                    }, 30000);

                const reset = () => {
                    clearTimeout(timer);
                    goNext = true;
                };

                const checkPorts = (ports) => {
                    if(goNext !== true) { return; }
                    goNext = false;

                    const port = ports.pop() || '';
                    const callback = {
                        onSuccess: function(response) {
                            opts.onSuccess(response);
                            reset();
                        },
                        onError: function(response) {
                            goNext = true;

                            opts.onError(response);
                            reset();
                        }
                    };

                    if (!port) {
                        goNext = true;
                        opts.onError(response);
                        reset();
                    }

                    self.connect(port, callback );
                };

                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        checkPorts(data.ports);
                    }
                };

                if(usbChannel === -1 || usbChannel === undefined) {
                    opts.onError({});
                }
                else {
                    events.onMessage = (r) => {
                        if(r.status === 'connected') {
                            ws.usbData = r;
                            ws.send('list_trust');
                        }
                        else if(r.status === 'ok') {
                            ws.usbData.addr = usbChannel;
                            opts.onSuccess(ws.usbData);
                            reset();
                        }
                    };

                    ws.onFatal((r) => {
                        opts.onError(r);
                        ws.onFatal(globalOpts.onFatal);
                        reset();
                    });

                    ws.onError((r) => {
                        opts.onError(r);
                        ws.onError(globalOpts.onError);
                        reset();
                    });
                    console.log(usbChannel);
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
                        data.access_points = data.access_points || [];
                        if(usbChannel === -1) {
                            data.access_points = data.wifi;
                        }

                        data.access_points = data.access_points || [];
                        data.access_points.forEach(function(wifi, i) {
                            wifi.rssi = Math.abs(wifi.rssi || 0);

                            if (75 < wifi.rssi) {
                                data.access_points[i].strength = strength.BEST;
                            }
                            else if (50 < strength) {
                                data.access_points[i].strength = strength.GOOD;
                            }
                            else if (25 < strength) {
                                data.access_points[i].strength = strength.POOR;
                            }
                            else {
                                data.access_points[i].strength = strength.BAD;
                            }

                            data.items.push({
                                security: data.access_points[i].security,
                                ssid: data.access_points[i].ssid,
                                password: ('' !== data.access_points[i].security),
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

                let cmd = usbChannel === -1 ? 'scan_wifi' : 'scan_wifi_access_points';
                ws.send(cmd);

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
                    cmd = usbChannel === -1 ? 'set network' : 'set_network2';

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

                let args = [cmd, JSON.stringify(wifiConfig)];

                ws.onError(opts.onError);
                events.onMessage = function(data) {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                ws.send(args.join(' '));
            },

            joinWifiNetwork: function(wifi, password, hiddenSSID) {
                var d = $.Deferred(),
                    wifiConfig,
                    command = [];

                command.push(usbChannel === -1 ? 'set network' : 'set_network2');

                wifiConfig = {
                    wifi_mode: 'client',
                    ssid: wifi.ssid,
                    security: wifi.security,
                    method: 'dhcp'
                };

                switch (wifiConfig.security.toUpperCase()) {
                case 'WEP':
                    wifiConfig.wepkey = password;
                    break;
                case 'WPA-PSK':
                case 'WPA2-PSK':
                    wifiConfig.psk = password;
                    break;
                }

                if(hiddenSSID) {
                    wifiConfig.scan_ssid = '1';
                }
                command.push(JSON.stringify(wifiConfig));

                events.onError = (err) => { d.reject(err); };
                events.onFatal = (err) => { d.reject(err); };
                events.onMessage = response => {
                    d.resolve(response);
                };

                ws.send(command.join(' '));

                return d.promise();
            },

            getMachineNetwork: function(deferred, name) {
                var $deferred = deferred || $.Deferred(),
                    ipv4Pattern = /^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/g;

                events.onMessage = function(response) {
                    response.ipaddr = response.ipaddr || [];
                    response.ssid = response.ssid || '';
                    if (
                        response.status === 'ok' &&
                        response.ssid === name &&
                        response.ipaddr.length > 0
                    ) {
                        response.action = 'GOOD';
                        $deferred.resolve(response);
                    }
                    else if ('ok' === response.status &&
                        0 < response.ipaddr.length &&
                        true === ipv4Pattern.test(response.ipaddr[0]) &&
                        '' !== response.ssid
                    ) {
                        response.action = 'PREVIOUS_SSID';
                        $deferred.resolve(response);
                    }
                    else {
                        $deferred.notify({ action: 'TRY_AGAIN' });
                    }
                };

                let cmd = usbChannel === -1 ? 'get network' : 'get_network_status';
                ws.send(cmd);

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
                            args = ['set general', JSON.stringify({ name: name })];
                        }
                        else {
                            args = ['set_nickname', name];
                        }

                        ws.send(args.join(' '));
                    },
                    password: function(password, _opts) {
                        opts.onSuccess = _opts.onSuccess || function() {};
                        let cmd = usbChannel === -1 ? 'set password' : 'reset_password';
                        args = [ cmd, password ];

                        if (password !== '') {
                            ws.send(args.join(' '));
                        }
                        else {
                            opts.onSuccess();
                        }
                    }
                };
            },

            setAPMode: function(ssid, pass, opts) {
                opts = reorganizeOptions(opts);
                let cmd = usbChannel === -1 ? 'set network' : 'set_network2';
                var args = [
                    cmd,
                    JSON.stringify({
                        ssid: ssid,
                        psk: pass,
                        security: 'WPA2-PSK',
                        wifi_mode: 'host',
                        method: 'dhcp'
                    })
                ];

                events.onMessage = (data) => {
                    if ('ok' === data.status) {
                        opts.onSuccess(data);
                    }
                };

                events.onError = (error) => { console.log(error); };
                events.onFatal = (error) => { console.log(error); };

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
                ws.close(false);
                ws = null;
            }
        };
    };
});
