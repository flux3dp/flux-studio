define([
    'jquery',
    'helpers/i18n',
    'app/actions/Alert-Actions',
    'helpers/api/control',
    'app/constants/device-constants'
],function(
    $,
    i18n,
    AlertActions,
    DeviceController,
    DeviceConstants
){
    var _instance = null,
        _password = '',
        _lang,
        _status = DeviceConstants.READY,
        _device,
        _devices = [],
        _status;

    function setLanguageSource(lang) {
        _lang = lang;
    }

    function selectDevice(uuid) {

        var d = $.Deferred();
        if(_existConnection(uuid)) {
            _device = _getDeviceConnection(uuid);
            d.resolve(DeviceConstants.CONNECTED);
        }
        else {
            _device = {};
            _device.uuid = uuid;
            _device.actions = DeviceController(uuid, {
                onConnect: function(response) {
                    if(response.status.toUpperCase() === DeviceConstants.CONNECTED) {
                        d.resolve(DeviceConstants.CONNECTED);
                    }
                }
            });
            _devices.push(_device);
        }
        return d.promise();
    }

    function uploadFile(blob) {
        var d = $.Deferred();
        _device.print = _device.actions.upload(blob.size, blob, {
            onFinished: function(result) {
                log('uploadFile', result);
                d.resolve(result);
            }
        });

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
                    uploadFile(blob);
                    _status = DeviceConstants.PRINTING;
                    d.resolve(_status);
                }
                else if (_status === DeviceConstants.RUNNING) {
                    _status = DeviceConstants.RUNNING;
                    d.resolve(_status);
                }
                else if(_status === DeviceConstants.COMPLETED) {
                    _do(DeviceConstants.QUIT).then(function() {
                        uploadFile(blob);
                        _status = DeviceConstants.PRINTING;
                        d.resolve(_status);
                    });
                }
            });
        }

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

    // set functions

    function setPassword(password) {
        _password = password;
    }

    // get functions

    function getStatus() {
        if(_device === null) {
            AlertActions.showError(_lang.message.machineNotConnected);
            return $.Deferred().resolve(_lang.message.machineNotConnected).promise();
        }
        return _device.getStatus();
    }

    function getReport() {
        return _do(DeviceConstants.REPORT);
    }

    // Private Functions

    function _deviceConnected(response) {
        var d = $.Deferred();
        if(response.status === 'connected') {
            return d.resolve(DeviceConstants.CONNECTED);
        }
        return d.promise();
    }

    // function _deviceConnectFailed(ex) {
    //     console.log(ex);
    //     AlertActions.showError(ex);
    //     return $.Deferred().resolve(ex).promise();
    // }

    function _do(command) {
        var d = $.Deferred(),
            actions;

        actions =  {

            'RESUME': function() {
                _device.print.resume();
                d.resolve('');
            },

            'PAUSE': function() {
                _device.print.pause();
                d.resolve('');
            },

            'STOP': function() {
                _device.actions.abort().then(function() {
                    return _device.actions.quit();
                }).then(function() {
                    _status = DeviceConstants.READY;
                    d.resolve('');
                });
            },

            'QUIT': function() {
                return _device.actions.quit();
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
        return _status === DeviceConstants.PRINTING;
    }

    function _existConnection(uuid) {
        return _devices.some(function(d) {
            return d.uuid === uuid;
        });
    }

    function _getDeviceConnection(uuid) {
        for(var i = 0; i < _devices.length; i++) {
            if(_devices[i].uuid === uuid) {
                return _devices[i];
            }
        }
    }

    // Core

    function DeviceSingleton() {
        if(_instance !== null){
            throw new Error('Cannot instantiate more than one DeviceSingleton, use DeviceSingleton.get_instance()');
        }

        this.init();
    }

    DeviceSingleton.prototype = {
        init: function() {
            this.setLanguageSource  = setLanguageSource;
            this.selectDevice       = selectDevice;
            this.uploadFile         = uploadFile;
            this.go                 = go;
            this.resume             = resume;
            this.pause              = pause;
            this.stop               = stop;
            this.setPassword        = setPassword;
            this.getStatus          = getStatus;
            this.getReport          = getReport;
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
