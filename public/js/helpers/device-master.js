define([
    'jquery',
    'helpers/i18n',
    'helpers/sprintf',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/input-lightbox-actions',
    'app/constants/device-constants',
    'helpers/api/control',
    'helpers/api/3d-scan-control',
    'helpers/usb-checker',
    'helpers/api/touch',
    'helpers/api/discover',
    'helpers/api/config',
    'app/actions/global-actions',
    'app/constants/input-lightbox-constants',
    'helpers/device-list',
    'helpers/api/camera',
    'helpers/api/simple-websocket',
    'helpers/socket-master',
    'helpers/array-findindex'
], function(
    $,
    i18n,
    sprintf,
    AlertActions,
    ProgressActions,
    ProgressConstants,
    InputLightboxActions,
    DeviceConstants,
    DeviceController,
    ScanController,
    UsbChecker,
    Touch,
    Discover,
    Config,
    GlobalActions,
    InputLightBoxConstants,
    DeviceList,
    Camera,
    SimpleWebsocket,
    Sm
) {
    'use strict';

    let lang = i18n.get(),
        SocketMaster,
        defaultPrinter,
        defaultPrinterWarningShowed = false,
        _instance = null,
        _selectedDevice = {},
        _deviceNameMap = {},
        _device,
        _cameraTimeoutTracker,
        nwConsole,
        usbDeviceReport = {},
        _devices = [],
        _errors = {},
        availableUsbChannel = -1,
        usbEventListeners = {};

    function selectDevice(device, deferred) {
        if(_selectedDevice.uuid === device.uuid) {
            let d = $.Deferred();
            d.resolve(DeviceConstants.CONNECTED);
            return d.promise();
        }
        Object.assign(_selectedDevice, device);
        let d = deferred || $.Deferred(),
            uuid = device.uuid;

        const goAuth = (uuid) => {
            ProgressActions.close();
            _selectedDevice = {};

            const handleSubmit = (password) => {
                ProgressActions.open(ProgressConstants.NONSTOP);

                auth(uuid, password).always(() => {
                    ProgressActions.close();
                })
                .done((data) => {
                    device.plaintext_password = password;
                    selectDevice(device, d);
                })
                .fail((response) => {
                    let message = (
                        false === response.reachable ?
                        lang.select_printer.unable_to_connect :
                        lang.select_printer.auth_failure
                    );

                    goAuth(uuid);

                    AlertActions.showPopupError('device-auth-fail', message);
                });
            };

            const callback = {
                caption     : sprintf(lang.input_machine_password.require_password, _device.name),
                inputHeader : lang.input_machine_password.password,
                confirmText : lang.input_machine_password.connect,
                type        : InputLightBoxConstants.TYPE_PASSWORD,
                onSubmit    : handleSubmit
            };

            InputLightboxActions.open('auth', callback);
        };

        const createDeviceActions = (availableUsbChannel = -1) => {
            return DeviceController(uuid, {
                availableUsbChannel,
                onConnect: function(response) {
                    d.notify(response);

                    if (response.status.toUpperCase() === DeviceConstants.CONNECTED) {
                        d.resolve(DeviceConstants.CONNECTED);
                        _devices.push(_device);
                    }
                },
                onError: function(response) {
                    ProgressActions.close();
                    // TODO: shouldn't do replace
                    response.error = response.error.replace(/^.*\:\s+(\w+)$/g, '$1');
                    switch (response.error.toUpperCase()) {
                    case DeviceConstants.TIMEOUT:
                        d.resolve(DeviceConstants.TIMEOUT);
                        break;
                    case DeviceConstants.AUTH_ERROR:
                    case DeviceConstants.AUTH_FAILED:
                        if (true === device.password) {
                            goAuth(_device.uuid);
                        }
                        else {
                            ProgressActions.open(ProgressConstants.NONSTOP);

                            auth(_device.uuid, '').always(() => {
                                ProgressActions.close();
                            })
                            .done((data) => {
                                selectDevice(device, d);
                            })
                            .fail(() => {
                                AlertActions.showPopupError(
                                    'auth-error-with-diff-computer',
                                    lang.message.need_1_1_7_above
                                );
                            });
                        }
                        break;
                    case DeviceConstants.MONITOR_TOO_OLD:
                        AlertActions.showPopupError(
                            'fatal-occurred',
                            lang.message.monitor_too_old.content,
                            lang.message.monitor_too_old.caption
                        );
                        break;
                    default:
                        let message = lang.message.unknown_error;

                        if(response.error === 'UNKNOWN_DEVICE') {
                            message = lang.message.unknown_device;
                        }

                        AlertActions.showPopupError(
                            'unhandle-exception',
                            message
                        );
                    }
                },
                onFatal: function(e) {
                    _selectedDevice = {};
                }
            });
        };

        ProgressActions.open(ProgressConstants.NONSTOP);
        if(_existConnection(uuid)) {
            _device = _switchDevice(uuid);
            d.resolve(DeviceConstants.CONNECTED);
        }
        else {
            _device = {};
            _device.uuid = uuid;
            _device.source = device.source;
            _device.name = device.name;
        }

        const initSocketMaster = () => {
            SocketMaster = new Sm();

            // if availableUsbChannel has been defined
            if(typeof this !== 'undefined' && typeof this.availableUsbChannel !== 'undefined' && device.source === 'h2h') {
                _device.actions = createDeviceActions(this.availableUsbChannel);
            }
            else {
                _device.actions = createDeviceActions(device.uuid);
            }
            SocketMaster.setWebSocket(_device.actions);
        };

        initSocketMaster();

        return d.always(() => {
            ProgressActions.close();
        }).promise();
    }

    function auth(uuid, password) {
        ProgressActions.open(ProgressConstants.NONSTOP);

        let d = $.Deferred(),
            closeProgress = function() {
                ProgressActions.close();
            },
            opts = {
                onError: function(data) {
                    d.reject(data);
                    closeProgress();
                },
                onSuccess: function(data) {
                    d.resolve(data);
                    closeProgress();
                },
                onFail: function(data) {
                    d.reject(data);
                    closeProgress();
                }
            };

        Touch(opts).send(uuid, password);

        return d.promise();
    }

    function reconnectWs() {
        let d = $.Deferred();
        _device.actions = DeviceController(_selectedDevice.uuid, {
            availableUsbChannel: _selectedDevice.source === 'h2h' ? _selectedDevice.addr : -1,
            onConnect: function(response) {
                d.notify(response);

                if (response.status.toUpperCase() === DeviceConstants.CONNECTED) {
                    d.resolve(DeviceConstants.CONNECTED);
                }
            },
            onError: function(response) {
                // TODO: shouldn't do replace
                response.error = response.error.replace(/^.*\:\s+(\w+)$/g, '$1');
                switch (response.error.toUpperCase()) {
                case DeviceConstants.TIMEOUT:
                    d.resolve(DeviceConstants.TIMEOUT);
                    break;
                case DeviceConstants.AUTH_ERROR:
                case DeviceConstants.AUTH_FAILED:
                    if (true === device.password) {
                        goAuth(_device.uuid);
                    }
                    else {
                        ProgressActions.open(ProgressConstants.NONSTOP);

                        auth(_device.uuid, '').always(() => {
                            ProgressActions.close();
                        }).done((data) => {
                            selectDevice(device, d);
                        }).fail(() => {
                            AlertActions.showPopupError(
                                'auth-error-with-diff-computer',
                                lang.message.need_1_1_7_above
                            );
                        });
                    }
                    break;
                case DeviceConstants.MONITOR_TOO_OLD:
                    AlertActions.showPopupError(
                        'fatal-occurred',
                        lang.message.monitor_too_old.content,
                        lang.message.monitor_too_old.caption
                    );
                    break;
                default:
                    AlertActions.showPopupError(
                        'unhandle-exception',
                        lang.message.unknown_error
                    );
                }
            },
            onFatal: function(response) {
                // if channel is not available, (opcode -1),
                // default in createDeviceActions will catch first
            }
        });

        SocketMaster = new Sm();
        SocketMaster.setWebSocket(_device.actions);
        return d.promise();
    }

    function uploadToDirectory(data, path, fileName) {
        let d = $.Deferred();

        SocketMaster.addTask('upload', data, path, fileName).then(() => {
            d.resolve();
        }).progress((progress) => {
            d.notify(progress);
        }).fail((error) => {
            d.reject(error);
        });

        return d.promise();
    }

    function go(data) {
        let d = $.Deferred();
        if(!data || !(data instanceof Blob)) {
            d.resolve(DeviceConstants.READY);
        }
        else {
            const handleOk = () => { d.resolve(); };
            const handleProgress = (progress) => { d.notify(progress); };
            const handleError = (error) => { d.reject(error); };

            SocketMaster.addTask('upload', data).then(handleOk).progress(handleProgress).fail(handleError);
            SocketMaster.addTask('start').then(handleOk).fail(handleError);
        }

        return d.promise();
    }

    function goFromFile(path, fileName) {
        let d = $.Deferred();
        SocketMaster.addTask('select', path, fileName).then((selectResult) => {
            if(selectResult.status.toUpperCase() === DeviceConstants.OK) {
                SocketMaster.addTask('start').then((startResult) => {
                    d.resolve(startResult);
                }).fail((error) => {
                    d.reject(error);
                });
            }
            else {
                d.resolve({status: 'error'});
            }
        });
        return d.promise();
    }

    function waitTillCompleted() {
        let d = $.Deferred(),
            statusChanged = false;

        ProgressActions.open(ProgressConstants.NONSTOP);

        console.log("waiting status");
        let t = setInterval(() => {
            SocketMaster.addTask('report').then(r => {
                d.notify(r, t);
                let { st_id, error } = r.device_status;
                if (st_id == 64) {
                    clearInterval(t);
                    setTimeout(() => {
                        quit();
                        d.resolve();
                    }, 300);
                } else if (( st_id == 128 || st_id == 48 || st_id == 36 ) && error && error.length > 0) { // Error occured
                    clearInterval(t);
                    d.reject(error);
                } else if (st_id == 0) {
                    // Resolve if the status was running and some how skipped the completed part
                    if (statusChanged) {
                        clearInterval(t);
                        d.resolve();
                    }
                } else {
                    statusChanged = true;
                }
            });
        }, 2000);

        return d.promise();
    }

    function runMovementTests() {
        let d = $.Deferred();

        fetch(DeviceConstants.MOVEMENT_TEST).then(res => res.blob()).then(blob => {
            go(blob).fail(() => {
                // Error while uploading task
                d.reject(["UPLOAD_FAILED"]);
            }).then(waitTillCompleted).fail((error) => {
                // Error while running test
                d.reject(error);
            }).then(() => {
                // Completed
                d.resolve();
            });
        });

        return d.promise();
    }

    function resume() {
        return _do(DeviceConstants.RESUME);
    }

    function pause() {
        return _do(DeviceConstants.PAUSE);
    }

    function stop() {
        let d = $.Deferred();
        _do(DeviceConstants.STOP).then(r => {
            d.resolve(r);
        });
        return d.promise();
    }

    function quit() {
        return _do(DeviceConstants.QUIT);
    }

    function quitTask() {
        return _do(DeviceConstants.QUIT_TASK);
    }

    function kick() {
        return _do(DeviceConstants.KICK);
    }

    function killSelf() {
        let d = $.Deferred();
        _device.actions.killSelf().then(response => {
            d.resolve(response);
        }).always(() => {
            reconnectWs();
        });
        return d.promise();
    }

    function ls(path) {
        return SocketMaster.addTask('ls', path);
    }

    function fileInfo(path, fileName) {
        return SocketMaster.addTask('fileInfo', path, fileName);
    }

    function deleteFile(path, fileName) {
        let fileNameWithPath = `${path}/${fileName}`;
        return SocketMaster.addTask('deleteFile', fileNameWithPath);
    }

    function downloadFile(path, fileName) {
        return SocketMaster.addTask('downloadFile', `${path}/${fileName}`);
    }

    function readyCamera() {
        let d = $.Deferred();
        _device.scanController = ScanController(_device.uuid, {
            availableUsbChannel: this.availableUsbChannel,
            onReady: function() {
                d.resolve('');
            },
            onError: function(error) {
                AlertActions.showPopupError('', error);
            }
        });

        return d.promise();
    }

    function changeFilament(type) {
        let d = $.Deferred();
        SocketMaster.addTask('enterMaintainMode').then((response) => {
            return SocketMaster.addTask('maintainHome');
        }).then((response) => {
            return SocketMaster.addTask('changeFilament', type);
        }).then((response) => {
            d.resolve();
        }).progress((response) => {
            d.notify(response);
        }).fail((response) => {
            if(response.error[0] === 'KICKED') {
                reconnectWs();
            }
            d.reject(response);
        });

        return d.promise();
    }

    function changeFilamentDuringPause(type) {
        let d = $.Deferred();

        const initOperation = () => {
            return new Promise(resolve => {
                SocketMaster.addTask('startToolheadOperation').then(r => {
                    resolve(r);
                });
            });
        };

        const waitForTemperature = () => {
            return new Promise(resolve => {
                let fluctuation = 3;
                let t = setInterval(() => {
                    SocketMaster.addTask('report').then(r => {
                        d.notify(r, t);
                        let { rt, tt } = r.device_status;
                        if(rt[0] && tt[0]) {
                            let current = Math.round(rt[0]),  // current temperature rounded
                                target = tt[0];              // goal temperature

                            if(
                                current >= target - fluctuation &&  // min
                                current <= target + fluctuation     // max
                            ) {
                                clearInterval(t);
                                resolve();
                            }
                        };
                    });
                }, 3000);
            });
        };

        const startOperation = () => {
            return new Promise(resolve => {
                SocketMaster.addTask('changeFilamentDuringPause', type).always(r => {
                    resolve(r);
                });
            });
        };

        const endLoading = () => {
            return new Promise(resolve => {
                SocketMaster.addTask('endLoadingDuringPause').always(r => {
                    resolve(r);
                });
            });
        };

        const monitorStatus = () => {
            return new Promise(resolve => {
                let t = setInterval(() => {
                    getReport().then(r => {
                        r.loading = true;
                        // if button is pressed from the machine, status will change from LOAD_FILAMENT to PAUSE
                        if(r.st_label === 'PAUSED' || r.st_label === 'RESUMING') {
                            clearInterval(t);
                            resolve();
                        }
                        else {
                            d.notify(r, t);
                        }
                    });
                }, 2000);
            });
        };

        const operation = () => {
            initOperation().then(() => {
                return waitForTemperature();
            })
            .then(() => {
                return startOperation();
            })
            .then(() => {
                return monitorStatus();
            })
            .then(() => {
                d.resolve();
            });
        };

        operation();

        return d.promise();
    }

    function startToolheadOperation() {
        return SocketMaster.addTask('startToolheadOperation');
    }

    function endToolheadOperation() {
        return SocketMaster.addTask('endToolheadOperation');
    }

    function endLoadingDuringPause() {
        return SocketMaster.addTask('endLoadingDuringPause');
    }

    function detectHead() {
        let d = $.Deferred();

        SocketMaster.addTask('getHeadInfo').then((response) => {
            response.module ? d.resolve() : d.reject(response);
        }).fail(() => {
            d.reject();
        });

        return d.promise();
    }

    function enterMaintainMode() {
        return SocketMaster.addTask('enterMaintainMode');
    }

    function endMaintainMode() {
        return SocketMaster.addTask('endMaintainMode');
    }

    function reconnect() {
        _devices.some(function(device, i) {
            if(device.uuid === _selectedDevice.uuid) {
                _devices.splice(i, 1);
            }
        });

        return selectDevice(_selectedDevice);
    }

    // get functions

    function getReport() {
        return _do(DeviceConstants.REPORT);
    }

    function getSelectedDevice() {
        return _device;
    }

    function getPreviewInfo() {
        let d = $.Deferred();
        SocketMaster.addTask('getPreview').then((result) => {
            d.resolve(result);
        });
        return d.promise();
    }

    function getFirstDevice() {
        return _deviceNameMap[0];
    }

    function getDeviceByName(name) {
        return _deviceNameMap[name];
    }

    function updateFirmware(file) {
        return SocketMaster.addTask('fwUpdate', file);
    }

    function updateToolhead(file) {
        return SocketMaster.addTask('toolheadUpdate', file);
    }

    function headInfo() {
        return SocketMaster.addTask('getHeadInfo');
    }

    function closeConnection() {
        _device.actions.connection.close();
        _removeConnection(_device.uuid);
    }

    function getCloudValidationCode() {
        return SocketMaster.addTask('getCloudValidationCode');
    }

    function enableCloud() {
        return SocketMaster.addTask('enableCloud');
    }

    // Private Functions

    function _do(command) {
        let actions =  {
            'RESUME'    : () => SocketMaster.addTask('resume'),
            'PAUSE'     : () => SocketMaster.addTask('pause'),
            'STOP'      : () => SocketMaster.addTask('abort'),
            'QUIT'      : () => SocketMaster.addTask('quit'),
            'KICK'      : () => SocketMaster.addTask('kick'),
            'QUIT_TASK' : () => SocketMaster.addTask('quitTask'),

            'REPORT'    : () => {
                let d = $.Deferred();
                SocketMaster.addTask('report').then((result) => {
                    // force update st_label for a backend inconsistancy
                    let s = result.device_status;
                    if(s.st_id === DeviceConstants.status.ABORTED) {
                        s.st_label = 'ABORTED';
                    }
                    d.resolve(s);
                }).fail((error) => {
                    d.reject(error);
                });
                return d.promise();
            }
        };

        return actions[command]();
    }

    function updateNWProgress(deviceStatus) {
        if(FLUX.isNW) {
            if(!nwConsole) {
                nwConsole = nw.Window.get();
            }
            let stId = deviceStatus.st_id;
            if(stId !== 0 && stId !== 64 && stId !== 128) {
                if(deviceStatus.st_prog) {
                    nwConsole.setProgressBar(-1);
                    nwConsole.setProgressBar(deviceStatus.st_prog);
                }
            }
            else if (stId === 64 || stId === 128) {
                nwConsole.setProgressBar(-1);
            }
        }
    }

    function _existConnection(uuid, source) {
        return _devices.some(function(d) {
            return d.uuid === uuid && d.source === source;
        });
    }

    function _removeConnection(uuid) {
        let index = _devices.findIndex(function(d) {
            return d.uuid === uuid;
        });

        if (-1 < index) {
            _devices.splice(index, 1);
        }
    }

    function _switchDevice(uuid) {
        let index = _devices.findIndex(function(d) {
            return d.uuid === uuid;
        });

        return _devices[index];
    }

    function streamCamera(uuid) {
        let cameraStream = new Rx.Subject(),
            timeToReset = 20000,
            opts;

        opts = {
            availableUsbChannel: _device.source === 'h2h' ? parseInt(_device.uuid) : -1,
            onError: function(message) { console.log('error from camera ws', message); }
        };

        const initCamera = () => {
            _device.camera = Camera(uuid, opts);
            _device.camera.startStream((imageBlob) => {
                processCameraResult(imageBlob);
            });
        };

        const resetCamera = () => {
            _device.camera.closeStream();
            initCamera();
        };

        const processCameraResult = (imageBlob) => {
            clearTimeout(_cameraTimeoutTracker);
            _cameraTimeoutTracker = setTimeout(resetCamera, timeToReset);
            cameraStream.onNext(imageBlob);
        };

        initCamera();
        _cameraTimeoutTracker = setTimeout(resetCamera, timeToReset);

        return cameraStream;
    }

    function stopStreamCamera() {
        if(_device.camera) {
            clearTimeout(_cameraTimeoutTracker);
            _device.camera.closeStream();
        }
    }

    function calibrate() {
        let d = $.Deferred();
        let debug_data = {};

        const processError = (error = {}) => {
            let message = '';
            if(error.status === 'error') {
                message = lang.monitor[error.error.join('_')];
            }
            else if(error.info === DeviceConstants.RESOURCE_BUSY) {
                message = lang.calibration.RESOURCE_BUSY;
            }
            else if(error.module === 'LASER') {
                message = lang.calibration.extruderOnly;
            }
            else if(!error.module) {
                message = lang.calibration.headMissing;
            }
            else {
                message = error.error.join(' ');
            }

            AlertActions.showPopupError('device-busy', message);
            SocketMaster.addTask('endMaintainMode');
        };

        const step1 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then((response) => {
                if(response.status === 'ok') {
                    return SocketMaster.addTask('getHeadInfo');
                }
                else {
                    _d.reject(response);
                }
            }).then((headInfo) => {
                if(headInfo.module === null) {
                    return $.Deferred().reject({module:null});
                }
                else if(headInfo.module !== 'EXTRUDER') {
                    return $.Deferred().reject({module:'LASER'});
                }
                else {
                    return SocketMaster.addTask('maintainHome');
                }
            }).then((response) => {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail((error) => {
                _d.reject(error);
            });
            return _d.promise();
        };

        const step2 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('calibrate').then((response) => {
                debug_data = response.debug;
                return SocketMaster.addTask('endMaintainMode');
            }).then(() => {
                _d.resolve();
            }).fail((error) => {
                _d.reject(error);
            });
            return _d.promise();
        };

        step1().then(() => {
            return step2();
        }).then(() => {
            d.resolve(debug_data);
        }).fail((error) => {
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }

    function home() {
        let d = $.Deferred();

        const processError = (error = {}) => {
            let message = '';
            if(error.status === 'error') {
                message = lang.monitor[error.error.join('_')];
            }
            else if(error.info === DeviceConstants.RESOURCE_BUSY) {
                message = lang.calibration.RESOURCE_BUSY;
            }
            else if(!error.module) {
                message = lang.calibration.headMissing;
            }
            else {
                message = error.error.join(' ');
            }

            AlertActions.showPopupError('device-busy', message);
            SocketMaster.addTask('endMaintainMode');
        };

        const step1 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then((response) => {
                if(response.status === 'ok') {
                    return SocketMaster.addTask('maintainHome');
                }
                else {
                    _d.reject(response);
                }
            }).then((response) => {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail((error) => {
                _d.reject(error);
            });
            return _d.promise();
        };

        step1().then(() => {
            return SocketMaster.addTask('endMaintainMode');
        }).then(() => {
            d.resolve();
        }).fail((error) => {
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }

    function cleanCalibration() {
        let d = $.Deferred();

        const processError = (error = {}) => {
            let message = '';
            if(error.status === 'error') {
                message = lang.monitor[error.error.join('_')];
            }
            else if(error.info === DeviceConstants.RESOURCE_BUSY) {
                message = lang.calibration.RESOURCE_BUSY;
            }
            else if(!error.module) {
                message = lang.calibration.headMissing;
            }
            else {
                message = error.error.join(' ');
            }

            AlertActions.showPopupError('device-busy', message);
            SocketMaster.addTask('endMaintainMode');
        };

        const step1 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then((response) => {
                if(response.status === 'ok') {
                    return SocketMaster.addTask('maintainClean');
                }
                else {
                    _d.reject(response);
                }
            }).then((response) => {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail((error) => {
                _d.reject(error);
            });
            return _d.promise();
        };

        step1().then(() => {
            return SocketMaster.addTask('endMaintainMode');
        }).then(() => {
            d.resolve();
        }).fail((error) => {
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }

    function _scanDeviceError(devices) {
        devices.forEach(function(device) {
            if(typeof(_errors[device.serial]) === 'string')  {
                if(_errors[device.serial] !== device.error_label && device.error_label) {
                    if(window.debug) {
                        AlertActions.showError(device.name + ': ' + device.error_label);
                        _errors[device.serial] = device.error_label;
                    }
                }
                else if(!device.error_label) {
                    _errors[device.serial] = '';
                }
            }
            else {
                _errors[device.serial] = '';
            }
            if(defaultPrinter) {
                if(defaultPrinter.serial === device.serial) {
                    if(
                        device.st_id === DeviceConstants.status.PAUSED_FROM_RUNNING ||
                        device.st_id === DeviceConstants.status.COMPLETED ||
                        device.st_id === DeviceConstants.status.ABORTED
                    ) {
                        if(!defaultPrinterWarningShowed) {
                            let message = '';
                            if(device.st_id === DeviceConstants.status.COMPLETED) {
                                message = `${lang.device.completed}`;
                            }
                            else if(device.st_id === DeviceConstants.status.ABORTED) {
                                message = `${lang.device.aborted}`;
                            }
                            else {
                                message = `${lang.device.pausedFromError}`;
                                message = device.error_label === '' ? '' : message;
                            }

                            if(device.st_id === DeviceConstants.status.COMPLETED) {
                                AlertActions.showInfo(message, function(growl) {
                                    growl.remove(function() {});
                                    selectDevice(defaultPrinter).then(function() {
                                        GlobalActions.showMonitor(defaultPrinter);
                                    });
                                }, true);
                            }
                            else {
                                if(message !== '') {
                                    AlertActions.showWarning(message, function(growl) {
                                        growl.remove(function() {});
                                        selectDevice(defaultPrinter).then(function() {
                                            GlobalActions.showMonitor(defaultPrinter);
                                        });
                                    }, true);
                                }
                            }

                            defaultPrinterWarningShowed = true;

                            if(Config().read('notification') === '1') {
                                Notification.requestPermission((permission) => {
                                    if(permission === 'granted') {
                                        let notification = new Notification(device.name, {
                                            icon: '/img/icon-home-s.png',
                                            body: message
                                        });
                                    }
                                });
                            }
                        }
                    }
                    else {
                        if($('#growls').length > 0) {
                            AlertActions.closeNotification();
                            defaultPrinterWarningShowed = false;
                        }
                    }

                    updateNWProgress(device);
                }
            }
        });
    }

    // device names are keys to _deviceNameMap object
    function getDeviceList() {
        return _deviceNameMap;
    }

    // device are stored in array _devices
    function getAvailableDevices() {
        return _devices;
    }

    function getDeviceSettings(withBacklash) {
        let d = $.Deferred(),
            settings = {},
            _settings = ['correction', 'filament_detect', 'head_error_level', 'autoresume', 'broadcast', 'enable_cloud'];

        if(withBacklash === true) {
            _settings.push('backlash');
        }

        const worker = function*() {
            for(let i = 0; i < _settings.length; i++) {
                yield SocketMaster.addTask('getDeviceSetting', _settings[i]);
            }
        };

        const go = (result) => {
            if(!result.done) {
                result.value.then((r) => {
                    let { key, value } = r;
                    settings[key] = value;
                    go(w.next());
                });
            }
            else {
                d.resolve(settings);
            }
        };

        let w = worker();
        go(w.next());

        return d.promise();
    }

    function setDeviceSetting(name, value) {
        if(value === 'delete') {
            return SocketMaster.addTask('deleteDeviceSetting', name);
        }
        else {
            return SocketMaster.addTask('setDeviceSetting', name, value);
        }
    }

    function getDeviceInfo() {
        return SocketMaster.addTask('deviceInfo');
    }

    function downloadErrorLog() {
        return _device.actions.downloadErrorLog();
    }

    function setHeadTemperature(temperature) {
        return SocketMaster.addTask('setHeadTemperature', temperature);
    }

    function setHeadTemperatureDuringPause(temperature) {
        return SocketMaster.addTask('setHeadTemperatureDuringPause', temperature);
    }

    function getHeadStatus() {
        return SocketMaster.addTask('getHeadStatus');
    }

    function startMonitoringUsb() {
        let ws = {},
            requestingReport,
            deviceInfo = {};

        const createWebSocket = (availableUsbChannel = -1) => {
            if(availableUsbChannel === -1) { return; }
            let url = `control/usb/${availableUsbChannel}`;

            return SimpleWebsocket(url, handleMessage, handleError);
        };

        const handleMessage = (response) => {
            if(response.cmd === 'play report') {
                // specify nickname with usb
                usbDeviceReport = Object.assign(deviceInfo, response.device_status);
                clearTimeout(requestingReport);
                requestingReport = setTimeout(() => {
                    getUsbDeviceReport();
                }, 2000);
            }
        };

        const handleError = (error) => {
            usbDeviceReport = {};
            console.log('handle error', error);
        };

        const getUsbDeviceReport = () => {
            ws.send('play report');
        };

        // returns the available channel, -1 otherwise
        this.availableUsbChannel = this.availableUsbChannel || -1;
        UsbChecker((channel) => {
            channel = parseInt(channel);
            console.log(`availableUsbChannel: ${this.availableUsbChannel} ${channel}`);
            this.availableUsbChannel = channel;

            // to be replaced when redux is implemented
            Object.keys(usbEventListeners).forEach(id => {
                usbEventListeners[id](channel > 0);
            });
        });
    }

    function getAvailableUsbChannel() {
        return this.availableUsbChannel;
    }

    // id    : string, required,
    // event : function, required, will callback with ture || false
    function registerUsbEvent(id, event) {
        usbEventListeners[id] = event;
        console.log('registering event');
    }

    function unregisterUsbEvent(id) {
        delete usbEventListeners[id];
    }

    function getDeviceBySerial(serial, isUsb, callback) {
        let d = _devices.filter(d => {
            let a = d.serial === serial;
            if (isUsb) { a = a && d.source === 'h2h'; };
            return a;
        });

        if (d[0] !== null) {
            callback.onSuccess(d[0]);
            return;
        }

        if (callback.timeout > 0) {
            setTimeout(function() {
                callback.timeout -= 500;
                getDeviceBySerial(name, isUsb, callback);
            }, 500);
        }
        else {
            callback.onTimeout();
        }
    }

    // Core

    function DeviceSingleton() {
        if(_instance !== null) {
            throw new Error('Cannot instantiate more than one DeviceSingleton, use DeviceSingleton.get_instance()');
        }

        this.init();
    }

    DeviceSingleton.prototype = {
        init: function() {
            this.selectDevice                   = selectDevice;
            this.uploadToDirectory              = uploadToDirectory;
            this.go                             = go;
            this.goFromFile                     = goFromFile;
            this.resume                         = resume;
            this.pause                          = pause;
            this.stop                           = stop;
            this.quit                           = quit;
            this.quitTask                       = quitTask;
            this.kick                           = kick;
            this.getReport                      = getReport;
            this.getSelectedDevice              = getSelectedDevice;
            this.readyCamera                    = readyCamera;
            this.ls                             = ls;
            this.fileInfo                       = fileInfo;
            this.deleteFile                     = deleteFile;
            this.downloadFile                   = downloadFile;
            this.getPreviewInfo                 = getPreviewInfo;
            this.changeFilament                 = changeFilament;
            this.reconnect                      = reconnect;
            this.getDeviceByName                = getDeviceByName;
            this.getFirstDevice                 = getFirstDevice;
            this.updateFirmware                 = updateFirmware;
            this.updateToolhead                 = updateToolhead;
            this.headInfo                       = headInfo;
            this.closeConnection                = closeConnection;
            this.streamCamera                   = streamCamera;
            this.stopStreamCamera               = stopStreamCamera;
            this.calibrate                      = calibrate;
            this.home                           = home;
            this.cleanCalibration               = cleanCalibration;
            this.detectHead                     = detectHead;
            this.enterMaintainMode              = enterMaintainMode;
            this.endMaintainMode                = endMaintainMode;
            this.getDeviceList                  = getDeviceList;
            this.getDeviceSettings              = getDeviceSettings;
            this.setDeviceSetting               = setDeviceSetting;
            this.getCloudValidationCode         = getCloudValidationCode;
            this.enableCloud                    = enableCloud;
            this.getDeviceInfo                  = getDeviceInfo;
            this.downloadErrorLog               = downloadErrorLog;
            this.killSelf                       = killSelf;
            this.setHeadTemperature             = setHeadTemperature;
            this.getHeadStatus                  = getHeadStatus;
            this.startMonitoringUsb             = startMonitoringUsb;
            this.getAvailableUsbChannel         = getAvailableUsbChannel;
            this.registerUsbEvent               = registerUsbEvent;
            this.unregisterUsbEvent             = unregisterUsbEvent;
            this.changeFilamentDuringPause      = changeFilamentDuringPause;
            this.startToolheadOperation         = startToolheadOperation;
            this.endToolheadOperation           = endToolheadOperation;
            this.endLoadingDuringPause          = endLoadingDuringPause;
            this.setHeadTemperatureDuringPause  = setHeadTemperatureDuringPause;
            this.runMovementTests               = runMovementTests;
            this.getDeviceBySerial              = getDeviceBySerial;
            this.getAvailableDevices            = getAvailableDevices;

            Discover(
                'device-master',
                function(devices) {
                    devices = DeviceList(devices);
                    devices.forEach(d => {
                        _deviceNameMap[d.name] = d;
                    });
                    _devices = devices;
                    // console.log('devices', _devices);
                    _scanDeviceError(devices);

                }
            );
        }
    };

    DeviceSingleton.get_instance = function() {
        if(_instance === null) {
            _instance = new DeviceSingleton();
        }
        defaultPrinter = Config().read('default-printer');
        return _instance;
    };

    return DeviceSingleton.get_instance();
});
