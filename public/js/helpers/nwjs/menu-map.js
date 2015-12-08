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
                modifiers: 'cmd'
            },
            recent: {
                label: lang.file.recent,
                enabled: true,
                onClick: emptyFunction
            },
            execute: {
                label: lang.file.execute,
                enabled: false,
                onClick: emptyFunction
            },
            saveGCode: {
                label: lang.file.save_gcode,
                enabled: false,
                onClick: emptyFunction,
                key: 's',
                modifiers: 'cmd'
            },
            copy: {
                label: lang.edit.copy,
                enabled: false,
                onClick: emptyFunction,
                key: 'c',
                modifiers: 'cmd'
            },
            cut: {
                label: lang.edit.cut,
                enabled: false,
                onClick: emptyFunction,
                key: 'x',
                modifiers: 'cmd'
            },
            paste: {
                label: lang.edit.paste,
                enabled: false,
                onClick: emptyFunction,
                key: 'v',
                modifiers: 'cmd'
            },
            duplicate: {
                label: lang.edit.duplicate,
                enabled: false,
                onClick: emptyFunction,
                key: 'd',
                modifiers: 'cmd'
            },
            scale: {
                label: lang.edit.scale,
                enabled: false,
                onClick: emptyFunction,
                key: 's',
                modifiers: 'cmd+alt'
            },
            rotate: {
                label: lang.edit.rotate,
                enabled: false,
                onClick: emptyFunction,
                key: 'r',
                modifiers: 'cmd+alt'
            },
            clear: {
                label: lang.edit.clear,
                enabled: false,
                onClick: emptyFunction,
                key: 'x',
                modifiers: 'cmd+shift'
            },
            viewStandard: {
                label: lang.view.standard,
                enabled: true,
                onClick: emptyFunction,
                type: 'checkbox',
                checked: true
            },
            viewPreview: {
                label: lang.view.preview,
                enabled: false,
                onClick: emptyFunction
            },
            newDevice: newDevice,
            device: {
                label: lang.device.label,
                enabled: true,
                subItems: [newDevice, separator]
            }
        };

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
                        config().write('printer-is-ready', false, {
                            onFinished: function() {
                                location.reload();
                            }
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

        if ('true' === config().read('printer-is-ready')) {
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
                var deviceGroup = [
                        newDevice,
                        separator
                    ],
                    deviceRefreshTimer;

                discover(
                    'menu-map',
                    function(printers) {
                        deviceGroup = [
                            newDevice,
                            separator
                        ];

                        printers.forEach(function(printer) {
                            deviceGroup.push({
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
                                        // TODO: go to change filament
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
                                }]
                            });
                        });

                        if ('undefined' === typeof deviceRefreshTimer) {
                            clearTimeout(deviceRefreshTimer);
                            setTimeout(function() {
                                items.device.subItems = deviceGroup;
                                clearTimeout(deviceRefreshTimer);
                            }, 10000);
                        }
                    }
                );
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
        all: menuMap,
        items: items,
        refresh: bindMap
    };

});