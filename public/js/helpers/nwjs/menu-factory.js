/**
 * nwjs menu factory
 */
define([
    'helpers/nwjs/gui',
    'helpers/nwjs/menu-map',
    'helpers/i18n',
    'helpers/observe',
    'helpers/check-firmware',
    'helpers/api/discover',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/initialize-machine',
    'helpers/check-device-status',
    'app/actions/global-actions',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants'
], function(
    gui,
    menuMap,
    i18n,
    observe,
    checkFirmware,
    discover,
    DeviceMaster,
    DeviceConstants,
    initializeMachine,
    checkDeviceStatus,
    GlobalActions,
    AlertActions,
    ProgressActions,
    ProgressConstants,
    InputLightboxActions,
    InputLightboxConstants
) {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        executeFirmwareUpdate = function(printer, type) {
            var currentPrinter = discoverMethods.getLatestPrinter(printer),
                lang = i18n.get(),
                updateFirmware = function() {
                    checkFirmware(currentPrinter, type).done(function(response) {
                        var doUpdate = (
                                'firmware' === type ?
                                DeviceMaster.updateFirmware :
                                DeviceMaster.updateToolhead
                            ),
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
                                doUpdate(file).
                                    done(onFinishUpdate.bind(null, true)).
                                    fail(onFinishUpdate.bind(null, false));
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
                            DeviceMaster.selectDevice(printer).then(function(status) {
                                if (status === DeviceConstants.CONNECTED) {
                                    AlertActions.showUpdate(
                                        printer,
                                        type,
                                        response,
                                        onInstall
                                    );
                                }
                                else if (status === DeviceConstants.TIMEOUT) {
                                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                }
                            });
                        }
                        else {
                            AlertActions.showPopupInfo(
                                'latest-firmware',
                                lang.update.firmware.latest_firmware.message,
                                lang.update.firmware.latest_firmware.caption
                            );
                        }
                    }).
                    fail(function() {
                        AlertActions.showPopupInfo(
                            'latest-firmware',
                            lang.update.network_unreachable
                        );
                    });
                };

            checkDeviceStatus(currentPrinter).done(function(status) {
                switch (status) {
                case 'ok':
                    updateFirmware();
                    break;
                }
            });
        },
        originalMenuMap = JSON.parse(JSON.stringify(menuMap)),
        lang = i18n.get().topmenu,
        itemMap = [],
        NWjsWindow,
        mainmenu,
        Menu,
        MenuItem,
        methods,
        defaultDevice,
        createDevice,
        createDeviceList,
        doDiscover,
        discoverMethods;

    MenuItem = gui.MenuItem;
    NWjsWindow = gui.Window.get();
    Menu = gui.Menu;
    mainmenu = new Menu({ type: 'menubar', title: 'FLUX Studio', label: 'FLUX Studio' });

    methods = {
        createMenu: function() {
            return new Menu();
        },

        createSubMenu: function(items) {
            var subMenu = this.createMenu(),
                menuItem,
                menuOption;

            if (undefined === items) {
                return undefined;
            }

            function crossplatform_modifiers(modifiers) {
                if (!modifiers) {
                    return modifiers;
                }

                if ('osx' !== window.FLUX.osType) {
                    modifiers = modifiers.replace(/cmd/g, 'ctrl', '');
                }

                return modifiers;
            }

            items.forEach(function(el) {
                menuOption = {
                    label: el.label || '',
                    type: el.type || 'normal',
                    click: el.onClick || emptyFunction,
                    key: el.key || '',
                    modifiers: crossplatform_modifiers(el.modifiers) || '',
                    enabled: ('boolean' === typeof el.enabled ? el.enabled : true),
                    checked: el.checked || false
                };

                if (true === el.subItems instanceof Array) {
                    menuOption.submenu = methods.createSubMenu(el.subItems);
                }

                menuItem = new MenuItem(menuOption);

                menuItem.on('click', function() {
                    window.GA('send', 'event', 'menubar-button', 'click', el.label);
                });

                subMenu.append(menuItem);
            });

            return subMenu;
        },

        appendToMenu: function(label, subMenu) {
            var item = new MenuItem({ label: label, submenu: subMenu });
            itemMap.push(item);
            mainmenu.append(item);
        },

        getMenu: function() {
            return mainmenu;
        },

        clear: function() {
            mainmenu = new Menu({ type: 'menubar', title: 'FLUX Studio', label: 'FLUX Studio' });
        },

        refresh: function() {
            menuMap.all = menuMap.refresh();
            initialize(menuMap.all);
        },

        updateMenu: function(menu, parentIndex) {
            var menuItem = mainmenu.items[parentIndex],
                subMenu = methods.createSubMenu(menu.subItems);

            menuItem.submenu = subMenu;
        }

    };

    function initialize(menuMap) {
        var subMenu;

        methods.clear();

        menuMap.forEach(function(menu) {
            subMenu = methods.createSubMenu(menu.subItems);
            methods.appendToMenu(menu.label, subMenu);
        });

        NWjsWindow.menu = mainmenu;
    }

    if ('undefined' !== typeof requireNode) {
        initialize(menuMap.all);

        observe(menuMap.items, function(changes) {
            menuMap.all = menuMap.refresh();
            initialize(menuMap.all);
        });
    }

    if ('undefined' !== typeof requireNode) {
        createDevice = function(printer) {
            defaultDevice = initializeMachine.defaultPrinter.get();

            return {
                isPrinter: true,
                uuid: printer.uuid,
                label: printer.name,
                enabled: true,
                isNew: printer.isNew,
                subItems: [{
                    label: lang.device.device_monitor,
                    enabled: true,
                    onClick: function() {
                        DeviceMaster.selectDevice(printer).then(function(status) {
                            if (status === DeviceConstants.CONNECTED) {
                                checkDeviceStatus(printer).done(function(status) {
                                    switch (status) {
                                    case 'ok':
                                        GlobalActions.showMonitor(printer);
                                        break;
                                    }
                                });
                            }
                            else if (status === DeviceConstants.TIMEOUT) {
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            }
                        }).
                        fail(function(status) {
                            ProgressActions.close();
                            AlertActions.showPopupError('fatal-occurred', status);
                        });
                    }
                },
                {
                    label: lang.device.change_filament,
                    enabled: true,
                    onClick: function() {
                        var currentPrinter = discoverMethods.getLatestPrinter(printer),
                            showPopup = function(status) {
                                if (status === DeviceConstants.CONNECTED) {
                                    AlertActions.showChangeFilament(currentPrinter);
                                }
                                else if (status === DeviceConstants.TIMEOUT) {
                                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                }
                            };

                        DeviceMaster.selectDevice(currentPrinter).then(function(status) {
                            checkDeviceStatus(currentPrinter).done(function(status) {
                                switch (status) {
                                case 'ok':
                                    showPopup(status);
                                    break;
                                }
                            });
                        });
                    }
                },
                {
                    label: lang.device.check_firmware_update,
                    enabled: true,
                    onClick: function() {
                        executeFirmwareUpdate(printer, 'firmware');
                    }
                },
                {
                    label: lang.device.update_toolhead,
                    enabled: true,
                    onClick: function() {
                        executeFirmwareUpdate(printer, 'toolhead');
                    }
                },
                {
                    label: lang.device.default_device,
                    enabled: true,
                    type: 'checkbox',
                    onClick: function() {
                        var _currentPrinters = menuMap.all[3].subItems,
                            targetPrinter;

                        _currentPrinters.forEach(function(_printer, i) {
                            if (1 < i && printer.uuid === _currentPrinters[i].uuid) {
                                targetPrinter = _currentPrinters[i];
                            }
                        });

                        targetPrinter.subItems[4].checked = this.checked;

                        if (false === this.checked) {
                            initializeMachine.defaultPrinter.clear();
                        }
                        else {
                            initializeMachine.defaultPrinter.set(printer);
                        }

                        methods.refresh();
                    },
                    parent: menuMap.parentIndex.DEVICE,
                    checked: (defaultDevice.uuid === printer.uuid)
                }]
            };
        };

        createDeviceList = function(printers) {
            var _printers = [];

            printers.forEach(function(printer) {
                _printers.push(createDevice(printer));
            });

            return _printers;
        }

        doDiscover = function() {
            var _printers = [],
                needRenew = function(printers) {
                    return (
                        printers.length !== previousPrinters.length ||
                        printers.some(function(printer) {
                            return true === printer.isNew;
                        })
                    );
                },
                previousPrinters = [];

            discoverMethods = discover(
                'menu-factory',
                function(printers) {
                    _printers = createDeviceList(printers);
                }
            );

            setInterval(function() {
                if (true === needRenew(_printers)) {
                    menuMap.items.device.subItems = menuMap.items.device.defaultSubItems.concat(_printers);
                }

                previousPrinters = _printers;
            }, 5000);
        };

        doDiscover();
    }

    return {
        items: menuMap.items,
        methods: methods
    };
});