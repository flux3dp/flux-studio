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
    'app/constants/global-constants',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants',
    'helpers/api/touch'
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
    GlobalConstants,
    AlertActions,
    ProgressActions,
    ProgressConstants,
    InputLightboxActions,
    InputLightboxConstants,
    touch
) {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        executeFirmwareUpdate = function(printer, type) {
            var currentPrinter = discoverMethods.getLatestPrinter(printer),
                lang = i18n.get(),
                checkToolheadFirmware = function() {
                    var $deferred = $.Deferred();

                    ProgressActions.open(ProgressConstants.NONSTOP);

                    if ('toolhead' === type) {
                        DeviceMaster.headinfo().done(function(response) {
                            currentPrinter.toolhead_version = response.version || '';

                            if ('undefined' === typeof response.version) {
                                $deferred.reject();
                            }
                            else {
                                $deferred.resolve({ status: 'ok' });
                            }
                        });
                    }
                    else {
                        $deferred.resolve({ status: 'ok' });
                    }

                    return $deferred;
                },
                updateFirmware = function() {
                    var doUpdate = (
                            'firmware' === type ?
                            DeviceMaster.updateFirmware :
                            DeviceMaster.updateToolhead
                        ),
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
                        },
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
                        showUpdate = function(response) {
                            AlertActions.showUpdate(
                                printer,
                                type,
                                response || {},
                                onInstall
                            );
                        };

                    checkFirmware(currentPrinter, type).done(function(response) {
                        var latestVersion = currentPrinter.version,
                            caption = lang.update.firmware.latest_firmware.caption,
                            message = lang.update.firmware.latest_firmware.message;

                        if ('toolhead' === type) {
                            latestVersion = currentPrinter.toolhead_version;
                            caption = lang.update.toolhead.latest_firmware.caption;
                            message = lang.update.toolhead.latest_firmware.message;
                        }

                        if (true === response.needUpdate) {
                            showUpdate(response);
                        }
                        else {
                            AlertActions.showPopupInfo(
                                'latest-firmware',
                                message + ' (v' + latestVersion + ')',
                                caption
                            );
                        }
                    }).
                    fail(function(response) {
                        showUpdate(response);
                        AlertActions.showPopupInfo(
                            'latest-firmware',
                            lang.monitor.cant_get_toolhead_version
                        );
                    });
                },
                checkStatus = function() {
                    var goCheckStatus = function() {
                        checkToolheadFirmware().always(function() {
                            ProgressActions.close();
                            updateFirmware();
                        }).fail(function() {
                            AlertActions.showPopupError('toolhead-offline', lang.monitor.cant_get_toolhead_version);
                        });
                    };

                    checkDeviceStatus(currentPrinter).done(function(status) {
                        switch (status) {
                        case 'ok':
                            goCheckStatus();
                            break;
                        case 'auth':
                            var opts = {
                                onSuccess: function() {
                                    goCheckStatus();
                                },
                                onError: function() {
                                    InputLightboxActions.open('auth-device', {
                                        type         : InputLightboxConstants.TYPE_PASSWORD,
                                        caption      : lang.select_printer.notification,
                                        inputHeader  : lang.select_printer.please_enter_password,
                                        confirmText  : lang.select_printer.submit,
                                        onSubmit     : function(password) {
                                            _auth(printer.uuid, password, {
                                                onError: function() {
                                                    AlertActions.showPopupError('device-auth-fail', lang.select_printer.auth_failure);
                                                }
                                            });
                                        }
                                    });
                                }
                            };
                            _auth(currentPrinter.uuid, '', opts);
                            break;
                        }
                    });

                };

            DeviceMaster.selectDevice(printer).then(function(status) {
                var lang = i18n.get();

                if (status === DeviceConstants.CONNECTED) {
                    checkStatus();
                }
                else if (status === DeviceConstants.TIMEOUT) {
                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
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
        discoverMethods,
        _auth = function(uuid, password, opts) {
            ProgressActions.open(ProgressConstants.NONSTOP);
            opts = opts || {};
            opts.onError = opts.onError || function() {};
            opts.onSuccess = opts.onSuccess || function() {};

            var self = this,
                _opts = {
                    onSuccess: function(data) {
                        ProgressActions.close();
                        opts.onSuccess();
                    },
                    onFail: function(data) {
                        ProgressActions.close();
                        opts.onError();
                    }
                };

            touch(_opts).send(uuid, password);
        };

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

    if (true === window.FLUX.isNW) {
        initialize(menuMap.all);

        observe(menuMap.items, function(changes) {
            menuMap.all = menuMap.refresh();
            initialize(menuMap.all);
        });
    }

    if (true === window.FLUX.isNW) {
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
                        var currentPrinter = discoverMethods.getLatestPrinter(printer),
                            lang = i18n.get();

                        DeviceMaster.selectDevice(currentPrinter).then(function(status) {

                            if (status === DeviceConstants.CONNECTED) {
                                GlobalActions.showMonitor(currentPrinter, '', '', GlobalConstants.DEVICE_LIST);
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
                            showPopup = function() {
                                checkDeviceStatus(currentPrinter).done(function(status) {
                                    switch (status) {
                                    case 'ok':
                                        AlertActions.showChangeFilament(currentPrinter);
                                        break;
                                    case 'auth':
                                        var opts = {
                                            onSuccess: function() {
                                                AlertActions.showChangeFilament(currentPrinter);
                                            },
                                            onError: function() {
                                                InputLightboxActions.open('auth-device', {
                                                    type         : InputLightboxConstants.TYPE_PASSWORD,
                                                    caption      : lang.select_printer.notification,
                                                    inputHeader  : lang.select_printer.please_enter_password,
                                                    confirmText  : lang.select_printer.submit,
                                                    onSubmit     : function(password) {
                                                        _auth(printer.uuid, password, {
                                                            onError: function(response) {
                                                                var message = (
                                                                    false === response.reachable ?
                                                                    lang.select_printer.unable_to_connect :
                                                                    lang.select_printer.auth_failure
                                                                );
                                                                AlertActions.showPopupError('device-auth-fail', message);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        };
                                        _auth(currentPrinter.uuid, '', opts);
                                        break;
                                    }
                                });
                            };

                        DeviceMaster.selectDevice(currentPrinter).then(function(status) {
                            var lang = i18n.get();

                            if (status === DeviceConstants.CONNECTED) {
                                showPopup();
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
                        var _currentPrinters = menuMap.all[menuMap.parentIndex.DEVICE].subItems,
                            targetPrinter;

                        _currentPrinters.forEach(function(_printer, i) {
                            if (1 < i) {
                                _currentPrinters[i].subItems[4].checked = false;

                                if (printer.uuid === _currentPrinters[i].uuid) {
                                    targetPrinter = _currentPrinters[i];
                                }
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
        };

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