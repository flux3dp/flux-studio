define(function($) {
    'use strict';

    // options:
    //      hostname      - host name (Default: localhost)
    //      port          - what protocol uses (Default: 8000)
    //      method        - method be called
    //      autoReconnect - auto reconnect on close
    //      onMessage     - fired on receive message
    //      onClose       - fired on connection closed
    return function(options) {

        var defaultOptions = {
                hostname: location.hostname,
                method: '',
                port: '8000',
                autoReconnect: true,
                onMessage: function(result) {},
                onClose: function(result) {}
            },
            received_data = [],
            origanizeOptions = function(opts) {
                for (var name in defaultOptions) {
                    if (false === opts.hasOwnProperty(name)) {
                        opts[name] = defaultOptions[name];
                    }
                }

                return opts;
            },
            createWebSocket = function(options) {
                var url = 'ws://' + options.hostname + ':' + options.port + '/ws/' + options.method,
                    _ws = new WebSocket(url);

                _ws.onmessage = function(result) {
                    // TODO: logging
                    received_data.push(result.data);
                    options.onMessage(result);
                };

                _ws.onclose = function(result) {
                    // TODO: logging
                    options.onClose(result);
                    console.log('close');

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
            ws = null;

        options = origanizeOptions(options);
        ws = createWebSocket(options);

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

            close: function() {
                if (null !== ws) {
                    ws.close();
                }
            },

            // events
            onMessage: function(callback) {
                options.onMessage = callback;

                return this;
            },

            onClose: function(callback) {
                options.onclose = callback;

                return this;
            }
        };
    };
});