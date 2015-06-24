/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
define(['helpers/websocket'], function(Websocket) {
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
                        };

                    if (false === printers.some(someFn)) {
                        printers.push(data);
                    }
                }
            }),
            printers = [];

        Array.observe(printers, function(changes) {
            getPrinters(printers);
        });

        return {
            ws: ws,
            sendAggressive: function() {
                ws.send('aggressive');
            }
        };
    };
});