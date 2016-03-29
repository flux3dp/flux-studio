/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
define([
    'helpers/websocket',
    'app/actions/initialize-machine',
    'helpers/api/config',
    'helpers/array-findindex',
    'helpers/object-assign'
], function(Websocket, initializeMachine, config) {
    'use strict';

    var ws = ws || new Websocket({
            method: 'discover'
        }),
        printers = [],
        dispatchers = [],
        idList = [],
        sendFoundPrinter = function() {
            dispatchers.forEach(function(dispatcher) {
                dispatcher.sender(printers);
            });
        },
        findIndex = function(base, target) {
            return base.uuid === target.uuid;
        },
        onMessage = function(data) {
            var existing_key = printers.findIndex(findIndex.bind(null, data));

            if (-1 === existing_key) {
                if (typeof data === 'string') {
                    data = data.replace(/NaN/g, null);
                    data = JSON.parse(data);
                }

                data.isNew = true;
                printers.push(data);
                existing_key = printers.length - 1;
            }
            else {
                printers[existing_key].isNew = false;

                // if existing. update attributes
                for (var key in data) {
                    if (true === data.hasOwnProperty(key)) {
                        printers[existing_key][key] = data[key];
                    }
                }
            }

            // update default device info
            if (true === initializeMachine.defaultPrinter.isExisting() &&
                data.uuid === initializeMachine.defaultPrinter.get().uuid
            ) {
                initializeMachine.defaultPrinter.set(printers[existing_key]);
            }

            if (false === data.alive && -1 < existing_key) {
                // delete it from printers
                printers.splice(existing_key, 1);
            }

            // set a sleep
            clearTimeout(timer);
            timer = setTimeout(function() {
                sendFoundPrinter();
            }, BUFFER);
        },
        BUFFER = 100,
        pokeIP,
        timer;

    ws.onMessage(onMessage);

    setInterval(function() {
        pokeIP = config().read('poke-ip-addr');

        if ('string' === typeof pokeIP && '' !== pokeIP) {
            ws.send(JSON.stringify({ "cmd" : "poke", "ipaddr": pokeIP }));
        }
    }, 3000);

    return function(id, getPrinters) {
        getPrinters = getPrinters || function() {};

        var index = idList.indexOf(id);

        if (0 === idList.length || -1 === index) {
            idList.push(id);
            dispatchers.push({
                id: id,
                sender: getPrinters
            });
        }
        else {
            dispatchers[index] = {
                id: id,
                sender: getPrinters
            };
        }

        if (0 < printers.length) {
            getPrinters(printers);
        }

        return {
            connection: ws,
            removeListener: function(_id) {
                var _index = idList.indexOf(_id);

                idList.splice(_index, 1);
                dispatchers.splice(_index, 1);
            },
            sendAggressive: function() {
                ws.send('aggressive');
            },
            getLatestPrinter: function(printer) {
                var existing_key = printers.findIndex(findIndex.bind(null, printer));

                if (-1 === existing_key) {
                    return null;
                }
                else {
                    return printers[existing_key];
                }
            }
        };
    };
});
