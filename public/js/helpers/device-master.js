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
    'helpers/object-assign'
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
    Discover
) {
    'use strict';

    var _lang = i18n.get(),
        _instance = null,
        _password = '',
        _status = DeviceConstants.READY,
        _device,
        _devices = [],
        _errors = {};

    function selectDevice(device, deferred) {
        var d = deferred || $.Deferred(),
            uuid = device.uuid,
            goAuth = function(uuid) {
                InputLightboxActions.open('auth', {
                    caption      : sprintf(_lang.input_machine_password.require_password, _device.name),
                    inputHeader  : _lang.input_machine_password.password,
                    confirmText  : _lang.input_machine_password.connect,
                    onSubmit     : function(password) {
                        auth(uuid, password).done(function(data) {
                            selectDevice(device, d);
                        }).
                        fail(function(data) {
                            goAuth(uuid);
                        });
                    }
                });
            };

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
                    if(response.status.toUpperCase() === DeviceConstants.CONNECTED) {
                        d.resolve(DeviceConstants.CONNECTED);
                        _devices.push(_device);
                    }
                },
                onError: function(response) {
                    // TODO: shouldn't do replace
                    response.error = response.error.replace(/^.*\:\s+(\w+)$/g, '$1');

                    switch (response.error) {
                    case DeviceConstants.TIMEOUT:
                        d.resolve(DeviceConstants.TIMEOUT);
                        break;
                    case DeviceConstants.AUTH_ERROR:
                    case DeviceConstants.AUTH_FAILED:
                        goAuth(_device.uuid);
                        break;
                    }
                }
            });
        }

        return d.promise();
    }

    function auth(uuid, password) {
        ProgressActions.open(ProgressConstants.NONSTOP);

        var d = $.Deferred(),
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

    function uploadFile(blob, file, uploadPath) {
        var d = $.Deferred();

        if(uploadPath) {
            _device.actions.uploadToDirectory(blob, uploadPath, file.name).then(function(result) {
                console.log('from dm', result);
                d.resolve(result);
            });
        }
        else {
            _device.print = _device.actions.upload(blob.size, blob, {
                onFinished: function(result) {
                    d.resolve(result);
                }
            });
        }

        return d.promise();
    }

    function go(blob) {
        var d = $.Deferred();
        if(!blob) {
            d.resolve(DeviceConstants.READY);
        }
        else {
            getReport().then(function(report) {
                _status = report.st_label;
                if(_status === DeviceConstants.IDLE) {
                    _go(blob).then(function(status) {
                        d.resolve(status);
                    });
                }
                else if (_status === DeviceConstants.RUNNING) {
                    _status = DeviceConstants.RUNNING;
                    d.resolve(_status);
                }
                else if(_status === DeviceConstants.COMPLETED || _status === DeviceConstants.ABORTED) {
                    _do(DeviceConstants.QUIT).then(function() {
                        uploadFile(blob);
                        _status = DeviceConstants.RUNNING;
                        d.resolve(_status);
                    });
                }
            });
        }

        return d.promise();
    }

    function _go(blob) {
        var d = $.Deferred();
        uploadFile(blob).then(function() {
            _status = DeviceConstants.RUNNING;
            d.resolve(_status);
        });
        return d.promise();
    }

    function goFromFile(path, fileName) {
        var d = $.Deferred();
        _device.actions.select(path, fileName).then(function(selectResult) {
            if(selectResult.status.toUpperCase() === DeviceConstants.OK) {
                _device.actions.start().then(function(startResult) {
                    d.resolve(startResult);
                });
            }
            else {
                d.resolve({status: 'error'});
            }
        });
        return d.promise();
    }

    function clearConnection() {
        var d = $.Deferred();

        getReport().then(function(report) {
            if(report.st_label === DeviceConstants.COMPLETED) {
                this.quit().then(function() {
                    d.resolve(DeviceConstants.READY);
                });
            }
            else {
                d.resolve(DeviceConstants.READY);
            }
        }.bind(this));

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

    function kick() {
        return _do(DeviceConstants.KICK);
    }

    function ls(path) {
        var d = $.Deferred();
        _device.actions.ls(path).then(function(result) {
            d.resolve(result);
        });
        return d.promise();
    }

    function fileInfo(path, fileName) {
        return _device.actions.fileInfo(path, fileName);
    }

    function startCamera(callback) {
        _device.scanController = ScanController(_device.uuid, {
            onReady: function() {
                _device.cameraSource = _device.scanController.getImage(callback);
            },
            onError: function() {

            }
        });
    }

    function stopCamera() {
        if(_device.cameraSource) {
            _device.cameraSource.stop();
            _device.scanController.quit();
            _device.cameraSource = null;
        }
    }

    // set functions

    function setPassword(password) {
        _password = password;
    }

    // get functions

    function getReport() {
        return _do(DeviceConstants.REPORT);
    }

    function getSelectedDevice() {
        return _device;
    }

    function getPreviewInfo() {
        var d = $.Deferred();
        _device.actions.getPreview().then(function(result) {
            d.resolve(result);
        });
        return d.promise();
    }

    // Private Functions

    function _do(command) {
        var d = $.Deferred(),
            actions;

        actions =  {

            'RESUME': function() {
                _device.actions.resume().then(function() {
                    d.resolve('');
                });
            },

            'PAUSE': function() {
                console.log('pause hit');
                _device.actions.pause().then(function() {
                    d.resolve('');
                });
            },

            'STOP': function() {
                _device.actions.abort().then(function() {
                    _status = DeviceConstants.READY;
                    d.resolve('');
                });
            },

            'QUIT': function() {
                _device.actions.quit().then(function(result) {
                    d.resolve(result);
                });
            },

            'KICK': function() {
                _device.actions.reset().then(function(result) {
                    d.resolve(result);
                });
            },

            'REPORT': function() {
                _device.actions.report({
                    onFinished: function(report) {
                        if(typeof(report) === 'string') {
                            report = report.replace(/NaN/g,'');
                            d.resolve(JSON.parse(report));
                        }
                        else {
                            d.resolve(report);
                        }
                    }
                });
            }
        };

        actions[command]();
        return d.promise();
    }

    function _isPrinting() {
        return _status === DeviceConstants.RUNNING;
    }

    function _existConnection(uuid) {
        return _devices.some(function(d) {
            return d.uuid === uuid;
        });
    }

    function _switchDevice(uuid) {
        for(var i = 0; i < _devices.length; i++) {
            if(_devices[i].uuid === uuid) {
                return _devices[i];
            }
        }
    }

    function _watch() {
        setInterval(getReport().then(function(report) {
            console.log(report);
        }), 1000);
    }

    function _scanDeviceError(devices) {
        devices.forEach(function(device) {
            if(typeof(_errors[device.serial]) === 'string')  {
                if(_errors[device.serial] !== device.error_label && device.error_label) {
                    if(window.debug) {
                        AlertActions.showError(device.name + ': ' + device.error_label)
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
            this.selectDevice       = selectDevice;
            this.uploadFile         = uploadFile;
            this.go                 = go;
            this.goFromFile         = goFromFile;
            this.resume             = resume;
            this.pause              = pause;
            this.stop               = stop;
            this.quit               = quit;
            this.kick               = kick;
            this.setPassword        = setPassword;
            this.getReport          = getReport;
            this.getSelectedDevice  = getSelectedDevice;
            this.startCamera        = startCamera;
            this.stopCamera         = stopCamera;
            this.ls                 = ls;
            this.fileInfo           = fileInfo;
            this.getPreviewInfo     = getPreviewInfo;

            Discover(
                'device-master',
                function(devices) {
                    _scanDeviceError(devices);
                }
            );
        }
    };

    DeviceSingleton.get_instance = function() {
        if(_instance === null) {
            _instance = new DeviceSingleton();
        }
        return _instance;
    };

    return DeviceSingleton.get_instance();
});
