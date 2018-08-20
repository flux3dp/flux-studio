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
    'helpers/smart-upnp',
    'helpers/api/cloud'
], function(
    Websocket,
    initializeMachine,
    Config,
    DeviceList,
    Logger,
    SmartUpnp,
    CloudApi) {
    'use strict';

    var ws = ws || new Websocket({
            method: 'discover'
        }),
        discoverLogger = new Logger('discover'),
        printers = [],
        dispatchers = [],
        idList = [],
        _devices = {},
        existDefaultPrinter = initializeMachine.defaultPrinter.exist(),
        defaultPrinter = initializeMachine.defaultPrinter.get(),
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
                // console.log(device);
                if(device.source === 'h2h') {
                    device.h2h_uuid = device.uuid;
                    device.uuid = device.addr.toString();
                }
                // console.log(device);
                _devices[device.uuid] = device;

                //SmartUpnp.addSolidIP(device.ip);
            }
            else {
                if(typeof _devices[device.uuid] === 'undefined') {
                    delete _devices[device.uuid];
                }
            }

        //    if (existDefaultPrinter && device.uuid === defaultPrinter.uuid ) {
        //        initializeMachine.defaultPrinter.set(device);
        //    }

            clearTimeout(timer);
            timer = setTimeout(() => {
                printers = DeviceList(_devices);
                sendFoundPrinter();
            }, BUFFER);
        },
        poke = function(targetIP) {
            if (targetIP == null) { return; };
            printers = [];
            _devices = {};
            ws.send(JSON.stringify({ 'cmd' : 'poke', 'ipaddr': targetIP }));
        },
        BUFFER = 100,
        pokeIPs = Config().read('poke-ip-addr').split(';'),
        timer;

    if ('' === pokeIPs[0]) {
        Config().write('poke-ip-addr', '192.168.1.1');
        pokeIPs = ['192.168.1.1'];
    }

    ws.onMessage(onMessage);

    var self = function(id, getPrinters) {
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
            poke: poke,
            countDevices: function(){
                let count = 0;
                for(var i in _devices) count++;
                return count;
            },
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

    SmartUpnp.init(self());
    for(var i in pokeIPs){
        SmartUpnp.startPoke(pokeIPs[i]);
    }

    // CloudApi.getDevices().then(resp => {
    //     if (resp.ok) {
    //         resp.json().then(content => {
    //             if (content.devices) {
    //                 content.devices.map(device => {
    //                     console.log(device.alias, device.ip_addr);
    //                     if (device.ip_addr) {
    //                         // console.log("Start poking cloud device IP:", device.ip_addr);
    //                         SmartUpnp.startPoke(device.ip_addr.trim().replace(/\u0000/g, ''));
    //                     }
    //                 });
    //             }
    //         });
    //     }
    // });

    return self;
});
