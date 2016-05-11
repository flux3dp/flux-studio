/**
 * API upnp-config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-upnp-config-(wifi)
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/rsa-key',
    'helpers/i18n',
    'app/actions/alert-actions',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants'
], function(
    $,
    Websocket,
    rsaKey,
    i18n,
    AlertActions,
    InputLightboxActions,
    InputLightboxConstants
) {
    'use strict';

    return function(uuid) {

        var stages = {
                UPLOAD    : 'UPLOAD',
                CONNECTED : 'CONNECTED'
            },
            $deferred = $.Deferred(),
            lang = i18n.get(),
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
            doConnect = function() {
                currentStage = stages.CONNECTED;

                ws.send(['connect', uuid].join(' '));
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
                        doConnect();
                        break;

                    case stages.CONNECTED:
                        $deferred.resolve();
                        isReady = true;
                        break;
                    }
                },
                onError: function(response) {

                    switch (response.error) {
                    case 'UPNP_PASSWORD_FAIL':
                        AlertActions.showPopupError(response.error, lang.initialize.set_machine_generic.incorrect_password);
                    case 'UPNP_CONNECTION_FAIL':
                        InputLightboxActions.open('need_password', {
                            type        : InputLightboxConstants.TEXT_INPUT,
                            caption     : lang.message.need_password,
                            confirmText : lang.initialize.confirm,
                            onSubmit    : function(password) {
                                $deferred.notify({
                                    status: 'waitting'
                                });
                                currentStage = stages.UPLOAD;
                                ws.send(['upload_password', password].join(' '));
                            }
                        });
                        break;
                    }

                    $deferred.notify(response);
                },
                onFatal: function(response) {
                    AlertActions.showPopupError(response.error, response.error);
                }
            });

        return {
            connection: ws,

            ready: function(callback) {
                return $deferred.done(callback).promise();
            },

            addKey: function() {
                var $deferred = $.Deferred();

                genericSender('add_key', function(response) {
                    $deferred.resolve(response);
                });

                ws.onError(onError.bind(null, function(response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

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

            setWifiNetwork: function(wifi, password) {
                var $deferred = $.Deferred(),
                    wifiConfig = {
                        wifi_mode: 'client',
                        ssid: wifi.ssid,
                        security: wifi.security,
                        method: 'dhcp'
                    },
                    comamnd = ['config_network'];

                switch (wifiConfig.security.toUpperCase()) {
                case 'WEP':
                    wifiConfig.wepkey = password;
                    break;
                case 'WPA-PSK':
                case 'WPA2-PSK':
                    wifiConfig.psk = password;
                    break;
                }

                comamnd.push(JSON.stringify(wifiConfig));

                genericSender(comamnd.join(' '), function(response) {
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