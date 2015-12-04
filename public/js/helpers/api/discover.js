/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
define([
    'helpers/websocket',
    'helpers/array-findindex'
], function(Websocket) {
    'use strict';

    var ws,
        printers = [];

    return function(getPrinters) {
        getPrinters = getPrinters || function() {};

        var onMessage = function(data) {
            var someFn = function(el) {
                    return el.uuid === data.uuid;
                },
                findIndex = function(el) {
                    return el.uuid === data.uuid;
                },
                existing_key = printers.findIndex(findIndex);

            if (false === printers.some(someFn)) {
                printers.push(data);
            }
            else {
                // if existing. update attributes
                for (var key in data) {
                    if (true === data.hasOwnProperty(key)) {
                        printers[existing_key][key] = data[key];
                    }
                }
            }

            if (false === data.alive && -1 < existing_key) {
                // delete it from printers
                printers.splice(existing_key, 1);
            }
        };

        if ('undefined' === typeof ws) {
            ws = new Websocket({
                method: 'discover'
            });
        }

        ws.onMessage(onMessage);

        Array.observe(printers, function(changes) {
            getPrinters(printers);
        });

        if (0 < printers.length) {
            getPrinters(printers);
        }

        return {
            connection: ws,
            sendAggressive: function() {
                ws.send('aggressive');
            }
        };
    };
});