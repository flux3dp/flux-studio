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
    'helpers/api/cloud'
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
    CloudApi
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
                        DeviceMaster.headInfo().done(function(response) {
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
                    checkFirmware(currentPrinter, type).done(function(response) {
                        var latestVersion = currentPrinter.version,
                            caption = lang.update.firmware.latest_firmware.caption,
                            message = lang.update.firmware.latest_firmware.message;

                        if ('toolhead' === type) {
                            latestVersion = currentPrinter.toolhead_version;
                            caption = lang.update.toolhead.latest_firmware.caption;
                            message = lang.update.toolhead.latest_firmware.message;
                        }

                        if (false === response.needUpdate) {
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
                            lang.monitor.cant_get_toolhead_version
                        );
                    });
                },
                checkStatus = function() {
                    let informHeadMissing = false;

                    const processUpdate = () => {
                        checkToolheadFirmware().always(function() {
                            ProgressActions.close();
                            updateFirmware();
                        }).fail(function() {
                            AlertActions.showPopupError('toolhead-offline', lang.monitor.cant_get_toolhead_version);
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

                    ProgressActions.open(ProgressConstants.NONSTOP);
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
            if(!window.FLUX.isNW) return;
            menuMap.all = menuMap.refresh();
            initialize(menuMap.all);
        },

        updateMenu: function(menu, parentIndex) {
            var menuItem = topMenu.items[parentIndex],
                subMenu = methods.createSubMenu(menu.subItems);

            menuItem.subMenu = subMenu;
        },

        updateAccountDisplay: function(name) {
            accountDisplayName = name;
            methods.refresh();
        }

    };

    function initialize(menuMap) {
        if(!window.FLUX.isNW) { return; }
        topMenu = topMenu ? NWjsWindow.menu : new Menu({ type: 'menubar', title: 'FLUX Studio', label: 'FLUX Studio' });
        let initialLength = topMenu.items.length;
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

    if (true === window.FLUX.isNW) {
        initialize(menuMap.all);
    }

    if (true === window.FLUX.isNW) {
        createDevice = function(printer) {
            var subItems = [],
                showPopup = function(currentPrinter) {
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

                    var deviceInfo = `${lang.device.IP}: ${currentPrinter.ipaddr}\n${lang.device.serial_number}: ${currentPrinter.serial}\n${lang.device.firmware_version}: ${currentPrinter.version}\n${lang.device.UUID}: ${currentPrinter.uuid}`;
                    AlertActions.showPopupInfo('', deviceInfo);
                }
            });

            subItems.push({
                label: '',
                type: 'separator'
            });

            // change filament
            subItems.push({
                label: lang.device.change_filament,
                enabled: true,
                onClick: function() {
                    var currentPrinter = discoverMethods.getLatestPrinter(printer);

                    DeviceMaster.selectDevice(currentPrinter).then(function(status) {
                        var lang = i18n.get();

                        if (status === DeviceConstants.CONNECTED) {
                            showPopup(currentPrinter);
                        }
                        else if (status === DeviceConstants.TIMEOUT) {
                            AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                        }
                    });
                }
            });

            subItems.push({
                label: lang.device.calibrate,
                onClick: () => {
                    var currentPrinter = discoverMethods.getLatestPrinter(printer),
                        lang = i18n.get();
                    DeviceMaster.selectDevice(currentPrinter).then((status) => {
                        if (status === DeviceConstants.CONNECTED) {
                            checkDeviceStatus(currentPrinter).then(() => {
                                ProgressActions.open(ProgressConstants.WAITING, lang.device.calibrating, lang.device.pleaseWait, false);
                                DeviceMaster.calibrate().done((debug_message) => {
                                    setTimeout(() => {
                                        AlertActions.showPopupInfo('calibrated', JSON.stringify(debug_message), lang.calibration.calibrated);
                                    }, 100);
                                }).fail((error) => {
                                    if(error.module === 'LASER') {
                                        AlertActions.showPopupError('calibrate-fail', lang.calibration.extruderOnly);
                                    }
                                    else {
                                        let message = error.error ? lang.monitor[error.error.join('_')] : lang.monitor[error.join('_')];
                                        AlertActions.showPopupError('calibrate-fail', message || error.error.join(' '));
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
                            DeviceMaster.selectDevice(currentPrinter).then((status) => {
                                if (status === DeviceConstants.CONNECTED) {
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
                                }
                                else if (status === DeviceConstants.TIMEOUT) {
                                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                }
                            });
                        }
                    },
                    {
                        label: lang.device.scan_laser_calibrate,
                        enabled: true,
                        onClick: function() {
                            var currentPrinter = discoverMethods.getLatestPrinter(printer);
                            DeviceMaster.selectDevice(currentPrinter).then((status) => {
                                if (status === DeviceConstants.CONNECTED) {
                                    ProgressActions.open(ProgressConstants.WAITING);
                                    checkDeviceStatus(currentPrinter).then(() => {
                                        ProgressActions.open(ProgressConstants.WAITING, lang.device.calibrating, lang.device.pleaseWait, false);
                                        var scan_control,
                                            opts = {
                                                onError: (data) => {
                                                    scan_control.takeControl(function(response) {
                                                        self._openBlocker(false);
                                                    });
                                                },
                                                onReady: () => {
                                                    ProgressActions.close();
                                                    scan_control.turnLaser(true).then(() => {
                                                        AlertActions.showPopupCustom('scan-laser-turned-on', lang.device.scan_laser_complete, lang.device.finish, '');
                                                        var _handleFinish = (dialog_name) => {
                                                            scan_control.turnLaser(false).then(() => {
                                                                scan_control.quit();
                                                            });
                                                            AlertStore.removeCustomListener(_handleFinish);
                                                        };
                                                        AlertStore.onCustom(_handleFinish);
                                                    });
                                                }
                                            };
                                        scan_control = ScanControl(currentPrinter.uuid, opts);
                                    });
                                }
                                else if (status === DeviceConstants.TIMEOUT) {
                                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                }
                            });
                        }
                    },
                    {
                        label: lang.device.clean_calibration,
                        enabled: true,
                        onClick: function() {
                            var currentPrinter = discoverMethods.getLatestPrinter(printer),
                                lang = i18n.get();
                            DeviceMaster.selectDevice(currentPrinter).then((status) => {
                                if (status === DeviceConstants.CONNECTED) {
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
                                }
                                else if (status === DeviceConstants.TIMEOUT) {
                                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                }
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
                            executeFirmwareUpdate(printer, 'firmware');
                        }
                    },
                    {
                        label: lang.device.update_toolhead,
                        enabled: true,
                        onClick: function() {
                            executeFirmwareUpdate(printer, 'toolhead');
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

                    initializeMachine.defaultPrinter.clear();
                    targetPrinter.subItems[6].checked = true;
                    initializeMachine.defaultPrinter.set(printer);
                    methods.refresh();
                },
                parent: menuMap.parentIndex.DEVICE,
                checked: (defaultDevice.uuid === printer.uuid)
            });

            return {
                isPrinter: true,
                uuid: printer.uuid,
                label: printer.name,
                enabled: true,
                isNew: printer.isNew,
                subItems: subItems
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
