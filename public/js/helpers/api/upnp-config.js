/**
 * API upnp-config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-upnp-config-(wifi)
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/api/config',
    'helpers/rsa-key'
], function($, Websocket, Config, rsaKey) {
    'use strict';

    return function(uuid) {

        var stages = {
                UPLOAD    : 'UPLOAD',
                CONNECTED : 'CONNECTED'
            },
            currentStage = stages.UPLOAD,
            isReady = false,
            onMessage = function(messageHandler, response) {
                isReady = ('ok' === response.status);
                messageHandler(response);
            },
            onError = function(errorHandler, response) {
                isReady = true;
                errorHandler(response);
            },
            genericSender = function(command, messageHandler) {
                var timer = setInterval(function() {
                    if (true === isReady) {
                        ws.send(command);
                        ws.onMessage(onMessage.bind(null, messageHandler));
                        clearInterval(timer);
                        isReady = false;
                    }
                }, 0);
            },
            ws = new Websocket({
                method: 'upnp-config',
                autoReconnect: false,
                onOpen: function() {
                    ws.send(['upload_key', rsaKey()].join(' '));
                },
                onMessage: function(response) {
                    switch (currentStage) {
                    case stages.UPLOAD:
                        currentStage = stages.CONNECTED;

                        ws.send(['connect', uuid].join(' '));
                        break;

                    case stages.CONNECTED:
                        isReady = true;
                        break;
                    }
                }
            });

        return {
            getWifiNetwork: function() {
                var $deferred = $.Deferred(),
                    strength = {
                        BEST: 'best',
                        GOOD: 'good',
                        POOR: 'poor',
                        BAD: 'bad'
                    };

                genericSender('scan_wifi', function(data) {
                    data.items = data.items || [];

                    data.wifi.forEach(function(wifi, i) {
                        wifi.rssi = Math.abs(wifi.rssi || 0);

                        if (75 < wifi.rssi) {
                            data.wifi[i].strength = strength.BEST;
                        }
                        else if (50 < strength) {
                            data.wifi[i].strength = strength.GOOD;
                        }
                        else if (25 < strength) {
                            data.wifi[i].strength = strength.POOR;
                        }
                        else {
                            data.wifi[i].strength = strength.BAD;
                        }

                        data.items.push({
                            security: data.wifi[i].security,
                            ssid: data.wifi[i].ssid,
                            password: ('' !== data.wifi[i].security),
                            rssi: wifi.rssi,
                            strength: wifi.strength
                        });

                    });

                    $deferred.resolve(data);
                });

                ws.onError(onError.bind(null, function(response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            configNetwork: function(wifi, password) {
                var $deferred = $.Deferred(),
                    wifiConfig = {
                        wifi_mode: 'client',
                        ssid: wifi.ssid,
                        security: wifi.security,
                        method: 'dhcp'
                    },
                    comamnd = ['config_network', ''].join(' ');

                switch (wifiConfig.security.toUpperCase()) {
                case 'WEP':
                    wifiConfig.wepkey = password;
                    break;
                case 'WPA-PSK':
                case 'WPA2-PSK':
                    wifiConfig.psk = password;
                    break;
                }

                genericSender(comamnd, function(response) {
                    $deferred.resolve(response);
                });

                ws.onError(onError.bind(null, function(response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            setAPMode: function(ssid, pass) {
                var $deferred = $.Deferred(),
                    args = [
                        'config_network',
                        JSON.stringify({
                            ssid: ssid,
                            psk: pass,
                            security: 'WPA2-PSK',
                            wifi_mode: 'host',
                            method: 'dhcp'
                        })
                    ],
                    comamnd = args.join(' ');

                genericSender(comamnd, function(response) {
                    $deferred.resolve(response);
                });

                ws.onError(onError.bind(null, function(response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            name: function(name) {
                var $deferred = $.Deferred(),
                    comamnd = ['set_name', name].join(' ');

                genericSender(comamnd, function(response) {
                    $deferred.resolve(response);
                });

                ws.onError(onError.bind(null, function(response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            password: function(old_pass, new_pass) {
                var $deferred = $.Deferred(),
                    comamnd = ['set_password', old_pass, new_pass].join(' ');

                if ('' !== old_pass && '' !== new_pass) {
                    genericSender(comamnd, function(response) {
                        $deferred.resolve(response);
                    });
                }
                else {
                    $deferred.resolve();
                }

                ws.onError(onError.bind(null, function(response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },
        };
    };
});