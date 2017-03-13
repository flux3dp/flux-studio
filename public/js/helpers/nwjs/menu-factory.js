/**
 * nwjs menu factory
 */
define([
    'helpers/nwjs/gui',
    'helpers/nwjs/menu-map',
    'helpers/i18n',
    'helpers/check-firmware',
    'helpers/api/discover',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/initialize-machine',
    'helpers/check-device-status',
    'app/actions/global-actions',
    'app/constants/global-constants',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants',
    'helpers/api/touch',
    'helpers/firmware-updater',
    'helpers/device-list',
    'helpers/api/3d-scan-control',
    'helpers/api/cloud',
    'helpers/firmware-version-checker',
    'helpers/device-error-handler'
], function(
    gui,
    menuMap,
    i18n,
    checkFirmware,
    discover,
    DeviceMaster,
    DeviceConstants,
    initializeMachine,
    checkDeviceStatus,
    GlobalActions,
    GlobalConstants,
    AlertActions,
    AlertStore,
    ProgressActions,
    ProgressConstants,
    InputLightboxActions,
    InputLightboxConstants,
    touch,
    firmwareUpdater,
    DeviceList,
    ScanControl,
    CloudApi,
    FirmwareVersionChecker,
    DeviceErrorHandler
) {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        executeFirmwareUpdate = function(printer, type) {
            var currentPrinter = discoverMethods.getLatestPrinter(printer),
                checkToolheadFirmware = function() {
                    var $deferred = $.Deferred();

                    ProgressActions.open(ProgressConstants.NONSTOP, lang0.update.checkingHeadinfo);

                    if ('toolhead' === type) {
                        DeviceMaster.headInfo().done(function(response) {
                            currentPrinter.toolhead_version = response.version || '';

                            if ('undefined' === typeof response.version) {
                                $deferred.reject();
                            }
                            else {
                                $deferred.resolve({ status: 'ok' });
                            }
                        }).fail(() => {
                            $deferred.reject();
                        });
                    }
                    else {
                        $deferred.resolve({ status: 'ok' });
                    }

                    return $deferred;
                },
                updateFirmware = function() {
                    checkFirmware(currentPrinter, type).done(function(response) {
                        var latestVersion = currentPrinter.version,
                            caption = lang0.update.firmware.latest_firmware.caption,
                            message = lang0.update.firmware.latest_firmware.message;

                        if ('toolhead' === type) {
                            latestVersion = currentPrinter.toolhead_version;
                            caption = lang0.update.toolhead.latest_firmware.caption;
                            message = lang0.update.toolhead.latest_firmware.message;
                        }

                        if (!response.needUpdate) {
                            AlertActions.showPopupInfo(
                                'latest-firmware',
                                message + ' (v' + latestVersion + ')',
                                caption
                            );
                        }

                        firmwareUpdater(response, currentPrinter, type);
                    }).
                    fail(function(response) {
                        firmwareUpdater(response, currentPrinter, type);
                        AlertActions.showPopupInfo(
                            'latest-firmware',
                            lang0.monitor.cant_get_toolhead_version
                        );
                    });
                },
                checkStatus = function() {
                    const processUpdate = () => {
                        checkToolheadFirmware().always(function() {
                            ProgressActions.close();
                            updateFirmware();
                        }).fail(function() {
                            AlertActions.showPopupError('toolhead-offline', lang0.monitor.cant_get_toolhead_version);
                        });
                    };

                    const handleYes = (id) => {
                        if(id === 'head-missing') {
                            processUpdate();
                        }
                    };

                    const handleCancel = (id) => {
                        if(id === 'head-missing') {
                            AlertStore.removeYesListener(handleYes);
                            AlertStore.removeCancelListener(handleCancel);
                            DeviceMaster.endMaintainMode();
                        }
                    };

                    AlertStore.onRetry(handleYes);
                    AlertStore.onCancel(handleCancel);

                    ProgressActions.open(ProgressConstants.NONSTOP, lang0.update.preparing);
                    if(type === 'toolhead') {
                        DeviceMaster.enterMaintainMode().then(() => {
                            setTimeout(() => {
                                ProgressActions.close();
                                processUpdate();
                            }, 3000);
                        });
                    }
                    else {
                        processUpdate();
                    }
                };

            DeviceMaster.select(printer).then(function(status) {
                checkStatus();
            }).fail((resp) => {
                AlertActions.showPopupError('menu-item', lang0.message.connectionTimeout);
            });
        },
        lang = i18n.get().topmenu,
        lang0 = i18n.get(),
        NWjsWindow,
        topMenu,
        Menu,
        MenuItem,
        methods,
        defaultDevice,
        createDevice,
        createDeviceList,
        doDiscover,
        discoverMethods,
        accountDisplayName,
        timer,
        subMenuCache = {},
        subMenuIndex = {},
        submenuId = 0;

    MenuItem = gui.MenuItem;
    NWjsWindow = gui.Window.get();
    Menu = gui.Menu;

    methods = {
        createMenu: function() {
            return new Menu();
        },

        createSubMenu: function(items) {
            var subMenu = this.createMenu({id: ++submenuId}),
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
                    if(window.FLUX.allowTracking && window.analytics) {
                        window.analytics.event('send', 'event', 'menubar-button', 'click', el.label);
                    }
                });

                subMenu.append(menuItem);
            });

            return subMenu;
        },

        refresh: function() {
            if (!window.FLUX.isNW) { return; }
            menuMap.all = menuMap.refresh();
            initialize(menuMap.all);
        },

        updateMenu: function(menu, parentIndex) {
            var menuItem = topMenu.items[parentIndex];

            menuItem.subMenu = methods.createSubMenu(menu.subItems);
        },

        updateAccountDisplay: function(name) {
            accountDisplayName = name;
            methods.refresh();
        }

    };

    function initialize(menuMap) {
        if(!window.FLUX.isNW) { return; }
        topMenu = topMenu ? NWjsWindow.menu : new Menu({ type: 'menubar', title: 'FLUX Studio', label: 'FLUX Studio' });
        window.FLUX.menuMap = menuMap; // Make menuMap global accessable

        let updateMenu = topMenu.items.length === 0;

        updateAccountMenu(menuMap);
        menuMap.map((menu, i) => {
            if(!subMenuCache[i] || JSON.stringify(menu.subItems) !== subMenuCache[i].json) {
                let subMenu = methods.createSubMenu(menu.subItems);
                let menuItem = new MenuItem({ label: menu.label, submenu: subMenu });

                if(subMenuCache[i]) {
                    topMenu.removeAt(i);
                    topMenu.insert(menuItem, i);
                } else {
                    topMenu.append(menuItem);
                    updateMenu = true;
                }
                subMenuCache[i] = { id: menuItem.id, json: JSON.stringify(menu.subItems) };
            } else {
                // No change no update
            }
        });

        while(topMenu.items.length > menuMap.length) {
            let i = topMenu.items.length - 1;
            subMenuCache[i] = null;
            topMenu.removeAt(i);
            updateMenu = true;
        };

        if (updateMenu) {
            NWjsWindow.menu = topMenu;
        }
    }

    function updateAccountMenu(menuMap) {
        if(!menuMap) { return; }
        let accountMenu = menuMap.filter(v => v.label === lang.account.label)[0];
        if(!accountMenu) { return; }
        if(accountDisplayName === '' || typeof accountDisplayName === 'undefined') {
            accountMenu.subItems.splice(1,2);
        } else {
            accountMenu.subItems[0].label = accountDisplayName || lang.account.sign_in;
        }

        if(accountMenu.subItems.length >= 3) {
            // clicked on sign out
            accountMenu.subItems[2].onClick = () => {
                methods.updateAccountDisplay('');
                CloudApi.signOut();
                setTimeout(() => {
                    location.hash = '#studio/cloud/sign-in';
                }, 1000);
            };
        }
        return menuMap;
    }

    if (window.FLUX.isNW) {
        initialize(menuMap.all);
    }

    if (window.FLUX.isNW) {
        createDevice = function(printer) {
            var subItems = [],
                showPopup;

            // type = CHANGE_FILAMENT || SET_TEMPERATURE
            showPopup = (currentPrinter, type) => {

                FirmwareVersionChecker.check(printer, 'OPERATE_DURING_PAUSE')
                .then((allowPause) => {
                    return checkDeviceStatus(currentPrinter, allowPause);
                })
                .done((status) => {
                    switch (status) {
                    case 'ok':
                        if(type === 'SET_TEMPERATURE') {
                            AlertActions.showHeadTemperature(currentPrinter);
                        }
                        else {
                            AlertActions.showChangeFilament(currentPrinter);
                        }
                        break;
                    case 'auth':
                        let callback = {
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
                        _auth(currentPrinter.uuid, '', callback);
                        break;
                    }
                });

            };

            defaultDevice = initializeMachine.defaultPrinter.get();

            // device monitor
            subItems.push({
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
            });

            // device info
            subItems.push({
                label: lang.device.device_info,
                enabled: true,
                onClick: function() {
                    var currentPrinter = discoverMethods.getLatestPrinter(printer),
                        lang = i18n.get();

                    var deviceInfo = `${lang.device.model_name}: ${currentPrinter.model.toUpperCase()}\n${lang.device.IP}: ${currentPrinter.ipaddr}\n${lang.device.serial_number}: ${currentPrinter.serial}\n${lang.device.firmware_version}: ${currentPrinter.version}\n${lang.device.UUID}: ${currentPrinter.uuid}`;
                    AlertActions.showPopupInfo('', deviceInfo);
                }
            });

            subItems.push({
                label: '',
                type: 'separator'
            });

            // change filament
            subItems.push({
                id: 'change_filament',
                label: lang.device.change_filament,
                enabled: true,
                onClick: function() {
                    var currentPrinter = discoverMethods.getLatestPrinter(printer);

                    DeviceMaster.selectDevice(currentPrinter).then(function(status) {
                        DeviceMaster.getReport().then(report => {
                            if(report.st_id === 16 || report.st_id === 2) {
                                AlertActions.showPopupError('OCCUPIED', lang.message.device_in_use);
                            }
                            else if (status === DeviceConstants.CONNECTED) {
                                showPopup(currentPrinter, 'CHANGE_FILAMENT');
                            }
                            else if (status === DeviceConstants.TIMEOUT) {
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            }
                        });
                    });
                }
            });

            subItems.push({
                id: 'calibrate',
                label: lang.device.calibrate,
                onClick: () => {
                    var currentPrinter = discoverMethods.getLatestPrinter(printer),
                        lang = i18n.get();
                    DeviceMaster.selectDevice(currentPrinter).then((status) => {
                        if (status === DeviceConstants.CONNECTED) {
                            const handleStopCalibrate = () => {
                                DeviceMaster.killSelf();
                            };
                            checkDeviceStatus(currentPrinter).then(() => {
                                ProgressActions.open(
                                    ProgressConstants.WAITING,
                                    lang.device.calibrating,
                                    lang.device.pleaseWait,
                                    true,
                                    emptyFunction,
                                    emptyFunction,
                                    handleStopCalibrate
                                );
                                DeviceMaster.calibrate().done((debug_message) => {
                                    setTimeout(() => {
                                        AlertActions.showPopupInfo('calibrated', JSON.stringify(debug_message), lang.calibration.calibrated);
                                    }, 100);
                                }).fail((resp) => {
                                    console.log('THe error', resp);
                                    if (resp.error[0] === 'EDGE_CASE') { return; }
                                    if (resp.module === 'LASER') {
                                        AlertActions.showPopupError('calibrate-fail', lang.calibration.extruderOnly);
                                    }
                                    else {
                                        DeviceErrorHandler.processDeviceMasterResponse(resp);
                                        AlertActions.showPopupError('calibrate-fail', DeviceErrorHandler.translate(resp.error));
                                    }
                                }).always(() => {
                                    ProgressActions.close();
                                });
                            });
                        }
                        else if (status === DeviceConstants.TIMEOUT) {
                            AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                        }
                    });
                }
            });

            subItems.push({
                label: lang.device.commands,
                subItems: [
                    {
                        label: lang.device.set_to_origin,
                        enabled: true,
                        onClick: function() {
                            var currentPrinter = discoverMethods.getLatestPrinter(printer);
                            ProgressActions.open(ProgressConstants.NONSTOP, i18n.lang.message.connecting);
                            DeviceMaster.select(currentPrinter).then(() => {
                                checkDeviceStatus(currentPrinter).then(() => {
                                    ProgressActions.open(ProgressConstants.NONSTOP);
                                    DeviceMaster.home().done(() => {
                                        ProgressActions.close();
                                        setTimeout(() => {
                                            AlertActions.showPopupInfo('set-to-origined', lang.device.set_to_origin_complete);
                                        }, 100);
                                    }).always(() => {
                                        ProgressActions.close();
                                    });
                                });
                            }).fail(() => {
                                ProgressActions.close();
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            });
                        }
                    },
                    {
                        label: lang.device.movement_tests,
                        enabled: true,
                        onClick: function() {
                            ProgressActions.open(ProgressConstants.NONSTOP, i18n.lang.message.connecting);
                            var currentPrinter = discoverMethods.getLatestPrinter(printer);
                            DeviceMaster.select(currentPrinter).then(() => {
                                ProgressActions.open(ProgressConstants.NONSTOP, i18n.lang.tutorial.runningMovementTests);
                                checkDeviceStatus(currentPrinter).then(() => {
                                    DeviceMaster.runMovementTests().then(() => {
                                        console.log('ran movemnt test');
                                        ProgressActions.close();
                                        AlertActions.showPopupInfo('movement-tests', lang.device.movement_tests_complete);
                                    }).fail((resp) => {
                                        console.log('ran movemnt test failed');
                                        ProgressActions.close();
                                        AlertActions.showPopupInfo('movement-tests', lang.device.movement_tests_failed);
                                    });
                                });
                            }).fail(() => {
                                ProgressActions.close();
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            });
                        }
                    },
                    {
                        label: lang.device.scan_laser_calibrate,
                        enabled: true,
                        onClick: function() {
                            var currentPrinter = discoverMethods.getLatestPrinter(printer);
                            ProgressActions.open(ProgressConstants.WAITING, i18n.lang.message.connecting);
                            DeviceMaster.select(currentPrinter).then(() => {
                                ProgressActions.open(ProgressConstants.WAITING);
                                checkDeviceStatus(currentPrinter).then(() => {
                                    ProgressActions.open(ProgressConstants.WAITING, lang.device.calibrating, lang.device.pleaseWait, false);
                                    var scanControl,
                                        opts = {
                                            onError: (data) => {
                                                scanControl.takeControl(function(response) {
                                                    ProgressActions.close();
                                                });
                                            },
                                            onReady: () => {
                                                ProgressActions.close();
                                                scanControl.turnLaser(true).then(() => {
                                                    AlertActions.showPopupCustom('scan-laser-turned-on', lang.device.scan_laser_complete, lang.device.finish, '');
                                                    var _handleFinish = (dialog_name) => {
                                                        scanControl.turnLaser(false).then(() => {
                                                            scanControl.quit(true).then(() => {
                                                                opts.onReady = function() {};
                                                            }).fail(() => {
                                                                ProgressActions.close();
                                                            });
                                                        });
                                                        AlertStore.removeCustomListener(_handleFinish);
                                                    };
                                                    AlertStore.onCustom(_handleFinish);
                                                });
                                            }
                                        };
                                    scanControl = ScanControl(currentPrinter.uuid, opts);
                                });
                            }).fail(() => {
                                ProgressActions.close();
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            });
                        }
                    },
                    {
                        label: lang.device.clean_calibration,
                        enabled: true,
                        onClick: function() {
                            var currentPrinter = discoverMethods.getLatestPrinter(printer),
                                lang = i18n.get();
                            ProgressActions.open(ProgressConstants.WAITING, lang.message.connecting);
                            DeviceMaster.select(currentPrinter).then(() => {
                                checkDeviceStatus(currentPrinter).then(() => {
                                    ProgressActions.open(ProgressConstants.WAITING, lang.device.calibrating, lang.device.pleaseWait, false);
                                    DeviceMaster.cleanCalibration().done(() => {
                                        setTimeout(() => {
                                            AlertActions.showPopupInfo('calibrated', lang.calibration.calibrated);
                                        }, 100);
                                    }).always(() => {
                                        ProgressActions.close();
                                    });
                                });
                            }).fail(() => {
                                ProgressActions.close();
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            });
                        }
                    },
                    {
                        label: lang.device.turn_on_head_temperature,
                        enabled: true,
                        onClick: function() {
                            var currentPrinter = discoverMethods.getLatestPrinter(printer);

                            DeviceMaster.select(currentPrinter).then(() => {
                                showPopup(currentPrinter, 'SET_TEMPERATURE');
                            }).fail(() => {
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            });
                        }
                    }
                ]
            });

            subItems.push({
                label: '',
                type: 'separator'
            });

            // firmware update (delta/toolhead)
            subItems.push({
                label: lang.device.check_firmware_update,
                subItems: [
                    {
                        label: lang.device.update_delta,
                        enabled: true,
                        onClick: function() {
                            checkDeviceStatus(printer).then(() => {
                                executeFirmwareUpdate(printer, 'firmware');
                            });
                        }
                    },
                    {
                        label: lang.device.update_toolhead,
                        enabled: true,
                        onClick: function() {
                            checkDeviceStatus(printer).then(() => {
                                executeFirmwareUpdate(printer, 'toolhead');
                            });
                        }
                    }
                ]
            });

            // default device
            subItems.push({
                label: lang.device.default_device,
                enabled: true,
                type: 'checkbox',
                onClick: function() {
                    var _printerItems = menuMap.all[menuMap.parentIndex.DEVICE].subItems,
                        _targetPrinterItem;

                    _printerItems.forEach(function(_printer, i) {
                        if (1 < i) {
                            _printerItems[i].subItems[4].checked = false;

                            if (printer.uuid === _printerItems[i].uuid) {
                                _targetPrinterItem = _printerItems[i];
                            }
                        }
                    });

                    _targetPrinterItem.subItems[6].checked = true;
                    initializeMachine.defaultPrinter.clear();
                    initializeMachine.defaultPrinter.set(printer);
                    Object.assign(defaultDevice, printer);
                    methods.refresh();
                },
                parent: menuMap.parentIndex.DEVICE,
                checked: (defaultDevice.uuid === printer.uuid)
            });

            return {
                isPrinter: true,
                uuid: printer.uuid,
                label: printer.name + (printer.source === 'h2h' ? ' (USB)' : ''),
                enabled: true,
                isNew: printer.isNew,
                subItems: subItems,
                isUsb: printer.source === 'h2h'
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
                    printers = DeviceList(printers);
                    _printers = createDeviceList(printers);
                }
            );

            setInterval(() => {
                if (true === needRenew(_printers)) {
                    menuMap.items.device.subItems = menuMap.items.device.defaultSubItems.concat(_printers);
                    menuMap.all = menuMap.refresh();
                    initialize(menuMap.all);
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
