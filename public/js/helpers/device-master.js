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
    'helpers/api/touch',
    'helpers/api/discover',
    'helpers/api/config',
    'app/actions/global-actions',
    'app/constants/input-lightbox-constants',
    'helpers/device-list',
    'helpers/api/camera',
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
    Touch,
    Discover,
    Config,
    GlobalActions,
    InputLightBoxConstants,
    DeviceList,
    Camera,
    SocketMaster
) {
    'use strict';

    let lang = i18n.get(),
        thisProgress,
        lastProgress,
        defaultPrinter,
        defaultPrinterWarningShowed = false,
        _instance = null,
        _selectedDevice = {},
        _deviceNameMap = {},
        _device,
        _cameraTimeoutTracker,
        nwConsole,
        _devices = [],
        _errors = {};

    function selectDevice(device, deferred) {
        Object.assign(_selectedDevice, device);
        let d = deferred || $.Deferred(),
            uuid = device.uuid,
            goAuth = function(uuid) {
                ProgressActions.close();
                InputLightboxActions.open('auth', {
                    caption      : sprintf(lang.input_machine_password.require_password, _device.name),
                    inputHeader  : lang.input_machine_password.password,
                    confirmText  : lang.input_machine_password.connect,
                    type: InputLightBoxConstants.TYPE_PASSWORD,
                    onSubmit     : function(password) {
                        ProgressActions.open(ProgressConstants.NONSTOP);

                        auth(uuid, password).always(() => {
                            ProgressActions.close();
                        }).done((data) => {
                            device.plaintext_password = password;
                            selectDevice(device, d);
                        }).fail((response) => {
                            let message = (
                                false === response.reachable ?
                                lang.select_printer.unable_to_connect :
                                lang.select_printer.auth_failure
                            );

                            goAuth(uuid);

                            AlertActions.showPopupError('device-auth-fail', message);
                        });
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
            _device.name = device.name;
            _device.actions = DeviceController(uuid, {
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
                }
            });
        }

        SocketMaster.setWebSocket(_device.actions);

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

    function resume() {
        return _do(DeviceConstants.RESUME);
    }

    function pause() {
        return _do(DeviceConstants.PAUSE);
    }

    function stop() {
        return _do(DeviceConstants.STOP);
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
        SocketMaster.addTask('enterMaintainMode').then(() => {
            return SocketMaster.addTask('maintainHome');
        }).then(() => {
            return SocketMaster.addTask('changeFilament', type);
        }).then(() => {
            d.resolve();
        }).progress((progress) => {
            d.notify(progress);
        }).fail((error) => {
            d.reject(error);
        });

        return d.promise();
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
        for(let i in _deviceNameMap) {
            console.log('get first device',i, _deviceNameMap);
            return i;
        }
    }

    function getDeviceByName(name) {
        return _deviceNameMap[name];
    }

    function getDeviceByNameAsync(name, config) {
        if(getDeviceByName(name)){
            config.onSuccess(getDeviceByName(name));
            return;
        }
        if(config.timeout > 0){
            setTimeout(function(){
                config.timeout -= 500;
                getDeviceByNameAsync(name, config);
            },500);
        }
        else{
            config.onTimeout();
        }
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

    function _existConnection(uuid) {
        return _devices.some(function(d) {
            return d.uuid === uuid;
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
            timeToReset = 20000;

        const initCamera = () => {
            _device.camera = Camera(uuid);
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

        const step2 = () => {
            let _d = $.Deferred();
            SocketMaster.addTask('calibrate').then((response) => {
                console.log("calibrate resp", response)
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
                                AlertActions.showWarning(message, function(growl) {
                                    growl.remove(function() {});
                                    selectDevice(defaultPrinter).then(function() {
                                        GlobalActions.showMonitor(defaultPrinter);
                                    });
                                }, true);
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

    // Core

    function DeviceSingleton() {
        if(_instance !== null) {
            throw new Error('Cannot instantiate more than one DeviceSingleton, use DeviceSingleton.get_instance()');
        }

        this.init();
    }

    DeviceSingleton.prototype = {
        init: function() {
            this.selectDevice           = selectDevice;
            this.uploadToDirectory      = uploadToDirectory;
            this.go                     = go;
            this.goFromFile             = goFromFile;
            this.resume                 = resume;
            this.pause                  = pause;
            this.stop                   = stop;
            this.quit                   = quit;
            this.quitTask               = quitTask;
            this.kick                   = kick;
            this.getReport              = getReport;
            this.getSelectedDevice      = getSelectedDevice;
            this.readyCamera            = readyCamera;
            this.ls                     = ls;
            this.fileInfo               = fileInfo;
            this.deleteFile             = deleteFile;
            this.downloadFile           = downloadFile;
            this.getPreviewInfo         = getPreviewInfo;
            this.changeFilament         = changeFilament;
            this.reconnect              = reconnect;
            this.getDeviceByName        = getDeviceByName;
            this.getDeviceByNameAsync   = getDeviceByNameAsync;
            this.getFirstDevice         = getFirstDevice;
            this.updateFirmware         = updateFirmware;
            this.updateToolhead         = updateToolhead;
            this.headInfo               = headInfo;
            this.closeConnection        = closeConnection;
            this.streamCamera           = streamCamera;
            this.stopStreamCamera       = stopStreamCamera;
            this.calibrate              = calibrate;
            this.home                   = home;
            this.cleanCalibration       = cleanCalibration;
            this.detectHead             = detectHead;
            this.enterMaintainMode      = enterMaintainMode;
            this.endMaintainMode        = endMaintainMode;

            Discover(
                'device-master',
                function(devices) {
                    devices = DeviceList(devices);
                    for(let i in devices) {
                        _deviceNameMap[devices[i].name] = devices[i];
                    }
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
