/**
 * nwjs menu factory
 */
define([
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
        parentIndex = {
            ABOUT  : 0,
            FILE   : 1,
            EDIT   : 2,
            VIEW   : 3,
            DEVICE : 4,
            WINDOW : 5,
            HELP   : 6
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
                label: lang.file.save_gcode,
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
            viewStandard: {
                label: lang.view.standard,
                enabled: true,
                onClick: emptyFunction,
                type: 'checkbox',
                checked: true,
                parent: parentIndex.VIEW
            },
            viewPreview: {
                label: lang.view.preview,
                enabled: false,
                onClick: emptyFunction,
                parent: parentIndex.VIEW
            },
            device: {
                label: lang.device.label,
                enabled: true,
                subItems: [newDevice, separator],
                parent: parentIndex.DEVICE
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
        doDiscover;

    function bindMap() {
        menuMap = [];

        menuMap.push({
            label: lang.flux.label,
            subItems: [
                // TODO: remove when it's going to production
                {
                    label: 'Reset',
                    enable: true,
                    onClick: function() {
                        initializeMachine.reset(function() {
                            location.reload();
                        });
                    }
                },
                {
                    label: lang.flux.about,
                    enabled: true,
                    onClick: emptyFunction
                },
                {
                    label: lang.flux.preferences,
                    enabled: true,
                    onClick: emptyFunction
                },
                separator,
                {
                    label: lang.flux.quit,
                    enabled: true,
                    onClick: function() {
                        if (true === window.confirm('Quit?')) {
                            gui.App.quit();
                        }
                    }
                }
            ]
        });

        if (true === initializeMachine.hasBeenCompleted()) {
            menuMap.push({
                label: lang.file.label,
                subItems: [
                    items.import,
                    items.recent,
                    separator,
                    items.execute,
                    items.saveGCode
                ]
            },
            {
                label: lang.edit.label,
                subItems: [
                    items.copy,
                    items.cut,
                    items.paste,
                    items.duplicate,
                    separator,
                    items.scale,
                    items.rotate,
                    separator,
                    items.clear
                ]
            },
            {
                label: lang.view.label,
                subItems: [
                    items.viewStandard,
                    items.viewPreview
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
                                                        GlobalActions.showMonitor(printer);
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
                                                AlertActions.showChangeFilament(printer);
                                            }
                                        },
                                        {
                                            label: lang.device.check_firmware_update,
                                            enabled: true,
                                            onClick: function() {
                                                checkFirmware(printer).done(function(response) {
                                                    if (true === response.needUpdate) {
                                                        AlertActions.showFirmwareUpdate(printer, response);
                                                    }
                                                });
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
                                    clearTimeout(deviceRefreshTimer);
                                }, 5000);
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
                    onClick: emptyFunction
                },
                {
                    label: lang.help.online_support,
                    enabled: true,
                    onClick: emptyFunction
                },
                {
                    label: lang.help.troubleshooting,
                    enabled: true,
                    onClick: emptyFunction
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