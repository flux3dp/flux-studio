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
                port: location.port || '8000',
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

                    // TODO: logging
                    received_data.push(result.data);

                    if ('error' === data.status) {
                        options.onError(data);
                    }
                    else if ('fatal' === data.status) {
                        options.onFatal(data);
                    }
                    else {
                        options.onMessage(data);
                    }
                };

                _ws.onclose = function(result) {
                    // TODO: logging
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
            socketOptions = origanizeOptions(options);

        ws = createWebSocket(socketOptions);

        return {
            send: function(data) {
                var wait = 0,
                    retry_times = 1000,
                    timer = setInterval(function() {
                        // waiting for connected
                        retry_times--;

                        try {
                            if (1 === ws.readyState) {
                                ws.send(data);

                                // reset timer
                                retry_times = 0;
                            }
                        }
                        catch (ex) {
                            // TODO: logging
                        }

                        if (retry_times <= 0) {
                            clearInterval(timer);
                        }

                        wait = 100;

                    }, wait);

                return this;
            },

            fetchData: function() {
                return received_data;
            },

            fetchLastResponse: function() {
                return this.fetchData()[received_data.length - 1];
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
