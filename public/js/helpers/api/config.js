/**
 * API config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-config
 */
define([
    'helpers/websocket',
    'helpers/local-storage'
], function(Websocket, _localStorage) {
    'use strict';

    return function() {
        var stardardOptions = function(opts) {
            opts = opts || {};
            opts.onFinished = opts.onFinished || function() {};

            return opts;
        };

        return {
            connection: {},
            write: function(key, value, opts) {
                opts = stardardOptions(opts);

                _localStorage.set(key, value);
                opts.onFinished();

                return this;
            },
            read: function(key, opts) {
                var value = _localStorage.get(key);

                opts = stardardOptions(opts);

                opts.onFinished(value);

                return value;
            },

            update: function(key, item_key, item_value) {
                let configs = this.read(key);
                if(configs === '') configs = {};
                configs[item_key] = item_value;
                this.write(key, configs);
            }
        };

    };
});
