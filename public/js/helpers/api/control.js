/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'jquery',
    'helpers/i18n',
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'app/constants/device-constants',
    'helpers/rsa-key',
    'app/actions/alert-actions',
    'app/actions/progress-actions'
], function($, i18n, Websocket, convertToTypedArray, DeviceConstants, rsaKey, AlertActions, ProgressActions) {
    'use strict';

    return function(uuid, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onConnect = opts.onConnect || function() {};

        let timeout = 12 * 1000,
            timmer,
            isConnected = false,
            lang = i18n.get(),
            ws,
            dedicatedWs = [],
            fileInfoWsId = 0,
            events = {
                onMessage: () => {},
                onError: opts.onError
            },
            isTimeout = () => {
                let error = {
                    'status': 'error',
                    'error': 'TIMEOUT',
                    'info': 'connection timeoout'
                };
                opts.onError(error);
            };

        const createWs = (wsOptions) => {
            let url = opts.availableUsbChannel >= 0 ? `usb/${opts.availableUsbChannel}` : uuid;
            let _ws = new Websocket({
                method: `control/${url}`,
                onMessage: (data) => {
                    switch (data.status) {
                    case 'connecting':
                        opts.onConnect(data);
                        clearTimeout(timmer);
                        timmer = setTimeout(isTimeout, timeout);
                        break;
                    case 'connected':
                        clearTimeout(timmer);
                        createDedicatedWs(fileInfoWsId);
                        opts.onConnect(data, wsOptions);
                        break;
                    default:
                        isConnected = true;
                        events.onMessage(data);
                        break;
                    }
                },
                onDebug: (response) => {
                    if(events.onDebug) {
                        events.onDebug(response);
                    }
                },
                onError: (response) => {
                    clearTimeout(timmer);
                    events.onError(response);
                },
                onFatal: (response) => {
                    clearTimeout(timmer);
                    if(response.error === 'REMOTE_IDENTIFY_ERROR') {
                        setTimeout(() => {
                            createWs();
                        }, 3 * 1000);
                    }
                    else if(response.error === 'UNKNOWN_DEVICE') {
                        ProgressActions.close();
                        AlertActions.showPopupError(
                            'unhandle-exception',
                            lang.message.unknown_device
                        );
                    }
                    else if(response.error === 'NOT_FOUND' || response.error === 'DISCONNECTED') {
                        opts.onError(response);
                    }
                    else if(response.code === 1006) {
                        ProgressActions.close();
                        AlertActions.showPopupError(
                            'NO-CONNECTION',
                            lang.message.cant_connect_to_device
                        );
                        opts.onFatal(response);
                    }
                    else {
                        clearTimeout(timmer);
                        events.onError(response);
                    }
                },
                onClose: (response) => {
                    clearTimeout(timmer);
                    isConnected = false;
                    opts.onFatal(response);
                },
                onOpen: () => {
                    _ws.send(rsaKey());
                },
                autoReconnect: false
            });

            return _ws;
        };

        // id is int
        const createDedicatedWs = (id) => {
            if(!dedicatedWs[id]) {
                dedicatedWs[id] = createWs({dedicated: true});
            }
            return dedicatedWs[id];
        };

        const useDefaultResponse = (command) => {
            let d = $.Deferred();

            events.onMessage = (response) => { d.resolve(response); };
            events.onError = (response) => { d.reject(response); };
            events.onFatal = (response) => { d.reject(response); };

            ws.send(command);
            return d.promise();
        };

        const prepareUpload = (d, data) => {
            const CHUNK_PKG_SIZE = 4096;
            let length = data.length || data.size,
                step = 0;

            events.onMessage = (response) => {
                if ('continue' === response.status) {
                    let fileReader, chunk;

                    for (let i = 0; i < length; i += CHUNK_PKG_SIZE) {
                        chunk = data.slice(i, i + CHUNK_PKG_SIZE);

                        if (data instanceof Array) {
                            chunk = convertToTypedArray(chunk, Uint8Array);
                        }

                        fileReader = new FileReader();

                        fileReader.onloadend = (e) => {
                            step++;
                            ws.send(e.target.result);
                        };

                        fileReader.readAsArrayBuffer(chunk);
                    }
                }
                else if (response.status === 'uploading') {
                    d.notify({step: response.sent, total: data.size});
                }
                else if (response.status === 'ok') {
                    d.resolve();
                }
                else if(response.status === 'error') {
                    d.reject(response);
                }
            };

            events.onError = (response) => { d.reject(response); };
            events.onFatal = (response) => { d.reject(response); };
        };

        ws = createWs();

        let ctrl = {
            connection: ws,
            mode: '',
            ls: (path) => {
                let d = $.Deferred();
                events.onMessage = (response) => {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        case 'connected':
                        default:
                            break;
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                ws.send(`file ls ${path}`);
                return d.promise();
            },

            fileInfo: (path, fileName) => {
                let d = $.Deferred(),
                    data = [],
                    _ws;

                data.push(fileName);
                _ws = createDedicatedWs(fileInfoWsId);

                events.onMessage = (response) => {
                    data.push(response);
                    if(response.status === 'ok') {
                        d.resolve(data);
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                _ws.send(`file fileinfo ${path}/${fileName}`);
                return d.promise();
            },

            report: () => {
                let d = $.Deferred(),
                    counter = 0;

                events.onMessage = (response) => {
                    if(response.status === 'ok') {
                        counter = 0;
                        d.resolve(response);
                    }
                    else {
                        // 3 consecutive error should alert restart machine
                        if(counter >= 3) {
                            d.reject(response);
                        }
                        else {
                            counter++;
                            ws.send('play report');
                        }
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                ws.send('play report');
                return d.promise();
            },

            // upload: function(filesize, print_data) {
            upload: (data, path, fileName) => {
                let d = $.Deferred();

                prepareUpload(d, data);

                if(path && fileName) {
                    fileName = fileName.replace(/ /g, '_');
                    let ext = fileName.split('.');
                    if(ext[ext.length - 1] === 'fc') {
                        ws.send(`upload application/fcode ${data.size} ${path}/${fileName}`);
                    }
                    else if(ext[ext.length - 1] === 'gcode') {
                        fileName = fileName.split('.');
                        fileName.pop();
                        fileName.push('fc');
                        fileName = fileName.join('.');
                        ws.send(`upload text/gcode ${data.size} ${path}/${fileName}`);
                    }
                }
                else {
                    ws.send(`file upload application/fcode ${data.size}`);
                }
                return d.promise();
            },

            abort: () => {
                let d = $.Deferred(),
                    counter = 0;

                const retryLength = 2000;

                const isAborted = (response) => {
                    response.device_status = response.device_status || {};
                    return response.device_status.st_id === 128 || response.device_status === 0;
                };

                const retry = (needsQuit) => {
                    counter++;
                    setTimeout(() => {
                        needsQuit ? ws.send('play abort') : ws.send('play report');
                    }, retryLength);
                };

                events.onMessage = (response) => {
                    if(counter >= 3) {
                        console.log('tried 3 times');
                        if(response.cmd === 'play report') {
                            switch(response.device_status.st_id) {
                                case 0:
                                    d.resolve();
                                    break;
                                case 64:
                                    ws.send('play quit');
                                    break;
                            }
                        }

                        d.reject(response);
                    }
                    isAborted(response) ? d.resolve() : retry(response.status !== 'ok');
                };
                events.onError = (response) => { counter >= 3 ? d.reject(response) : retry(); };
                events.onFatal = (response) => { counter >= 3 ? d.reject(response) : retry(); };

                ws.send('play abort');
                return d.promise();
            },

            start: () => { return useDefaultResponse('play start'); },

            pause: () => { return useDefaultResponse('play pause'); },

            resume: () => { return useDefaultResponse('play resume'); },

            kick: () => { return useDefaultResponse('kick'); },

            quitTask: () => {
                ctrl.mode = '';
                return useDefaultResponse('task quit');
            },

            quit: () => {
                let d = $.Deferred(),
                    counter = 0;

                const retryLength = 2000;

                const isIdle = (response) => {
                    response.device_status = response.device_status || {};
                    return response.device_status.st_id === 0;
                };

                const retry = (needsQuit) => {
                    counter++;
                    setTimeout(() => {
                        needsQuit ? ws.send('play quit') : ws.send('play report');
                    }, retryLength);
                };

                events.onMessage = (response) => { isIdle(response) ? d.resolve() : retry(response.status !== 'ok'); };
                events.onError = (response) => { counter >= 3 ? d.reject(response) : retry(); };
                events.onFatal = (response) => { counter >= 3 ? d.reject(response) : retry(); };

                ws.send('play quit');
                return d.promise();
            },

            killSelf: () => {
                let d = $.Deferred();
                dedicatedWs[fileInfoWsId].send('kick');
                dedicatedWs[fileInfoWsId].close();
                ws.send('kick');
                ws.close();
                setInterval(() => {
                    d.resolve();
                }, 500);
                return d.promise();
            },

            deviceInfo: () => { return useDefaultResponse('deviceinfo'); },

            getPreview: () => {
                let d       = $.Deferred(),
                    data    = [];

                events.onMessage = (response) => {
                    if(response.status === 'ok') {
                        data.push(response);
                        d.resolve(data);
                    }
                    else {
                        data.push(response);
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.resolve(response); };

                ws.send('play info');
                return d.promise();
            },

            select: (path, fileName) => {
                return useDefaultResponse(fileName === '' ? `play select ${path.join('/')}` : `play select ${path}/${fileName}`);
            },

            deleteFile: (fileNameWithPath) => {
                return useDefaultResponse(`file rmfile ${fileNameWithPath}`);
            },

            downloadFile: (fileNameWithPath) => {
                let d = $.Deferred(),
                    file = [];

                events.onMessage = (response) => {
                    if(response.status === 'continue') {
                        d.notify(response);
                    }
                    else {
                        file.push(response);
                    }

                    if(response instanceof Blob) {
                        d.resolve(file);
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.resolve(response); };

                ws.send(`file download ${fileNameWithPath}`);
                return d.promise();
            },

            downloadErrorLog: () => {
                let d = $.Deferred(),
                    file = [];

                events.onMessage = (response) => {
                    if(!~Object.keys(response).indexOf('completed')) {
                        file.push(response);
                    }

                    if(response instanceof Blob) {
                        d.resolve(file);
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.resolve(response); };

                ws.send('fetch_log fluxcloudd.log');
                return d.promise();
            },

            calibrate: (clean, doubleZProbe, withoutZProbe) => {
                let d = $.Deferred(),
                    errorCount = 0,
                    temp = { debug: [] },
                    doubleZProbeDone = false;

                events.onMessage = (response) => {
                    if(response.status === 'ok') {
                        if (withoutZProbe) {
                            response.debug = temp.debug;
                            d.resolve(response);
                        } else if(response.data.length > 1) {
                            ws.send('maintain zprobe');
                        } else {
                            if (doubleZProbe&& !doubleZProbeDone) {
                                doubleZProbeDone = true;
                                ws.send('maintain zprobe');
                                return;
                            }

                            response.debug = temp.debug;
                            d.resolve(response);
                        }
                    }else if(response.status === 'operating'){
                        temp.operation_info = response;
                        d.notify(response);
                    }
                };

                events.onDebug = (response) => {
                    if(response.log){
                        if(temp.operation_info){
                            if(typeof temp.operation_info.pos !== 'undefined') {
                                response.log += ' POS ' + temp.operation_info.pos;
                            }
                            else{
                                response.log += ' Z';
                            }
                        }
                        temp.debug.push(response.log);
                    }
                };

                events.onError = (response) => {
                    if(response.status === 'error') {
                        if(errorCount === 0 && response.error[0] === 'HEAD_ERROR') {
                            setTimeout(() => {
                                errorCount++;
                                if(clean === true) {
                                    ws.send('maintain calibrating clean');
                                }
                                else {
                                    ws.send('maintain calibrating');
                                }
                            }, 500);
                        }
                        else {
                            d.reject(response);
                        }
                    }
                    else {
                        d.reject(response);
                    }
                };
                events.onFatal = (response) => { d.resolve(response); };

                let cmd = 'maintain calibrating' + (clean ? ' clean' : '');
                ws.send(cmd);
                return d.promise();
            },

            zprobe: () => {
                let d = $.Deferred(),
                    errorCount = 0,
                    temp = { debug: [] };

                events.onMessage = (response) => {
                    if (response.status === 'ok') {
                        response.debug = temp.debug;
                        d.resolve(response);
                    } else if (response.status === 'operating') {
                        temp.operation_info = response;
                        d.notify(response);
                    }
                };

                events.onDebug = (response) => {
                    if(response.log){
                        if(temp.operation_info){
                            if(typeof temp.operation_info.pos !== 'undefined') {
                                response.log += ' POS ' + temp.operation_info.pos;
                            }
                            else{
                                response.log += ' Z';
                            }
                        }
                        temp.debug.push(response.log);
                    }
                };

                events.onError = (response) => {
                    if(response.status === 'error') {
                        if(errorCount === 0 && response.error[0] === 'HEAD_ERROR') {
                            setTimeout(() => {
                                errorCount++;
                                ws.send('maintain zprobe');
                            }, 500);
                        }
                        else {
                            d.reject(response);
                        }
                    }
                    else {
                        d.reject(response);
                    }
                };
                events.onFatal = (response) => { d.reject(response); };
                ws.send('maintain zprobe');
                return d.promise();
            },

            getHeadInfo: () => {
                return useDefaultResponse('maintain headinfo');
            },

            getDeviceSetting: (name) => {
                return useDefaultResponse(`config get ${name}`);
            },

            setDeviceSetting: (name, value) => {
                return useDefaultResponse(`config set ${name} ${value}`);
            },

            deleteDeviceSetting: (name) => {
                return useDefaultResponse(`config del ${name}`);
            },

            getCloudValidationCode: () => {
                return useDefaultResponse('cloud_validate_code');
            },

            enableCloud: () => {
                return useDefaultResponse('config set enable_cloud A');
            },

            /**
             * enter maintain mode
             * @param {Int} timeout - timeout (ms)
             *
             * @return {Promise}
             */
            enterMaintainMode: () => {
                let d = $.Deferred();

                events.onMessage = (response) => { setTimeout(() => {
                    ctrl.mode = 'maintain';
                    d.resolve(response);
                }, 3000); };
                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                ws.send('task maintain');
                return d.promise();
            },

            showOutline: (object_height, positions) => {
              let frames = '';
              positions.forEach(function(position) {
                let frame = [position.first,
                             position.second,
                             position.third,
                             position.fourth];
                frames += JSON.stringify(frame) + " ";
              });

              return useDefaultResponse(`laser show_outline ${object_height} ${frames}`);
            },

            endMaintainMode: () => {
                ctrl.mode = '';
                return useDefaultResponse('task quit');
            },

            startToolheadOperation: () => {
                return useDefaultResponse('play toolhead operation');
            },

            endToolheadOperation: () => {
                return useDefaultResponse('play toolhead standby');
            },

            endLoadingDuringPause: () => {
                return useDefaultResponse('play press_button');
            },

            setHeadTemperatureDuringPause: (temperature) => {
                return useDefaultResponse(`play toolhead heater 0 ${temperature}`);
            },

            /**
             * maintain home
             *
             * @return {Promise}
             */
            maintainHome: () => {
                return useDefaultResponse('maintain home');
            },

            /**
             * change filament
             * @param {String} type - [LOAD|UNLOAD]
             *
             * @return {Promise}
             */
            changeFilament: (type) => {
                let d = $.Deferred();

                const getType = (t) => {
                    return t === DeviceConstants.LOAD_FILAMENT ? 'load_filament' : 'unload_filament';
                };

                events.onMessage = (response) => {
                    response.status !== 'ok' ? d.notify(response) : d.resolve(response);
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                setTimeout(() => {
                    ws.send(`maintain ${getType(type)} 0 220`);
                }, 3000);

                return d.promise();
            },

            changeFilamentDuringPause: (type) => {
                let cmd = type === 'LOAD' ? 'load_filament' : 'unload_filament';
                return useDefaultResponse(`play ${cmd} 0`);
            },

            setHeadTemperature: (temperature) => {
                return useDefaultResponse(`maintain set_heater 0 ${temperature}`);
            },

            getHeadStatus: () => {
                return useDefaultResponse('maintain headstatus');
            },

            /**
             * update firmware
             * @param {File} file - file
             */
            fwUpdate: (file) => {
                let d = $.Deferred(),
                    blob = new Blob([file], { type: 'binary/flux-firmware' });

                events.onMessage = (response) => {
                    switch (response.status) {
                    case 'ok':
                        d.resolve(response);
                        break;
                    case 'continue':
                        d.notify(response);
                        ws.send(blob);
                        break;
                    case 'uploading':
                        response.percentage = (response.sent || 0) / blob.size * 100;
                        d.notify(response);
                        break;
                    default:
                        d.reject(response);
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                ws.send(`update_fw binary/flux-firmware ${blob.size}`);

                return d.promise();
            },

            /**
             * update toolhead firmware - device should in `Maintain mode`
             * @param {File} file - file
             */
            toolheadUpdate: (file) => {
                let d = $.Deferred(),
                    mimeType = 'binary/flux-firmware',
                    blob = new Blob([file], { type: mimeType }),
                    args = [
                        'maintain',
                        'update_hbfw',
                        'binary/fireware',
                        blob.size
                    ];

                events.onMessage = (response) => {
                    switch (response.status) {
                    case 'ok':
                        d.resolve(response);
                        break;
                    case 'continue':
                        d.notify(response);
                        ws.send(blob);
                        break;
                    case 'operating':
                    case 'uploading':
                    case 'update_hbfw':
                        response.percentage = (response.written || 0) / blob.size * 100;
                        d.notify(response);
                        break;
                    default:
                        d.reject(response);
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                ws.send(args.join(' '));
                return d.promise();
            }
        };

        ctrl.maintainClean = function(){
            return ctrl.calibrate(true);
        };

        ctrl.calibrateDoubleZProbe = function(){
            return ctrl.calibrate(true, true);
        };

        ctrl.calibrateWithoutZProbe = function(){
            return ctrl.calibrate(true, false, true);
        };

        return ctrl;
    };
});
