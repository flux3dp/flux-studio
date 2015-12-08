define(['helpers/is-json'], function(isJson) {
    'use strict';

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

        var defaultCallback = function(result) {},
            defaultOptions = {
                hostname: location.hostname,
                method: '',
                port: window.FLUX.ghostPort,
                autoReconnect: true,
                onMessage: defaultCallback,
                onError: defaultCallback,
                onFatal: defaultCallback,
                onClose: defaultCallback,
                onOpen: defaultCallback
            },
            received_data = [],
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
                    options.onOpen(e);
                };

                _ws.onmessage = function(result) {
                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data);

                    received_data.push(result.data);

                    if ('error' === data.status) {
                        options.onError(data);
                    }
                    else if ('fatal' === data.status) {
                        options.onFatal(data);
                    }
                    else if ('pong' === data.status) {
                        // it's a heartbeat response. ignore it.
                    }
                    else {
                        options.onMessage(data);
                    }
                };

                _ws.onclose = function(result) {
                    options.onClose(result);

                    if (true === options.autoReconnect) {
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
                ws.send('ping');
            }
        }, 60000);

        return {
            readyState: readyState,

            send: function(data) {
                var self = this;

                if (null === ws) {
                    ws = createWebSocket(socketOptions);
                }

                if (null === ws || readyState.OPEN !== ws.readyState) {
                    ws.onopen = function() {
                        ws.send(data);
                    };
                }
                else {
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
    };
});
