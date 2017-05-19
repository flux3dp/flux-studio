define([
    'helpers/is-json',
    'helpers/i18n',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'helpers/output-error',
    'helpers/logger',
    'helpers/blob-segments',
], function(
    isJson,
    i18n,
    AlertActions,
    AlertStore,
    outputError,
    Logger,
    blobSegments
) {
    'use strict';

    window.FLUX.websockets = [];
    window.FLUX.websockets.list = function() {
        window.FLUX.websockets.forEach(function(conn, i) {
            console.log(i, conn.url);
        });
    };

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
            { dev } = window.FLUX,
            customHost = localStorage.getItem('host'),
            customPort = localStorage.getItem('port'),
            defaultCallback = function(result) {},
            defaultOptions = {
                hostname: customHost ? customHost : (dev ? '127.0.0.1' : 'localhost'),
                method: '',
                get port() {
                    return customPort ? customPort : dev ? '8000' : window.FLUX.ghostPort;
                },
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
                        message = trimMessage(['<', result.data].join(' ')),
                        errorStr = '',
                        skipError = false;

                    while(wsLog.log.length >= logLimit) {
                        wsLog.log.shift();
                    }
                    wsLog.log.push(message);

                    if ('string' === typeof data) {
                        data = data.replace(/\\/g, '\\\\');
                        data = data.replace(/\bNaN\b/g, 'null');
                        data = data.replace(/\r?\n|\r/g, ' ');
                    }

                    data = (true === isJson(data) ? JSON.parse(data) : data);

                    while(received_data.length >= logLimit) {
                        received_data.shift();
                    }
                    received_data.push(data);

                    switch (data.status) {
                    case 'error':
                        errorStr = data instanceof Object ? data.error : '';
                        skipError = false;

                        if (data instanceof Object && data.error instanceof Array) {
                            errorStr = data.error.join('_');
                        }

                        if (errorStr === 'NOT_EXIST_BAD_NODE') { skipError = true; }

                        if (window.FLUX.allowTracking && !skipError) {
                            window.Raven.captureException(data);
                            console.log('ws error', errorStr);
                        }
                        socketOptions.onError(data);
                        break;
                    case 'fatal':
                        errorStr = data instanceof Object ? data.error : '';
                        skipError = false;

                        if (data instanceof Object && data.error instanceof Array) {
                            errorStr = data.error.join('_');
                        }

                        if (errorStr === 'AUTH_ERROR') { skipError = true; }

                        // if identify error, reconnect again
                        if (errorStr === 'REMOTE_IDENTIFY_ERROR') {
                            setTimeout(() => {
                                ws = createWebSocket(options);
                            }, 1000);
                            return;
                        }

                        if (window.FLUX.allowTracking && !skipError) {
                            window.Raven.captureException(data);
                            console.log('ws fatal', errorStr);
                        }

                        socketOptions.onFatal(data);
                        break;
                    // ignore below status
                    case 'pong':
                        break;
                    case 'debug':
                        if(socketOptions.onDebug){
                            socketOptions.onDebug(data);
                        }
                        break;
                    default:
                        socketOptions.onMessage(data);
                        break;
                    }

                    hadConnected = true;
                };

                _ws.onclose = function(result) {
                    socketOptions.onClose(result);

                    var outputLog = function() {
                            outputError().done(onCancel);
                        },
                        onCancel = function() {
                            removeListener();
                            showProgramErrorPopup = true;
                        },
                        removeListener = function() {
                            AlertStore.removeCustomListener(outputLog);
                            AlertStore.removeCancelListener(onCancel);
                        };

                    // The connection was closed abnormally without sending or receving data
                    // ref: http://tools.ietf.org/html/rfc6455#section-7.4.1
                    if(result.code === 1006) {
                        wsLog.log.push(['**abnormal disconnection**'].join(' '));
                        socketOptions.onFatal(result);
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
            sender = function(data) {
                wsLog.log.push(trimMessage(['>', data, typeof data].join(' ')));

                if (true === data instanceof Blob) {
                    blobSegments(data, function(chunk) {
                        ws.send(chunk);
                    });
                }
                else {
                    ws.send(data);
                }
                keepAlive();
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

        const keepAlive = () => {
            clearInterval(this.timer);
            this.timer = setInterval(function() {
                if (null !== ws && readyState.OPEN === ws.readyState) {
                    sender('ping');
                }
            }, 60 * 1000 /* ms */);
        };

        keepAlive();

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
                    if (null === ws) {
                        ws = createWebSocket(socketOptions);
                    }

                    if (null === ws || readyState.OPEN !== ws.readyState) {
                        ws.onopen = function(e) {
                            socketOptions.onOpen(e);
                            sender(data);
                        };
                    }
                    else {
                        sender(data);
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

                setOptions: function(sockOpts) {
                    Object.assign(socketOptions, sockOpts);
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
                    socketOptions.onClose = callback;
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
