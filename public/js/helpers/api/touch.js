/**
 * API touch
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-touch
 */
define([
    'helpers/websocket',
    'helpers/local-storage',
    // non-return
    'lib/jsencrypt'
], function(
    Websocket,
    localStorage
) {
    'use strict';

    return function(opts) {
        var events = {
                onSuccess: opts.onSuccess || function() {},
                onFail: opts.onFail || function() {},
                onError: opts.onError || function() {}
            },
            ws = new Websocket({
                method: 'touch',
                autoReconnect: false,
                onMessage: function(data) {
                    var is_success = (
                            true === (data.has_response || false) &&
                            true === (data.reachable || false) &&
                            true === (data.auth || false)
                        );

                    if (true === is_success) {
                        events.onSuccess(data);
                    }
                    else {
                        events.onFail(data);
                    }

                },
                onError: events.onError
            });

        return {
            connection: ws,
            send: function(uuid, password) {
                password = password || '';

                var rsaCipher = new JSEncrypt({ default_key_size: 1024 }),
                    rsaKey = localStorage.get('flux-rsa-key') || rsaCipher.getPrivateKey(),
                    args = JSON.stringify({ uuid: uuid, password: password, key: rsaKey });

                localStorage.set('flux-rsa-key', rsaKey);

                ws.send(args);
            }
        };
    };
});
