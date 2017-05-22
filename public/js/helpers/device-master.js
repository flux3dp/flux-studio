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
    'helpers/device-error-handler',
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
    Sm,
    DeviceErrorHandler
) {
    'use strict';

    let lang = i18n.get(),
        SocketMaster,
        defaultPrinter,
        defaultPrinterWarningShowed = false,
        _instance = null,
        _stopChangingFilament = false,
        _stopChangingFilamentCallback,
        _selectedDevice = {},
        _deviceNameMap = {},
        _actionMap = {},
        _device,
        _cameraTimeoutTracker,
        _wasKilled = false,
        nwConsole,
        usbDeviceReport = {},
        _devices = [],
        _availableDevices = [],
        _errors = {},
        availableUsbChannel = -1,
        usbEventListeners = {},
        self = this;

    // Better select device
    function select(device, opts) {
        let d = $.Deferred();
        selectDevice(device).then((result) => {
            if (result == DeviceConstants.CONNECTED) {
                d.resolve();
            } else {
                d.reject();
            }
        });

        return d.promise();
    }

    // Deprecated!
    function selectDevice(device, deferred) {
        if (
            _selectedDevice &&
            _selectedDevice.serial === device.serial &&
            _selectedDevice.source === device.source
        ) {
            let d = $.Deferred();
            ProgressActions.close();
            d.resolve(DeviceConstants.CONNECTED);
            return d.promise();
        }

        // match the device from the newest received device list
        let latestDevice = _availableDevices.filter(d => d.serial === device.serial && d.source === device.source),
            self = this;

        Object.assign(_selectedDevice, latestDevice[0]);
        let d = deferred || $.Deferred();

        const goAuth = (uuid) => {
            ProgressActions.close();
            _selectedDevice = {};

            const handleSubmit = (password) => {
                ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.message.authenticating);

                auth(device.uuid, password).done((data) => {
                    device.plaintext_password = password;
                    selectDevice(device, d);
                })
                .fail((response) => {
                    let message = (
                        false === response.reachable ?
                        lang.select_printer.unable_to_connect :
                        lang.select_printer.auth_failure
                    );

                    goAuth(device.uuid);

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

        const createDeviceActions = (availableUsbChannel = -1, success) => {
            return DeviceController(device.uuid, {
                availableUsbChannel,
                onConnect: function(response, options) {
                    d.notify(response);

                    if (response.status.toUpperCase() === DeviceConstants.CONNECTED) {
                        if (options == null || (options && !options.dedicated)) {
                            ProgressActions.close();
                        }
                        let exist = _devices.some(dev => { return dev.uuid === device.uuid; });
                        if(!exist) {
                            _devices.push(device);
                        }
                        success(true);
                    }
                },
                onError: function(response) {
                    ProgressActions.close();
                    // TODO: shouldn't do replace
                    response.error = response.error.replace(/^.*\:\s+(\w+)$/g, '$1');
                    switch (response.error.toUpperCase()) {
                    case DeviceConstants.TIMEOUT:
                        // TODO d.reject, come on...
                        d.reject(DeviceConstants.TIMEOUT);
                        break;
                    case DeviceConstants.AUTH_ERROR:
                    case DeviceConstants.AUTH_FAILED:
                        _selectedDevice = {};

                        if (device.password) {
                            goAuth(_device.uuid);
                        }
                        else {
                            ProgressActions.open(ProgressConstants.NONSTOP, sprintf(lang.message.connectingMachine, _device.name));

                            auth(_device.uuid, '').done((data) => {
                                selectDevice(device, d);
                            })
                            .fail(() => {
                                ProgressActions.close();
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

                        if(response.error === 'NOT_FOUND' || response.error === 'DISCONNECTED') {
                            // if connected usb is the usb version of default device
                            // if(device.serial === self.usbProfile.serial) {
                            if(_devices.some(d => d.serial === device.serial)) {
                                success(false);
                                return;
                            }
                            else {
                                message = lang.message.unable_to_find_machine;
                            }
                        }

                        if(response.error === 'UNKNOWN_DEVICE') {
                            message = lang.message.unknown_device;
                        }

                        success(false);
                        AlertActions.showPopupError(
                            'unhandle-exception',
                            message
                        );
                    }
                },
                onFatal: function(response) {
                    // process fatal
                    if(!_wasKilled) {
                        _selectedDevice = {};
                        _wasKilled = false;
                    }

                    const removeTimedOutConnection = (uuid) => {
                        let newConnectedDevice = [];
                        _devices.forEach(d => {
                            if(d.uuid != uuid) {
                                newConnectedDevice.push(d);
                            }
                        });
                        _devices = newConnectedDevice;
                    }

                    removeTimedOutConnection(availableUsbChannel);
                    console.log('process fatal', response, _devices, availableUsbChannel);
                }
            });
        };

        ProgressActions.open(ProgressConstants.NONSTOP, sprintf(lang.message.connectingMachine, device.name));

        if(_existConnection(device.uuid, device.source)) {
            ProgressActions.close();
            _device = _switchDevice(device.uuid);
            SocketMaster.setWebSocket(_actionMap[device.uuid]);
            d.resolve(DeviceConstants.CONNECTED);
        }
        else {
            _device = {};
            _device.uuid = device.uuid;
            _device.source = device.source;
            _device.name = device.name;
            _device.serial = device.serial;
            delete _actionMap[device.uuid];
        }

        const initSocketMaster = () => {
            if(typeof _actionMap[device.uuid] !== 'undefined') {
                _device.actions = _actionMap[device.uuid];
                return;
            }

            SocketMaster = new Sm();
            SocketMaster.onTimeout(handleSMTimeout);

            // if usb not detected but device us using usb
            if(
                typeof self !== 'undefined' &&
                !_devices.some(d => d.addr === device.addr) &&
                // self.availableUsbChannel === -1 &&
                device.source === 'h2h'
            ) {
                device = getDeviceBySerialFromAvailableList(device.serial, false);
            }

            // if availableUsbChannel has been defined
            if(
                typeof self !== 'undefined' &&
                typeof self.availableUsbChannel !== 'undefined' &&
                device.source === 'h2h'
            ) {
                _device.actions = createDeviceActions(this.availableUsbChannel, (success) => {
                    if(success) {
                        d.resolve(DeviceConstants.CONNECTED);
                    }
                    else {
                        // createDeviceActions will auto reject with errors
                    }
                });
            }
            else {
                _device.actions = createDeviceActions(device.uuid, (success) => {
                    if(success) {
                        d.resolve(DeviceConstants.CONNECTED);
                    }
                    else {
                        // if default device wifi is not available, we use usb
                        // if(_device.serial === self.usbProfile.serial) {
                        let foundDevice;
                        _devices.forEach(d => {
                            if(d.source === 'h2h' && d.serial === _device.serial) {
                                console.log('found usb version', d);
                                foundDevice = d;
                            }
                        });
                        if(foundDevice) {
                            foundDevice.uuid = foundDevice.addr;
                            foundDevice.name = foundDevice.nickname;
                            d.resolve(DeviceConstants.CONNECTED, foundDevice);
                        }
                        else {
                            console.log('create device action failed');
                        }
                    }
                });
            }

            _actionMap[device.uuid] = _device.actions;
            SocketMaster.setWebSocket(_device.actions);
        };

        initSocketMaster();

        return d.promise();
    }

    function auth(uuid, password) {
        ProgressActions.open(ProgressConstants.NONSTOP, lang.message.authenticating);

        let d = $.Deferred(),
            opts = {
                onError: function(data) {
                    ProgressActions.close();
                    d.reject(data);
                },
                onSuccess: function(data) {
                    ProgressActions.close();
                    d.resolve(data);
                },
                onFail: function(data) {
                    ProgressActions.close();
                    d.reject(data);
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
                ProgressActions.close();
                // TODO: shouldn't do replace
                response.error = response.error.replace(/^.*\:\s+(\w+)$/g, '$1');
                switch (response.error.toUpperCase()) {
                case DeviceConstants.TIMEOUT:
                    d.resolve(DeviceConstants.TIMEOUT);
                    break;
                case DeviceConstants.AUTH_ERROR:
                case DeviceConstants.AUTH_FAILED:
                    if (device.password) {
                        goAuth(_device.uuid);
                    }
                    else {
                        ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.message.authenticating);
                        auth(_device.uuid, '').then((data) => {
                            ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, sprintf(lang.message.connectingMachine, _device.name));
                            selectDevice(device, d);
                        }).fail(() => {
                            ProgressActions.close();
                            AlertActions.showPopupError(
                                'auth-error-with-diff-computer',
                                lang.message.need_1_1_7_above
                            );
                        });
                    }
                    break;
                case DeviceConstants.MONITOR_TOO_OLD:
                    ProgressActions.close();
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
        SocketMaster.onTimeout(handleSMTimeout);
        SocketMaster.setWebSocket(_device.actions);
        return d.promise();
    }

    function handleSMTimeout(status) {
        console.log('=== sm timeout: ', status);
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
            const handleError = (error) => {
                d.reject(error);
            };

            SocketMaster.addTask('upload', data).then(() => {
                SocketMaster.addTask('start').then(handleOk).fail(handleError);
            })
            .progress(handleProgress)
            .fail(handleError);

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

        ProgressActions.open(ProgressConstants.NONSTOP, lang.message.runningTests);

        let t = setInterval(() => {
            SocketMaster.addTask('report')
            .then(r => {
                d.notify(r, t);
                let { st_id, error } = r.device_status;
                if (st_id === 64) {
                    clearInterval(t);
                    setTimeout(() => {
                        quit();
                        d.resolve();
                    }, 300);
                } else if (( st_id === 128 || st_id === 48 || st_id === 36 ) && error && error.length > 0) { // Error occured
                    clearInterval(t);
                    d.reject(error);
                } else if(st_id === 128) {
                    clearInterval(t);
                    d.reject(error);
                } else if (st_id === 0) {
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

    function quitTask(mode) {
        if (typeof mode === 'string') {
            return SocketMaster.addTask('quitTask@' + mode);
        } else {
            return SocketMaster.addTask('quitTask');
        }
    }

    function kick() {
        return _do(DeviceConstants.KICK);
    }

    function killSelf() {
        _wasKilled = true;
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

    function downloadLog(log) {
        return _device.actions.downloadLog(log);
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
        _stopChangingFilament = false;
        let d = $.Deferred();
        SocketMaster.addTask('enterMaintainMode').then(() => {
            if(!_stopChangingFilament) {
                return SocketMaster.addTask('maintainHome');
            }
        })
        .then(() => {
            if(!_stopChangingFilament) {
                return SocketMaster.addTask('changeFilament', type);
            }
        })
        .then(() => {
            if(_stopChangingFilament) {
                d.reject({ error: ['CANCEL'] });
                _stopChangingFilamentCallback();
            }
            else {
                d.resolve();
            }
        })
        .progress((response) => {
            if(_stopChangingFilament) {
                _stopChangingFilamentCallback();
            }
            else {
                d.notify(response);
            }
        })
        .fail((response) => {
            d.reject(response);
        });

        return d.promise();
    }

    function stopChangingFilament() {
        let d = $.Deferred();
        _stopChangingFilamentCallback = () => {
            d.resolve();
        };
        _stopChangingFilament = true;
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

        SocketMaster.addTask('getHeadInfo@maintain').then((response) => {
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

        killSelf().always(() => {
            selectDevice(_selectedDevice);
        });
    }

    // get functions

    function getReport() {
        return _do(DeviceConstants.REPORT);
    }

    function getSelectedDevice() {
        // retrieve the whole device information from discover.js
        let foundDevices = _availableDevices.filter(d => d.uuid === _device.uuid);

        return foundDevices.length > 0 ? foundDevices[0] : _device;
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
        return SocketMaster.addTask('getHeadInfo@maintain');
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
                let d = $.Deferred(),
                    timeout;

                SocketMaster.addTask('report').then((result) => {
                    // set timeout
                    timeout = setTimeout(() => {
                        d.reject({ status: 'fata', error: ['TIMEOUT'] });
                    }, 10 * 1000);

                    // force update st_label for a backend inconsistancy
                    let s = result.device_status;
                    if(s.st_id === DeviceConstants.status.ABORTED) {
                        s.st_label = 'ABORTED';
                    }
                    d.resolve(s);
                }).fail((error) => {
                    d.reject(error);
                }).always(() => {
                    clearTimeout(timeout);
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

    async function showOutline(object_height, positions) {
      await SocketMaster.addTask('showOutline', object_height, positions);
    }

    function calibrate(opts) {
        let d = $.Deferred(),
            debug_data = {};

        opts = opts || {};
        opts.forceExtruder = opts.forceExtruder === null ? true : opts.forceExtruder;
        opts.doubleZProbe = opts.doubleZProbe === null ? false : opts.doubleZProbe;
        opts.withoutZProbe = opts.withoutZProbe === null ? false : opts.withoutZProbe;


        const processError = (resp = {}) => {
            if (typeof resp === 'string') { resp = { error: [resp] }; }
            if (resp.error && resp.error === 'EDGE_CASE') { return; }
            DeviceErrorHandler.processDeviceMasterResponse(resp);
            AlertActions.showPopupError('device-busy', DeviceErrorHandler.translate(resp.error));
            SocketMaster.addTask('endMaintainMode');
        };

        const step1 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then((response) => {
                if(response.status === 'ok') {
                    return SocketMaster.addTask('getHeadInfo@maintain');
                }
                else {
                    _d.reject(response);
                }
            }).then((headResp) => {
                if (opts.forceExtruder) {
                    if(headResp.module === null) {
                        return $.Deferred().reject({module:null, error: ['HEAD_ERROR', 'HEAD_OFFLINE']});
                    } else if(headResp.module !== 'EXTRUDER') {
                        return $.Deferred().reject({module:'LASER', error: ['HEAD_ERROR', 'TYPE_ERROR']});
                    }
                }
                return SocketMaster.addTask('maintainHome');
            }).then((response) => {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail((error) => {
                _d.reject(error);
            });
            return _d.promise();
        };

        const step2 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask(opts.doubleZProbe ? 'calibrateDoubleZProbe@maintain' : ( opts.withoutZProbe ? 'calibrateWithoutZProbe@maintain' : 'calibrate@maintain' ) ).then((response) => {
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
            console.log(error);
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }


    function zprobe(opts) {
        let d = $.Deferred(),
            debug_data = {};

        opts = opts || {};
        opts.forceExtruder = opts.forceExtruder === null ? true : opts.forceExtruder;


        const processError = (resp = {}) => {
            if (typeof resp === 'string') { resp = { error: [resp] }; }
            if (resp.error && resp.error === 'EDGE_CASE') { return; }
            DeviceErrorHandler.processDeviceMasterResponse(resp);
            AlertActions.showPopupError('device-busy', DeviceErrorHandler.translate(resp.error));
            SocketMaster.addTask('endMaintainMode');
        };

        const step1 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then((response) => {
                if(response.status === 'ok') {
                    return SocketMaster.addTask('getHeadInfo@maintain');
                }
                else {
                    _d.reject(response);
                }
            }).then((headResp) => {
                if (opts.forceExtruder) {
                    if(headResp.module === null) {
                        return $.Deferred().reject({module:null, error: ['HEAD_ERROR', 'HEAD_OFFLINE']});
                    } else if(headResp.module !== 'EXTRUDER') {
                        return $.Deferred().reject({module:'LASER', error: ['HEAD_ERROR', 'TYPE_ERROR']});
                    }
                }
                return SocketMaster.addTask('maintainHome');
            }).then((response) => {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail((error) => {
                _d.reject(error);
            });
            return _d.promise();
        };

        const step2 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('zprobe@maintain').then((response) => {
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
            console.log(error);
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }


    function home() {
        let d = $.Deferred();

        const processError = (resp = {}) => {
            DeviceErrorHandler.processDeviceMasterResponse(resp);
            AlertActions.showPopupError('device-busy', DeviceErrorHandler.translate(resp.error));
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

        const processError = (resp = {}) => {
            DeviceErrorHandler.processDeviceMasterResponse(resp);
            AlertActions.showPopupError('device-busy', DeviceErrorHandler.translate(resp.error));
            SocketMaster.addTask('endMaintainMode');
        };

        const step1 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then(() => {
                return SocketMaster.addTask('maintainHome');
            })
            .then((response) => {
                if(response.status === 'ok') {
                    return SocketMaster.addTask('calibrate', true);
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
        return _availableDevices;
    }

    function getDeviceSettings(withBacklash, withUpgradeKit, withM666R_MMTest) {
        let d = $.Deferred(),
            settings = {},
            _settings = ['correction', 'filament_detect', 'head_error_level', 'autoresume', 'broadcast', 'enable_cloud'];

        if (withBacklash === true) {
            _settings.push('backlash');
        }

        if(withUpgradeKit) {
            _settings = [
                ..._settings,
                'camera_version',
                'plus_extrusion',
                'player_postback_url'
            ];
        }

        if (withM666R_MMTest) {
            _settings.push('leveling');
            _settings.push('movement_test');
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

        let self = this;

        UsbChecker((connectedUsbDevices) => {
            let newList = [],
                connectedUsbChannels = Object.keys(connectedUsbDevices);

            // remove old usb connection
            _devices.forEach(d => {
                if(d.source !== 'h2h' || connectedUsbChannels.indexOf(d.addr) !== -1) {
                    newList.push(d);
                }
            });

            _devices = newList;

            // add new usb connection
            connectedUsbChannels.forEach(c => {
                // if not exist, add
                if(!_devices.some(d => d.addr === connectedUsbChannels)) {
                    // if profile not exist, we grab from discover
                    // if usb is plugged before FS starts, it'll appear in discover list
                    if(connectedUsbDevices[c].profile) {
                        _devices.push(connectedUsbDevices[c].profile);
                    }
                    else {
                        _availableDevices.forEach(ad => {
                            if(ad.source === 'h2h' && ad.addr === c) {
                                _devices.push(ad);
                            }
                        })
                    }
                }
            });

            // to be replaced when redux is implemented
            // notify if usb is unplugged
            if(_device && _device.source === 'h2h') {
                Object.keys(usbEventListeners).forEach(id => {
                    usbEventListeners[id](connectedUsbChannels.some(c => c == _device.uuid));
                });
            }
        });
    }

    function getAvailableUsbChannel() {
        console.log('getting availableUsbChannel');
        // return this.availableUsbChannel;
    }

    // id    : string, required,
    // event : function, required, will callback with ture || false
    function registerUsbEvent(id, event) {
        usbEventListeners[id] = event;
    }

    function unregisterUsbEvent(id) {
        delete usbEventListeners[id];
    }

    function getDeviceBySerial(serial, isUsb, callback) {
        let matchedDevice = _availableDevices.filter(d => {
            let a = d.serial === serial;
            if (isUsb) { a = a && d.source === 'h2h'; };
            return a;
        });

        if (matchedDevice.length > 0) {
            console.log('Found serial device' , matchedDevice[0], matchedDevice);
            callback.onSuccess(matchedDevice[0]);
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

    function getDeviceBySerialFromAvailableList(serial, isUsb = false) {
        let matchedDevice = _availableDevices.filter(device => {
            let a = device.serial === serial;
            if (isUsb) { a = a && device.source === 'h2h'; };
            return a;
        });

        return matchedDevice[0];
    }

    function usbDefaultDeviceCheck(device) {
        console.log('usbDefaultDeviceCheck', device);
        if(device.source !== 'h2h') {
            return device;
        }

        // if(this.availableUsbChannel !== device.addr) {
        if(!_devices.some(d => d.addr === device.addr)) {
            // get wifi version instead of h2h
            let dev = _availableDevices.filter(_dev => _dev.serial === device.serial);
            if(dev[0]) {
                console.log(dev[0]);
                return dev[0];
            }
        }
        else {
            return device;
        }
    }

    function existDevice(serial) {
        let found = _availableDevices.filter(device => {
            return device.serial === serial;
        });

        return found.length > 0;
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
            this.select                         = select;
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
            this.showOutline                    = showOutline;
            this.zprobe                         = zprobe;
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
            this.downloadLog                    = downloadLog;
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
            this.usbDefaultDeviceCheck          = usbDefaultDeviceCheck;
            this.stopChangingFilament           = stopChangingFilament;
            this.existDevice                    = existDevice;

            Discover(
                'device-master',
                function(devices) {
                    devices = DeviceList(devices);
                    devices.forEach(d => {
                        _deviceNameMap[d.name] = d;
                    });
                    _availableDevices = devices;
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
