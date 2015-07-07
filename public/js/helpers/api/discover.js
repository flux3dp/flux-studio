/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
define([
    'helpers/websocket',
    'helpers/array-findindex'
], function(Websocket) {
    'use strict';

    return function(getPrinters) {
        getPrinters = getPrinters || function() {};

        var ws = new Websocket({
                method: 'discover',
                autoReconnect: false,
                onMessage: function(result) {
                    var data = JSON.parse(result.data),
                        someFn = function(el) {
                            return el.serial === data.serial;
                        },
                        findIndex = function(el) {
                            return el.serial === data.serial;
                        },
                        existing_key = printers.findIndex(findIndex);

                    if (false === printers.some(someFn)) {
                        printers.push(data);
                    }

                    if (false === data.alive && -1 < existing_key) {
                        // delete it from printers
                        printers.splice(existing_key, 1);
                    }
                }
            }),
            printers = [];

        Array.observe(printers, function(changes) {
            getPrinters(printers);
        });

        return {
            connection: ws,
            sendAggressive: function() {
                ws.send('aggressive');
            }
        };
    };
});