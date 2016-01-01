/**
 * nwjs menu factory
 */
define([
    'jquery',
    'helpers/nwjs/gui',
    'helpers/i18n',
    'helpers/check-firmware',
    'helpers/api/config',
    'helpers/api/discover',
    'app/actions/alert-actions',
    'app/actions/initialize-machine',
    'app/actions/global-actions',
    'helpers/device-master',
    'app/constants/device-constants'
], function(
    $,
    gui,
    i18n,
    checkFirmware,
    config,
    discover,
    AlertActions,
    initializeMachine,
    GlobalActions,
    DeviceMaster,
    DeviceConstants
) {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        separator = {
            label: '',
            type: 'separator'
        },
        lang = i18n.get().topmenu,
        menuMap = [],
        windowIndex = ('win' === window.FLUX.osType ? 1 : 0),
        parentIndex = {
            ABOUT  : 0 - windowIndex,
            FILE   : 1 - windowIndex,
            EDIT   : 2 - windowIndex,
            DEVICE : 3 - windowIndex,
            WINDOW : 4 - windowIndex,
            HELP   : 5 - windowIndex
        },
        newDevice = {
            label: lang.device.new,
            enabled: true,
            onClick: function() {
                location.hash = '#initialize/wifi/connect-machine';
            },
            key: 'n',
            modifiers: 'cmd'
        },
        items = {
            import: {
                label: lang.file.import,
                enabled: true,
                onClick: emptyFunction,
                key: 'i',
                modifiers: 'cmd',
                parent: parentIndex.FILE
            },
            recent: {
                label: lang.file.recent,
                enabled: true,
                onClick: emptyFunction,
                parent: parentIndex.FILE
            },
            execute: {
                label: lang.file.execute,
                enabled: false,
                onClick: emptyFunction,
                parent: parentIndex.FILE
            },
            saveGCode: {
                label: lang.file.save_fcode,
                enabled: false,
                onClick: emptyFunction,
                key: 's',
                modifiers: 'cmd',
                parent: parentIndex.FILE
            },
            copy: {
                label: lang.edit.copy,
                enabled: false,
                onClick: emptyFunction,
                key: 'c',
                modifiers: 'cmd',
                parent: parentIndex.EDIT
            },
            cut: {
                label: lang.edit.cut,
                enabled: false,
                onClick: emptyFunction,
                key: 'x',
                modifiers: 'cmd',
                parent: parentIndex.EDIT
            },
            paste: {
                label: lang.edit.paste,
                enabled: false,
                onClick: emptyFunction,
                key: 'v',
                modifiers: 'cmd',
                parent: parentIndex.EDIT
            },
            duplicate: {
                label: lang.edit.duplicate,
                enabled: false,
                onClick: emptyFunction,
                key: 'd',
                modifiers: 'cmd',
                parent: parentIndex.EDIT
            },
            scale: {
                label: lang.edit.scale,
                enabled: false,
                onClick: emptyFunction,
                key: 's',
                modifiers: 'cmd+alt',
                parent: parentIndex.EDIT
            },
            rotate: {
                label: lang.edit.rotate,
                enabled: false,
                onClick: emptyFunction,
                key: 'r',
                modifiers: 'cmd+alt',
                parent: parentIndex.EDIT
            },
            clear: {
                label: lang.edit.clear,
                enabled: false,
                onClick: emptyFunction,
                key: 'x',
                modifiers: 'cmd+shift',
                parent: parentIndex.EDIT
            },
            device: {
                label: lang.device.label,
                enabled: true,
                subItems: [newDevice, separator],
                parent: parentIndex.DEVICE
            },
            tutorial: {
                label: lang.help.tutorial,
                enabled: true,
                parent: parentIndex.HELP
            }
        },
        deviceGroup = [
            newDevice,
            separator
        ],
        renew = false,
        deviceExists = function(basePrinter) {
            return function(_printer) {
                return _printer.uuid === basePrinter.uuid;
            };
        },
        defaultDevice = initializeMachine.defaultPrinter.get(),
        defaultDeviceChange = function() {},
        deviceRefreshTimer,
        doDiscover,
        aboutSubItems = [{
            label: lang.flux.about,
            enabled: true,
            onClick: function() {
                $.ajax({
                    url: 'package.json',
                    dataType: 'json'
                }).done(function(response) {
                    alert(lang.version + ':' + response.version);
                });
            }
        },
        {
            label: lang.flux.preferences,
            enabled: true,
            onClick: function() {
                location.hash = '#studio/settings';
            }
        },
        separator,
        {
            label: lang.flux.quit,
            enabled: true,
            key: 'q',
            modifiers: 'cmd',
            onClick: function() {
                if (true === window.confirm(lang.sure_to_quit)) {
                    gui.App.quit();
                }
            }
        }],
        subItems;

    function bindMap() {
        menuMap = [];
        console.log("refresh menu..")

        if ('win' !== window.FLUX.osType) {
            menuMap.push({
                label: lang.flux.label,
                subItems: aboutSubItems
            });
        }

        if (true === initializeMachine.hasBeenCompleted()) {
            subItems = [
                items.import,
                separator,
                items.saveGCode
            ];

            if ('win' === window.FLUX.osType) {
                subItems = subItems.concat(aboutSubItems);
            }

            menuMap.push({
                label: lang.file.label,
                subItems: subItems
            },
            {
                label: lang.edit.label,
                subItems: [
                    items.duplicate,
                    separator,
                    items.clear
                ]
            },
            items.device,
            {
                label: lang.window.label,
                subItems: [
                    {
                        label: lang.window.minimize,
                        enabled: true,
                        onClick: function() {
                            gui.Window.get().minimize();
                        },
                        key: 'm',
                        modifiers: 'cmd'
                    },
                    {
                        label: lang.window.fullscreen,
                        enabled: true,
                        onClick: function() {
                            gui.Window.get().maximize();
                        }
                    }
                ]
            });

            if ('undefined' !== typeof requireNode) {
                deviceGroup = [
                    newDevice,
                    separator
                ];
                renew = false;
                deviceExists = function(basePrinter) {
                    return function(_printer) {
                        return _printer.uuid === basePrinter.uuid;
                    };
                };
                defaultDevice = initializeMachine.defaultPrinter.get();

                doDiscover = function() {
                    var timeout_device_update = 5000;
                    discover(
                        'menu-map',
                        function(printers) {
                            printers.forEach(function(printer) {
                                renew = deviceGroup.some(deviceExists(printer));
                                if (false === renew) {
                                    deviceGroup.push({
                                        isPrinter: true,
                                        uuid: printer.uuid,
                                        label: printer.name,
                                        enabled: true,
                                        subItems: [{
                                            label: lang.device.device_monitor,
                                            enabled: true,
                                            onClick: function() {
                                                DeviceMaster.selectDevice(printer).then(function(status) {
                                                    if(status === DeviceConstants.CONNECTED) {
                                                        setTimeout(
                                                            function(){GlobalActions.showMonitor(printer)},
                                                            100);
                                                    }
                                                    else if (status === DeviceConstants.TIMEOUT) {
                                                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                                    }
                                                });
                                            }
                                        },
                                        {
                                            label: lang.device.change_filament,
                                            enabled: true,
                                            onClick: function() {
                                                setTimeout(
                                                    function(){AlertActions.showChangeFilament(printer);},
                                                    100);
                                            }
                                        },
                                        {
                                            label: lang.device.default_device,
                                            enabled: true,
                                            type: 'checkbox',
                                            onClick: function() {
                                                console.log(this.checked, printer);
                                                if (false === this.checked) {
                                                    initializeMachine.defaultPrinter.clear();
                                                }
                                                else {
                                                    initializeMachine.defaultPrinter.set(printer);
                                                }

                                                defaultDeviceChange(this, printer);
                                            },
                                            parent: parentIndex.DEVICE,
                                            checked: (defaultDevice.uuid === printer.uuid)
                                        }]
                                    });
                                }
                            });
                            if ('undefined' === typeof deviceRefreshTimer && true === renew) {
                                clearTimeout(deviceRefreshTimer);
                                deviceRefreshTimer = setTimeout(function() {
                                    items.device.subItems = deviceGroup;
                                    if('win' === window.FLUX.osType && window.FLUX.refreshMenu){
                                        window.FLUX.refreshMenu(menuMap);
                                    }
                                    deviceRefreshTimer = undefined;
                                    timeout_device_update = timeout_device_update + 15000;
                                    console.log('update device menu');
                                    clearTimeout(deviceRefreshTimer);
                                }, timeout_device_update);
                                console.log(timeout_device_update);
                            }
                        }
                    );
                };

                doDiscover();
            }
        }

        menuMap.push({
            label: lang.help.label,
            subItems: [
                {
                    label: lang.help.starting_guide,
                    enabled: true,
                    onClick: function() {
                        if ('undefined' !== typeof requireNode) {
                            requireNode('nw.gui').Shell.openExternal('http://flux3dp.com/starting-guide');
                        }
                        else {
                            window.open('http://flux3dp.com/starting-guide');
                        }
                    }
                },
                items.tutorial,
                {
                    label: lang.help.online_support,
                    enabled: true,
                    onClick: function() {
                        if ('undefined' !== typeof requireNode) {
                            requireNode('nw.gui').Shell.openExternal('http://flux3dp.com/support');
                        }
                        else {
                            window.open('http://flux3dp.com/support');
                        }
                    }
                }
            ]
        });

        return menuMap;
    }

    menuMap = bindMap();

    return {
        parentIndex: parentIndex,
        all: menuMap,
        items: items,
        refresh: bindMap,
        onDefaultDeviceChange: function(func) {
            defaultDeviceChange = func || function() {};
        }
    };

});
