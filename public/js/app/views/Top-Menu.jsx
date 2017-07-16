define([
    'jquery',
    'react',
    'helpers/i18n',
    'app/app-settings',
    'helpers/detect-webgl',
    'helpers/api/discover',
    'helpers/device-master',
    'helpers/check-device-status',
    'helpers/check-firmware',
    'helpers/firmware-updater',
    'helpers/firmware-version-checker',
    'helpers/api/3d-scan-control',
    'helpers/api/cloud',
    'helpers/output-error',
    'plugins/classnames/index',
    'app/constants/device-constants',
    'jsx!views/print/Monitor',
    'jsx!widgets/Modal',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/global-actions',
    'app/stores/global-store',
    'helpers/device-list',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/constants/global-constants',
    'app/actions/initialize-machine'
], function(
    $,
    React,
    i18n,
    appSettings,
    detectWebgl,
    Discover,
    DeviceMaster,
    checkDeviceStatus,
    checkFirmware,
    firmwareUpdater,
    FirmwareVersionChecker,
    ScanControl,
    CloudApi,
    OutputError,
    ClassNames,
    DeviceConstants,
    Monitor,
    Modal,
    AlertActions,
    AlertStore,
    GlobalActions,
    GlobalStore,
    DeviceList,
    ProgressActions,
    ProgressConstants,
    GlobalConstants,
    InitializeMachine
) {
    'use strict';

    if (window["electron"]) {
        var { ipc, events } = window.electron;
    } else {
        const EM = require('events');
        var ipc = new EM();
        var events = {};
    }

    return function(args) {
        args = args || {};
        var _id = 'TopMenu',
            lang = args.state.lang,
            genericClassName = {
                'item': true
            },
            options = [
                {
                    name: 'print',
                    displayName: 'PRINT',
                    className: genericClassName,
                    label: lang.menu.print,
                    imgSrc: 'img/menu/icon_print.svg'
                },
                {
                    name: 'laser',
                    displayName: 'ENGRAVE',
                    className: genericClassName,
                    label: lang.menu.laser,
                    imgSrc: 'img/menu/icon_laser.svg'
                },
                {
                    name: 'scan',
                    displayName: 'SCAN',
                    className: genericClassName,
                    label: lang.menu.scan,
                    imgSrc: 'img/menu/icon_scan.svg'
                },
                {
                    name: 'draw',
                    displayName: 'DRAW',
                    className: genericClassName,
                    label: lang.menu.draw,
                    imgSrc: 'img/menu/icon-draw.svg'
                },
                {
                    name: 'cut',
                    displayName: 'CUT',
                    className: genericClassName,
                    label: lang.menu.cut,
                    imgSrc: 'img/menu/icon-cut.svg'
                },
            ],

            getLog = async function(printer, log) {
                await DeviceMaster.select(printer);
                ProgressActions.open(ProgressConstants.WAITING, '');
                let downloader = DeviceMaster.downloadLog(log);
                downloader.then((file) => {
                    ProgressActions.close();
                    saveAs(file[1], log);

                }).progress((progress) => {
                    ProgressActions.open(ProgressConstants.STEPPING);
                    ProgressActions.updating(
                        'downloading',
                        progress.completed/progress.size * 100,
                        function() { downloader.reject('canceled'); }
                    );

                }).fail((data) => {
                  let msg = data === 'canceled' ?
                        lang.device.download_log_canceled : lang.device.download_log_error;
                  AlertActions.showPopupInfo('', msg);
                });
            },

            executeFirmwareUpdate = function(printer, type) {
                //var currentPrinter = discoverMethods.getLatestPrinter(printer),
                var currentPrinter = printer,
                    checkToolheadFirmware = function() {
                        var $deferred = $.Deferred();

                        ProgressActions.open(ProgressConstants.NONSTOP, lang.update.checkingHeadinfo);

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
                                caption = lang.update.firmware.latest_firmware.caption,
                                message = lang.update.firmware.latest_firmware.message;

                            if ('toolhead' === type) {
                                latestVersion = currentPrinter.toolhead_version;
                                caption = lang.update.toolhead.latest_firmware.caption;
                                message = lang.update.toolhead.latest_firmware.message;
                            }

                            if (!response.needUpdate) {
                                let forceUpdate = {
                                    custom: () => {
                                      firmwareUpdater(response, currentPrinter, type, true);
                                    },
                                    no: () => {
                                      if ('toolhead' === type) {
                                          DeviceMaster.quitTask();
                                      }
                                    }
                                };
                                AlertActions.showPopupCustomCancel(
                                    'latest-firmware',
                                    message + ' (v' + latestVersion + ')',
                                    lang.update.firmware.latest_firmware.still_update,
                                    caption,
                                    forceUpdate
                                );
                            } else {
                              firmwareUpdater(response, currentPrinter, type);
                            }

                        })
                        .fail(function(response) {
                            firmwareUpdater(response, currentPrinter, type);
                            AlertActions.showPopupInfo(
                                'latest-firmware',
                                lang.monitor.cant_get_toolhead_version
                            );
                        });
                    },
                    checkStatus = function() {
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

                        ProgressActions.open(ProgressConstants.NONSTOP, lang.update.preparing);
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
                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                });
            };
        //============ end var================================================

        // Special Feature
        if (window.FLUX && window.FLUX.dev) {
            options.push({
                name: 'mill',
                displayName: 'Mill',
                className: genericClassName,
                label: lang.menu.mill,
                imgSrc: 'img/menu/icon-draw.svg'
            });
        }

        const registerAllDeviceMenuClickEvents = () => {

            window.menuEventRegistered = true;

            const showPopup = (currentPrinter, type) => {

                FirmwareVersionChecker.check(currentPrinter, 'OPERATE_DURING_PAUSE')
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

            ipc.on(events.MENU_CLICK, (e, menuItem) => {
                let _action = {},
                    lang = i18n.get();

                _action['DASHBOARD'] = (device) => {
                    DeviceMaster.selectDevice(device).then(status => {
                        if (status === DeviceConstants.CONNECTED) {
                            GlobalActions.showMonitor(device, '', '', GlobalConstants.DEVICE_LIST);
                        }
                        else if (status === DeviceConstants.TIMEOUT) {
                            AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                        }
                    });
                };

                _action['MACHINE_INFO'] = (device) => {
                    let info = `${lang.device.model_name}: ${device.model.toUpperCase()}\n${lang.device.IP}: ${device.ipaddr}\n${lang.device.serial_number}: ${device.serial}\n${lang.device.firmware_version}: ${device.version}\n${lang.device.UUID}: ${device.uuid}`;
                    AlertActions.showPopupInfo('', info);
                };

                _action['TOOLHEAD_INFO'] = (device) => {
                    DeviceMaster.selectDevice(device).then(function(status) {
                        if (status === DeviceConstants.TIMEOUT) {
                            AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                        }
                        else {
                            ProgressActions.open(ProgressConstants.NONSTOP, lang.message.connecting);
                            checkDeviceStatus(device)
                            .then(() => {
                                DeviceMaster.enterMaintainMode().then(() => {
                                    DeviceMaster.headInfo().then(info => {
                                        ProgressActions.close();
                                        DeviceMaster.endMaintainMode();

                                        let fields = ['ID', 'VERSION', 'HEAD_MODULE', 'USED', 'HARDWARE_VERSION', 'FOCAL_LENGTH'];

                                        let displayInfo = fields.map(field => {
                                            let k = info[field];
                                            if(field.toUpperCase() === 'HEAD_MODULE') {
                                                k = lang.head_info[info[field.toLowerCase()]];
                                            }
                                            else if(field === 'USED') {
                                                k = `${parseInt(info[field] / 60)} ${lang.head_info.hours}`;
                                            }
                                            return `${lang.head_info[field]}: ${k}`;
                                        });

                                        // remove focal length if it's not laser
                                        if(info.head_module === 'EXTRUDER') {
                                            displayInfo.splice(5, 1);
                                        }
                                        else if(info.head_module === 'LASER') {
                                            displayInfo.splice(4, 1);
                                        }

                                        AlertActions.showPopupInfo('', displayInfo.join('\n'));
                                    });
                                });
                            });
                        }
                    });
                };

                _action['CHANGE_FILAMENT'] = (device) => {
                    DeviceMaster.selectDevice(device).then(function(status) {
                        DeviceMaster.getReport().then(report => {
                            if(report.st_id === 16 || report.st_id === 2) {
                                AlertActions.showPopupError('OCCUPIED', lang.message.device_in_use);
                            }
                            else if (status === DeviceConstants.CONNECTED) {
                                showPopup(device, 'CHANGE_FILAMENT');
                            }
                            else if (status === DeviceConstants.TIMEOUT) {
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            }
                        });
                    });
                };

                _action['AUTO_LEVELING'] = (device) => {
                    DeviceMaster.selectDevice(device).then((status) => {
                        if (status === DeviceConstants.CONNECTED) {
                            const handleStopCalibrate = () => {
                                DeviceMaster.killSelf();
                            };
                            const emptyFunction = (object) => ( object || {} );
                            checkDeviceStatus(device).then(() => {
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
                };

                _action['CALIBRATE_ORIGIN'] = (device) => {
                    ProgressActions.open(ProgressConstants.NONSTOP, lang.message.connecting);
                    DeviceMaster.select(device).then(() => {
                        checkDeviceStatus(device).then(() => {
                            ProgressActions.open(ProgressConstants.NONSTOP);
                            DeviceMaster.home().done(() => {
                                ProgressActions.close();
                                setTimeout(() => {
                                    console.log('lang is', lang);
                                    AlertActions.showPopupInfo('set-to-origined', lang.topmenu.device.set_to_origin_complete);
                                }, 100);
                            }).always(() => {
                                ProgressActions.close();
                            });
                        });
                    }).fail(() => {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['MOVEMENT_TEST'] = (device) => {
                    ProgressActions.open(ProgressConstants.NONSTOP, lang.message.connecting);
                    DeviceMaster.select(device).then(() => {
                        ProgressActions.open(ProgressConstants.NONSTOP, lang.tutorial.runningMovementTests);
                        checkDeviceStatus(device).then(() => {
                            DeviceMaster.runMovementTests().then(() => {
                                console.log('ran movemnt test');
                                ProgressActions.close();
                                AlertActions.showPopupInfo('movement-tests', lang.topmenu.device.movement_tests_complete);
                            }).fail((resp) => {
                                console.log('ran movemnt test failed', resp);
                                ProgressActions.close();
                                AlertActions.showPopupInfo('movement-tests', lang.topmenu.device.movement_tests_failed);
                            });
                        });
                    }).fail(() => {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['TURN_ON_LASER'] = (device) => {
                    ProgressActions.open(ProgressConstants.WAITING, lang.message.connecting);
                    DeviceMaster.select(device).then(() => {
                        ProgressActions.open(ProgressConstants.WAITING);
                        checkDeviceStatus(device).then(() => {
                            ProgressActions.open(ProgressConstants.WAITING, lang.topmenu.device.calibrating, lang.device.pleaseWait, false);
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
                                            AlertActions.showPopupCustom('scan-laser-turned-on', lang.topmenu.device.scan_laser_complete, lang.topmenu.device.finish, '');
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
                            scanControl = ScanControl(device.uuid, opts);
                        });
                    }).fail(() => {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['AUTO_LEVELING_CLEAN'] = (device) => {
                    ProgressActions.open(ProgressConstants.WAITING, lang.message.connecting);
                    DeviceMaster.select(device).then(() => {
                        checkDeviceStatus(device).then(() => {
                            ProgressActions.open(ProgressConstants.WAITING, lang.topmenu.device.calibrating, lang.topmenu.device.pleaseWait, false);
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
                };

                _action['SET_TOOLHEAD_TEMPERATURE'] = (device) => {
                    DeviceMaster.select(device).then(() => {
                        showPopup(device, 'SET_TEMPERATURE');
                    }).fail(() => {
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['UPDATE_DELTA'] = (device) => {
                    checkDeviceStatus(device).then(() => {
                      executeFirmwareUpdate(device, 'firmware');
                    })
                };

                _action['UPDATE_TOOLHEAD'] = (device) => {
                    checkDeviceStatus(device).then(() => {
                      executeFirmwareUpdate(device, 'toolhead');
                    })
                };

                _action['LOG_NETWORK'] = (device) => {
                    getLog(device, 'fluxnetworkd.log');
                };

                _action['LOG_HARDWARE'] = (device) => {
                    getLog(device, 'fluxhald.log');
                };

                _action['LOG_DISCOVER'] = (device) => {
                    getLog(device, 'fluxupnpd.log');
                };

                _action['LOG_USB'] = (device) => {
                    getLog(device, 'fluxusbd.log');
                };

                _action['LOG_CAMERA'] = (device) => {
                    getLog(device, 'fluxcamerad.log');
                };

                _action['LOG_CLOUD'] = (device) => {
                    getLog(device, 'fluxcloudd.log');
                };

                _action['LOG_PLAYER'] = (device) => {
                    getLog(device, 'fluxplayerd.log');
                };

                _action['LOG_ROBOT'] = (device) => {
                    getLog(device, 'fluxrobotd.log');
                };

                _action['SET_AS_DEFAULT'] = (device) => {
                    InitializeMachine.defaultPrinter.clear();
                    InitializeMachine.defaultPrinter.set(device);
                    ipc.send(events.SET_AS_DEFAULT, device);
                };

                _action['BUG_REPORT'] = () => {
                    OutputError();
                };

                _action['SIGN_IN'] = () => {
                    location.hash = '#studio/cloud/sign-in';
                };

                _action['SIGN_OUT'] = () => {
                    CloudApi.signOut().then(() => {
                        location.hash = '#studio/cloud/sign-in';
                    });
                };

                _action['MY_ACCOUNT'] = () => {
                    location.hash = '#studio/cloud/bind-machine';
                };

                if(typeof _action[menuItem.id] === 'function') {
                    if(
                        menuItem.id === 'SIGN_IN' ||
                        menuItem.id === 'SIGN_OUT' ||
                        menuItem.id === 'MY_ACCOUNT' ||
                        menuItem.id === 'BUG_REPORT'
                    ) {
                        _action[menuItem.id]();
                    }
                    else {
                        let callback = {
                            timeout: 20000,
                            onSuccess: (device) => { _action[menuItem.id](device); },
                            onTimeout: () => { console.log('select device timeout');}
                        };

                        DeviceMaster.getDeviceBySerial(menuItem.serial, menuItem.source === 'h2h', callback);
                    }
                }
            });

        };

        const unregisterEvents = () => {
            let { ipc, events } = window.electron;
            ipc.removeAllListeners(events.MENU_CLICK);
        };

        if(!window.menuEventRegistered) {
            registerAllDeviceMenuClickEvents();
        }
        // registerMenuItemClickEvents();

        return React.createClass({

            getDefaultProps: function() {
                return {
                    show: true
                };
            },

            getInitialState: function() {
                return {
                    sourceId        : '',
                    deviceList      : [],
                    refresh         : '',
                    showDeviceList  : false,
                    customText      : '',
                    fcode           : {},
                    previewUrl      : ''
                };
            },

            componentDidMount: function() {
                this._toggleDeviceListBind = this._toggleDeviceList.bind(null, false);

                AlertStore.onCancel(this._toggleDeviceListBind);
                AlertStore.onRetry(this._waitForPrinters);
                GlobalStore.onMonitorClosed(this._toggleDeviceListBind);

            },

            componentWillUnmount: function() {
                AlertStore.removeCancelListener(this._toggleDeviceListBind);
                AlertStore.removeRetryListener(this._waitForPrinters);
                GlobalStore.removeMonitorClosedListener(this._toggleDeviceListBind);
                // unregisterEvents();
            },

            _waitForPrinters: function() {
                setTimeout(this._openAlertWithnoPrinters, 5000);
            },

            _openAlertWithnoPrinters: function() {
                if (0 === this.state.deviceList.length && true === this.state.showDeviceList) {
                    AlertActions.showPopupRetry('no-printer', lang.device_selection.no_printers);
                }
            },

            _toggleDeviceList: function(open) {
                this.setState({
                    showDeviceList: open
                });

                if (true === open) {
                    this._waitForPrinters();
                }
            },

            _handleNavigation: function(address) {

                if (-1 < appSettings.needWebGL.indexOf(address) && false === detectWebgl()) {
                    AlertActions.showPopupError('no-webgl-support', lang.support.no_webgl);
                }
                else {
                    location.hash = '#studio/' + address;
                }
            },

            _handleShowDeviceList: function() {
                var self = this,
                    refreshOption = function(devices) {
                        self.setState({
                            deviceList: devices
                        });
                    };

                Discover(
                    'top-menu',
                    function(printers) {
                        printers = DeviceList(printers);
                        refreshOption(printers);
                    }
                );

                this._toggleDeviceList(!this.state.showDeviceList);
            },

            _handleSelectDevice: function(device, e) {
                e.preventDefault();
                AlertStore.removeCancelListener(this._toggleDeviceListBind);
                ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.initialize.connecting);
                DeviceMaster.selectDevice(device).then(function(status) {
                    if (status === DeviceConstants.CONNECTED) {
                        ProgressActions.close();
                        GlobalActions.showMonitor(device);
                    }
                    else if (status === DeviceConstants.TIMEOUT) {
                        ProgressActions.close();
                        AlertActions.showPopupError(_id, lang.message.connectionTimeout);
                    }
                })
                .fail(function(status) {
                    ProgressActions.close();
                    AlertActions.showPopupError('fatal-occurred', status);
                });

                this._toggleDeviceList(false);
            },

            _handleMonitorClose: function() {
                this.setState({
                    showMonitor: false
                });
            },

            _handleContextMenu: function(event) {
                electron && electron.ipc.send("POPUP_MENU_ITEM", {x: event.screenX, y:event.screenY});
            },
            _renderStudioFunctions: function() {
                var itemClass = '',
                    label = '',
                    isActiveItem,
                    menuItems;

                menuItems = options.map(function(opt, i) {
                    isActiveItem = -1 < location.hash.indexOf(opt.name);
                    itemClass = '';
                    label = '';

                    if ('' !== opt.label) {
                        label = (<p>{opt.label}</p>);
                    }

                    opt.className.active = isActiveItem;
                    itemClass = ClassNames(opt.className);

                    return (
                        <li className={itemClass} key={'menu' + i}
                            data-display-name={opt.displayName}
                            onClick={this._handleNavigation.bind(null, opt.name)}>
                            <img src={opt.imgSrc} draggable="false"/>
                            {label}
                        </li>
                    );
                }, this);

                return menuItems;
            },

            _renderDeviceList: function() {
                var status = lang.machine_status,
                    headModule = lang.head_module,
                    statusText,
                    headText,
                    progress,
                    deviceList = this.state.deviceList,
                    options = deviceList.map(function(device) {
                        statusText = status[device.st_id] || status.UNKNOWN;
                        headText = headModule[device.head_module] || headModule.UNKNOWN;

                        if(device.st_prog === 0) {
                            progress = '';
                        }
                        else if (16 === device.st_id && 'number' === typeof device.st_prog) {
                            progress = (parseInt(device.st_prog * 1000) * 0.1).toFixed(1) + '%';
                        }
                        else {
                            progress = '';
                        }

                        let img = `img/icon_${device.source === 'h2h' ? 'usb' : 'wifi' }.svg`;

                        return (
                            <li
                                name={device.uuid}
                                onClick={this._handleSelectDevice.bind(null, device)}
                                data-test-key={device.serial}
                            >
                                <label className="name">{device.name}</label>
                                <label className="status">{headText} {statusText}</label>
                                <label className="progress">{progress}</label>
                                <label className="connection-type">
                                    <div className="type">
                                        <img src={img} />
                                    </div>
                                </label>
                            </li>
                        );
                    }, this),
                    list;

                list = (
                    0 < options.length
                    ? options :
                    [<div className="spinner-roller spinner-roller-reverse"/>]
                );

                return (
                    <ul>{list}</ul>
                );
            },

            render : function() {
                var menuItems  = this._renderStudioFunctions(),
                    deviceList = this._renderDeviceList(),
                    currentWorkingFunction,
                    menuClass,
                    topClass;

                currentWorkingFunction = options.filter(function(el) {
                    return -1 < location.hash.search(el.name);
                })[0] || {};

                menuClass = ClassNames('menu', { show: this.state.showDeviceList });
                topClass = {
                    'hide': !this.props.show
                };

                return (
                    <div className={ClassNames(topClass)}>
                        <div className="brand-logo" onContextMenu={this._handleContextMenu.bind(this)}>
                            <img className="logo-icon" src="img/menu/main_logo.svg" draggable="false"/>
                            <span className="func-name">{currentWorkingFunction.displayName}</span>
                            <div className="menu">
                                <div className="arrow arrow-left arrow-top-left-flat"/>
                                <ul className="inner-menu">
                                    {menuItems}
                                </ul>
                            </div>
                        </div>

                        <div title={lang.print.deviceTitle} className="device" onClick={this._handleShowDeviceList}>
                            <p className="device-icon">
                                <img src="img/btn-device.svg" draggable="false"/>
                                <span>{lang.menu.device}</span>
                            </p>
                            <div className={menuClass}>
                                <div className="arrow arrow-right"/>
                                <div className="device-list">
                                    {deviceList}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

        });
    };
});
