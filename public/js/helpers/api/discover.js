/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
define([
    'helpers/websocket',
    'app/actions/initialize-machine',
    'helpers/api/config',
    'helpers/device-list',
    'helpers/array-findindex',
], function(Websocket, initializeMachine, config, DeviceList) {
    'use strict';

    var ws = ws || new Websocket({
            method: 'discover'
        }),
        printers = [],
        discoveredPrinters = [],
        dispatchers = [],
        idList = [],
        _printers = {},
        sendFoundPrinter = function() {
            dispatchers.forEach(function(dispatcher) {
                dispatcher.sender(_printers);
            });
        },
        findIndex = function(base, target) {
            return base.uuid === target.uuid;
        },
        onMessage = function(data) {
            discoveredPrinters.push(data);

            // throttle for result
            clearTimeout(timer);
            timer = setTimeout(function() {
                discoveredPrinters.map((p) => {
                    if(!_printers[p.serial]) {
                       _printers[p.serial] = {};
                   }
                   Object.assign(_printers[p.serial], p);

                   if (true === initializeMachine.defaultPrinter.exist() &&
                       p.uuid === initializeMachine.defaultPrinter.get().uuid
                   ) {
                       initializeMachine.defaultPrinter.set(p);
                   }
                });

                // convert device list object to array
                printers = DeviceList(_printers);
                discoveredPrinters.length = 0;
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

        // force callback always executed after return
        setTimeout(function() {
            if (0 < printers.length) {
                getPrinters(printers);
            }
        }, 0);

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
                return _printers[printer.serial];
            }
        };
    };
});
