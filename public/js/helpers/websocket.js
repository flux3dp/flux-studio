define([
    'helpers/is-json',
    'helpers/i18n',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/progress-actions',
    'helpers/output-error',
    'helpers/logger'
], function(
    isJson,
    i18n,
    AlertActions,
    AlertStore,
    ProgressActions,
    outputError,
    Logger
) {
    'use strict';

    window.FLUX.websockets = [];

    var hadConnected = false,
        showProgramErrorPopup = true,
        WsLogger = new Logger('websocket'),
        logLimit = 100;

    // options:
    //      hostname      - host name (Default: localhost)
    //      port          - what protocol uses (Default: 8000)
    //      method        - method be called
    //      autoReconnect - auto reconnect on close
    //      onMessage     - fired on receive message
    //      onError       - fired on a normal error happend
    //      onFatal       - fired on a fatal error closed
    //      onClose       - fired on connection closed
    //      onOpen        - fired on connection connecting
    return function(options) {
        var lang = i18n.get(),
            defaultCallback = function(result) {},
            defaultOptions = {
                hostname: (true === window.FLUX.isNW ? 'localhost' : location.hostname),
                method: '',
                port: window.FLUX.ghostPort,
                autoReconnect: true,
                ignoreAbnormalDisconnect: false,
                onMessage: defaultCallback,
                onError: defaultCallback,
                onFatal: defaultCallback,
                onClose: defaultCallback,
                onOpen: defaultCallback
            },
            received_data = [],
            trimMessage = function(message) {
                message = message.replace(/\"/g, '');

                if (150 < message.length) {
                    return message.substr(0, 200) + '...';
                }

                return message;
            },
            origanizeOptions = function(opts) {
                for (var name in defaultOptions) {
                    if (false === opts.hasOwnProperty(name) || 'undefined' === typeof opts[name]) {
                        opts[name] = defaultOptions[name];
                    }
                }

                return opts;
            },
            createWebSocket = function(options) {
                var url = 'ws://' + options.hostname + ':' + options.port + '/ws/' + options.method,
                    _ws = new WebSocket(url);

                _ws.onopen = function(e) {
                    socketOptions.onOpen(e);
                };

                _ws.onmessage = function(result) {
                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data),
                        message = trimMessage(['<', result.data].join(' '));

                    if(typeof data === 'string') {
                        data = data.replace(/\\/g, '\\\\');
                    }

                    while(wsLog.log.length >= logLimit) {
                        wsLog.log.shift();
                    }
                    wsLog.log.push(message);

                    if ('string' === typeof data) {
                        data = data.replace(/\bNaN\b/g, 'null');
                        data = data.replace(/\r?\n|\r/g);
                    }

                    data = (true === isJson(data) ? JSON.parse(data) : data);

                    while(received_data.length >= logLimit) {
                        received_data.shift();
                    }
                    received_data.push(data);

                    if ('error' === data.status) {
                        socketOptions.onError(data);
                    }
                    else if ('fatal' === data.status) {
                        socketOptions.onFatal(data);
                    }
                    else if ('pong' === data.status) {
                        // it's a heartbeat response. ignore it.
                    }
                    else {
                        socketOptions.onMessage(data);
                    }

                    hadConnected = true;
                };

                _ws.onclose = function(result) {
                    ProgressActions.close();
                    socketOptions.onClose(result);

                    var abnormallyId = 'abnormally-close',
                        message = '',
                        outputLog = function() {
                            outputError().done(onCancel);
                        },
                        onCancel = function() {
                            removeListener();
                            console.log('output error');
                            showProgramErrorPopup = true;
                        },
                        removeListener = function() {
                            AlertStore.removeCustomListener(outputLog);
                            AlertStore.removeCancelListener(onCancel);
                        };

                    // The connection was closed abnormally without sending or receving data
                    // ref: http://tools.ietf.org/html/rfc6455#section-7.4.1
                    if (1006 === result.code &&
                        60000 <= (new Date()).getTime() - window.FLUX.timestamp
                    ) {
                        wsLog.log.push(['**abnormal disconnection**'].join(' '));
                    }

                    if (1006 === result.code &&
                        60000 <= (new Date()).getTime() - window.FLUX.timestamp &&
                        false === options.ignoreAbnormalDisconnect &&
                        true === showProgramErrorPopup
                    ) {
                        if (false === hadConnected) {
                            message = lang.message.cant_establish_connection;
                        }
                        else {
                            message = lang.message.application_occurs_error;
                        }

                        showProgramErrorPopup = false;
                        AlertActions.showPopupCustom(abnormallyId, message, lang.message.error_log);
                        AlertStore.onCustom(outputLog);
                        AlertStore.onCancel(onCancel);
                    }

                    if (true === socketOptions.autoReconnect) {
                        received_data = [];
                        ws = createWebSocket(options);
                    }
                    else {
                        ws = null;  // release
                    }
                };

                return _ws;
            },
            ws = null,
            readyState = {
                CONNECTING : 0,
                OPEN       : 1,
                CLOSING    : 2,
                CLOSED     : 3
            },
            socketOptions = origanizeOptions(options);

        ws = createWebSocket(socketOptions);

        setInterval(function() {
            if (null !== ws && readyState.OPEN === ws.readyState) {
                wsLog.log.push(['>', 'ping'].join(' '));
                ws.send('ping');
            }
        }, 60000);

        var wsLog = {
                url: '/ws/' + options.method,
                log: []
            },
            wsobj = {
                readyState: readyState,
                options: socketOptions,
                url: '/ws/' + options.method,
                log: wsLog.log,
                send: function(data) {
                    var self = this;

                    if (null === ws) {
                        ws = createWebSocket(socketOptions);
                    }

                    if (null === ws || readyState.OPEN !== ws.readyState) {
                        ws.onopen = function(e) {
                            wsLog.log.push(trimMessage(['>', data, typeof data].join(' ')));
                            socketOptions.onOpen(e);
                            ws.send(data);
                        };
                    }
                    else {
                        wsLog.log.push(trimMessage(['>', data, typeof data].join(' ')));
                        ws.send(data);
                    }

                    return this;
                },

                fetchData: function() {
                    return received_data;
                },

                fetchLastResponse: function() {
                    return this.fetchData()[received_data.length - 1];
                },

                getReadyState: function() {
                    return ws.readyState;
                },

                close: function(reconnect) {
                    if ('boolean' === typeof reconnect) {
                        socketOptions.autoReconnect = reconnect;
                    }

                    if (null !== ws) {
                        ws.close();
                    }
                },

                // events
                onOpen: function(callback) {
                    socketOptions.onOpen = callback;

                    return this;
                },

                onMessage: function(callback) {
                    socketOptions.onMessage = callback;

                    return this;
                },

                onClose: function(callback) {
                    socketOptions.onclose = callback;

                    return this;
                },

                onError: function(callback) {
                    socketOptions.onError = callback;

                    return this;
                },

                onFatal: function(callback) {
                    socketOptions.onFatal = callback;

                    return this;
                }
            };

        window.FLUX.websockets.push(wsobj);

        WsLogger.append(wsLog);

        return wsobj;
    };
});
