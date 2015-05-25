define(function($) {
    'use strict';

    var defaultOptions = {
            hostname: location.hostname,
            method: '',
            port: '8000',
            onMessage: function(result) {},
            onClose: function(result) {}
        },
        origanizeOptions = function(opts) {
            for (var name in defaultOptions) {
                if (false === opts.hasOwnProperty(name)) {
                    opts[name] = defaultOptions[name];
                }
            }

            return opts;
        };

    // options:
    //      hostname  - host name (Default: localhost)
    //      port      - what protocol uses (Default: 8000)
    //      method    - method be called
    //      onMessage - fired on receive message
    //      onClose   - fired on connection closed
    return function(options) {
        options = origanizeOptions(options);

        var url = 'ws://' + options.hostname + ':' + options.port + '/ws/' + options.method,
            ws = new WebSocket(url);

        ws.onmessage = function(result) {
            // TODO: logging
            options.onMessage(result);
        };

        ws.onclose = function(result) {
            // TODO: logging
            options.onClose(result);
            ws = null;  // release
        };

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

            close: function() {
                if (null !== ws) {
                    ws.close();
                }
            },

            // events
            onMessage: function(callback) {
                console.log('callback');
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