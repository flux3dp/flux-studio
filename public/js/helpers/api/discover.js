/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
define([
    'helpers/websocket',
    'app/actions/initialize-machine',
    'helpers/api/config',
    'helpers/device-list',
    'helpers/logger',
    // no return
    'helpers/array-findindex'
], function(Websocket, initializeMachine, config, DeviceList, Logger) {
    'use strict';

    var ws = ws || new Websocket({
            method: 'discover'
        }),
        discoverLogger = new Logger('discover'),
        printers = [],
        dispatchers = [],
        idList = [],
        _devices = {},
        sendFoundPrinter = function() {
            discoverLogger.clear().append(_devices);

            dispatchers.forEach(function(dispatcher) {
                dispatcher.sender(_devices);
            });
        },
        findIndex = function(base, target) {
            return base.uuid === target.uuid;
        },
        onMessage = function(device) {
            if (device.alive) {
                _devices[device.uuid] = device;
            }
            else {
                if(typeof _devices[device.uuid] === 'undefined') {
                    delete _devices[device.uuid];
                }
            }

            if (true === initializeMachine.defaultPrinter.exist() &&
                device.uuid === initializeMachine.defaultPrinter.get().uuid
            ) {
                initializeMachine.defaultPrinter.set(device);
            }

            clearTimeout(timer);
            timer = setTimeout(() => {
                printers = DeviceList(_devices);
                sendFoundPrinter();
            }, BUFFER);
        },
        BUFFER = 100,
        pokeIP = config().read('poke-ip-addr'),
        timer;

    if ('' === pokeIP) {
        config().write('poke-ip-addr', '192.168.1.1');
    }

    ws.onMessage(onMessage);

    setInterval(function() {
        if ('string' === typeof pokeIP && '' !== pokeIP) {
            ws.send(JSON.stringify({ 'cmd' : 'poke', 'ipaddr': pokeIP }));
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
                return _devices[printer.uuid];
            }
        };
    };
});
