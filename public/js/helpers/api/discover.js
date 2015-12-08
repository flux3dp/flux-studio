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
        printers = [],
        dispatchers = [],
        idList = [],
        sendFoundPrinter = function() {
            dispatchers.forEach(function(dispatcher) {
                dispatcher.sender(printers);
            });
        };

    return function(id, getPrinters) {
        getPrinters = getPrinters || function() {};

        if (-1 === idList.indexOf(id)) {
            idList.push(id);
            dispatchers.push({
                id: id,
                sender: getPrinters
            });
        }

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
            sendFoundPrinter();
        });

        if (0 < printers.length) {
            sendFoundPrinter();
        }

        return {
            connection: ws,
            removeListener: function(id) {
                var index = idList.indexOf(id);

                idList = idList.splice(index, 1);
                dispatchers = dispatchers.splice(index, 1);
            },
            sendAggressive: function() {
                ws.send('aggressive');
            }
        };
    };
});