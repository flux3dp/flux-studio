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
    'app/constants/device-constants',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'html2canvas',
    'plugins/file-saver/file-saver.min'
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
    DeviceConstants,
    InputLightboxActions,
    InputLightboxConstants,
    ProgressActions,
    ProgressConstants,
    html2canvas,
    fileSaver
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
            reset: {
                label: lang.edit.reset,
                enabled: false,
                onClick: emptyFunction,
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
        subItems,
        timeout_device_update = 5000;

    function bindMap() {
        menuMap = [];

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
                    items.scale,
                    items.rotate,
                    items.reset,
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
                    discover(
                        'menu-map',
                        function(printers) {
                            printers.forEach(function(printer) {
                                renew = deviceGroup.some(deviceExists(printer));

                                // if it's a new device by discover then append to list
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
                                                DeviceMaster.selectDevice(printer).then(function(status) {
                                                    if(status === DeviceConstants.CONNECTED) {
                                                        AlertActions.showChangeFilament(printer);
                                                    }
                                                    else if (status === DeviceConstants.TIMEOUT) {
                                                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                                    }
                                                });
                                            }
                                        },
                                        {
                                            label: lang.device.check_firmware_update,
                                            enabled: true,
                                            onClick: function() {
                                                checkFirmware(printer).done(function(response) {
                                                    var lang = i18n.get(),
                                                        onSubmit = function(files, e) {
                                                            var file = files.item(0),
                                                                onFinishUpdate = function(isSuccess) {
                                                                    ProgressActions.close();

                                                                    if (true === isSuccess) {
                                                                        AlertActions.showPopupInfo(
                                                                            'firmware-update-success',
                                                                            lang.update.firmware.update_success
                                                                        );
                                                                    }
                                                                    else {
                                                                        AlertActions.showPopupError(
                                                                            'firmware-update-fail',
                                                                            lang.update.firmware.update_fail
                                                                        );
                                                                    }
                                                                };

                                                            ProgressActions.open(ProgressConstants.NONSTOP);
                                                            DeviceMaster.selectDevice(printer).then(function(status) {
                                                                if (status === DeviceConstants.CONNECTED) {
                                                                    DeviceMaster.updateFirmware(file).
                                                                        done(onFinishUpdate.bind(null, true)).
                                                                        fail(onFinishUpdate.bind(null, false));
                                                                }
                                                                else if (status === DeviceConstants.TIMEOUT) {
                                                                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                                                }
                                                            });
                                                        },
                                                        onInstall = function() {
                                                            InputLightboxActions.open(
                                                                'upload-firmware',
                                                                {
                                                                    type: InputLightboxConstants.TYPE_FILE,
                                                                    inputHeader: lang.update.firmware.upload_file,
                                                                    onSubmit: onSubmit,
                                                                    confirmText: lang.update.firmware.confirm
                                                                }
                                                            );
                                                        };

                                                    if (true === response.needUpdate) {
                                                        AlertActions.showUpdate(
                                                            printer,
                                                            'firmware',
                                                            response,
                                                            onInstall
                                                        );
                                                    }
                                                    else {
                                                        AlertActions.showPopupInfo(
                                                            'latest-firmware',
                                                            lang.update.firmware.latest_firmware.message,
                                                            lang.update.firmware.latest_firmware.caption
                                                        );
                                                    }
                                                });
                                            }
                                        },
                                        {
                                            label: lang.device.default_device,
                                            enabled: true,
                                            type: 'checkbox',
                                            onClick: function() {
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
                                    if ('win' === window.FLUX.osType && window.FLUX.refreshMenu) {
                                        window.FLUX.refreshMenu(menuMap);
                                    }

                                    deviceRefreshTimer = undefined;

                                    if (deviceGroup.length > 2) {
                                        timeout_device_update += 240000;
                                    }

                                    timeout_device_update = timeout_device_update + 15000;
                                    clearTimeout(deviceRefreshTimer);
                                }, timeout_device_update);
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
                    label: lang.help.help_center,
                    enabled: true,
                    onClick: function() {
                        if ('undefined' !== typeof requireNode) {
                            requireNode('nw.gui').Shell.openExternal('https://helpcenter.flux3dp.com/');
                        }
                        else {
                            window.open('https://helpcenter.flux3dp.com/');
                        }
                    }
                },
                {
                    label: lang.help.contact,
                    enabled: true,
                    onClick: function() {
                        if ('undefined' !== typeof requireNode) {
                            requireNode('nw.gui').Shell.openExternal('http://flux3dp.com/contact');
                        }
                        else {
                            window.open('http://flux3dp.com/contact');
                        }
                    }
                },
                items.tutorial,
                {
                    label: lang.help.forum,
                    enabled: true,
                    onClick: function() {
                        if ('undefined' !== typeof requireNode) {
                            requireNode('nw.gui').Shell.openExternal('http://forum.flux3dp.com');
                        }
                        else {
                            window.open('http://forum.flux3dp.com');
                        }
                    }
                },
                {
                    label: lang.help.debug,
                    enabled: true,
                    onClick: function(){
                        window.html2canvas = html2canvas;
                        function obfuse(str){
                            var output = [];
                            for (var i in str) {
                                var c = {'f':'x','l':'u','u':'l','x':'f'}[str[i]];
                                output.push(c?c:str[i]);
                            }
                            return output.join("");
                        }
                        html2canvas(window.document.body).then(function(canvas) {
                            for(var i in window.FLUX.websockets){
                                if("function" !== typeof window.FLUX.websockets[i]){
                                    window.FLUX.websockets[i].optimizeLogs();
                                }
                            }
                            var jpegUrl = canvas.toDataURL("image/jpeg"),
                                report_info = JSON.stringify({ws: window.FLUX.websockets, screenshot: jpegUrl}, null, 2);
                            if(!window.FLUX.debug) report_info = obfuse(btoa(report_info));
                            var report_blob = new Blob([report_info], {type : 'text/html'});

                            saveAs(report_blob, "bugreport_"+Math.floor(Date.now() / 1000)+".txt");
                        });
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
