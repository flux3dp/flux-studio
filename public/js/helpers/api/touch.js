/**
 * API touch
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-touch
 */
define(['helpers/websocket'], function(Websocket) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onSuccess = opts.onSuccess || function() {};
        opts.onFail = opts.onFail || function() {};

        var ws = new Websocket({
                method: 'touch',
                autoReconnect: false,
                onMessage: function(data) {
                    var is_success = (
                            true === (data.has_response || false) &&
                            true === (data.reachable || false) &&
                            true === (data.auth || false)
                        );

                    if (true === is_success) {
                        opts.onSuccess(data);
                    }
                    else {
                        opts.onFail(data);
                    }

                    getResponse = true;
                    clearInterval(timer);
                },
                onError: opts.onError
            }),
            getResponse = true,
            timer;

        return {
            connection: ws,
            send: function(serial, password) {
                password = password || '';

                // var args = JSON.stringify({ serial: serial, password: password });
                var args = JSON.stringify({ uuid: serial, password: password });

                timer = setInterval(function() {
                    if (true === getResponse) {
                        getResponse = false;
                        ws.send(args);
                    }
                }, 0);
            }
        };
    };
});
