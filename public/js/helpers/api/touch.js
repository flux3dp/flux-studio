/**
 * API touch
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-touch
 */
define(['helpers/websocket'], function(Websocket) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onSuccess = opts.onSuccess || function() {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: 'touch',
                autoReconnect: false,
                onMessage: function(result) {
                    var data = JSON.parse(result.data),
                        is_success = (
                            true === data.has_response || false &&
                            true === data.reachable || false &&
                            true === data.auth || false
                        );

                    if (true === is_success) {
                        opts.onSuccess(data);
                    }
                    else {
                        opts.onError(data);
                    }

                    getResponse = true;
                }
            }),
            getResponse = false,
            timer;

        return {
            ws: ws,
            send: function(serial, password) {
                password = password || '';

                var args = JSON.stringify({ serial: serial, password: password });

                if (true === getResponse) {
                    ws.send(args);
                }
                else {
                    timer = setInterval(function() {
                        ws.send(args);
                    }, 0);
                }
            }
        };
    };
});