/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'app/constants/device-constants',
    'helpers/rsa-key'
], function($, Websocket, convertToTypedArray, DeviceConstants, rsaKey) {
    'use strict';

    return function(uuid, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onConnect = opts.onConnect || function() {};

        let timeout = 10000,
            timmer,
            isConnected = false,
            ws,
            lastOrder = '',
            dedicatedWs = [],
            fileInfoWsId = 0,
            events = {
                onMessage: function() {},
                onError: opts.onError
            },
            genericOptions = function(opts) {
                let emptyFunction = function() {};

                opts = opts || {};
                opts.onStarting = opts.onStarting || function() {};
                opts.onFinished = opts.onFinished || function() {};

                return opts;
            },
            isTimeout = function() {
                let error = {
                    'status': 'error',
                    'error': 'TIMEOUT',
                    'info': 'connection timeoout'
                };
                opts.onError(error);
            };

        function createWs() {
            let _ws = new Websocket({
                method: 'control/' + uuid,
                onMessage: function(data) {
                    switch (data.status) {
                    case 'connecting':
                        opts.onConnect(data);
                        clearTimeout(timmer);
                        timmer = setTimeout(isTimeout, timeout);
                        break;
                    case 'connected':
                        clearTimeout(timmer);
                        createDedicatedWs(fileInfoWsId);
                        opts.onConnect(data);
                        break;
                    default:
                        isConnected = true;
                        events.onMessage(data);
                        break;
                    }
                },
                onError: function(response) {
                    events.onError(response);
                },
                onFatal: function(response) {
                    clearTimeout(timmer);
                    events.onError(response);
                },
                onClose: function(response) {
                    isConnected = false;
                },
                onOpen: function() {
                    _ws.send(rsaKey());
                },
                autoReconnect: false
            });

            return _ws;
        }

        // id is int
        function createDedicatedWs(id) {
            if(!dedicatedWs[id]) {
                dedicatedWs[id] = createWs();
            }
            return dedicatedWs[id];
        }

        const useDefaultResponse = (command) => {
            let d = $.Deferred();

            events.onMessage = (response) => { d.resolve(response); };
            events.onError = (response) => { d.reject(response); };
            events.onFatal = (response) => { d.reject(response); };

            ws.send(command);
            return d.promise();
        };

        ws = createWs();

        return {
            connection: ws,
            ls: (path) => {
                let d = $.Deferred();
                events.onMessage = (result) => {
                    switch (result.status) {
                        case 'ok':
                            d.resolve(result);
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

            fileInfo: function(path, fileName) {
                let d = $.Deferred(),
                    data = [],
                    _ws;

                data.push(fileName);
                _ws = createDedicatedWs(fileInfoWsId);

                events.onMessage = function(result) {
                    if(result instanceof Blob || data.length === 2) {
                        data.push(result);
                    }

                    if(result.status === 'ok') {
                        d.resolve(data);
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                _ws.send(`file fileinfo ${path}/${fileName}`);
                return d.promise();
            },

            position: function(opts) {
                opts = genericOptions(opts);

                events.onMessage = function(response) {
                    if ('position' === response.status) {
                        opts.onFinished(response);
                    }
                };

                ws.send('position');
            },

            report: function() {
                // return useDefaultResponse('play report');
                let d = $.Deferred(),
                    counter = 0;

                events.onMessage = function(response) {
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

            upload: function(filesize, print_data) {
                let d = $.Deferred(),
                    CHUNK_PKG_SIZE = 4096,
                    length = print_data.length || print_data.size,
                    uploading,
                    doUpload,
                    step = 0,
                    total = parseInt(filesize / CHUNK_PKG_SIZE);

                uploading = (result) => {
                    if ('continue' === result.status) {
                        let fileReader, chunk;

                        for (let i = 0; i < length; i += CHUNK_PKG_SIZE) {
                            chunk = print_data.slice(i, i + CHUNK_PKG_SIZE);

                            if (print_data instanceof Array) {
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
                    else if (result.status === 'uploading') {
                        d.notify({step: result.sent, total: filesize});
                    }
                    else if (result.status === 'ok') {
                        d.resolve();
                    }
                    else if(result.status === 'error') {
                        d.reject(result);
                    }
                };

                doUpload = () => {
                    events.onMessage = uploading;
                    ws.send(`file upload application/fcode ${filesize}`);
                };

                doUpload();
                return d.promise();
            },
            uploadToDirectory: function(blob, uploadPath, fileName, callback) {
                let d = $.Deferred(),
                    CHUNK_PKG_SIZE = 4096;

                let step = 0,
                    total = parseInt(blob.size / CHUNK_PKG_SIZE);


                events.onMessage = function(result) {
                    switch (result.status) {
                    case 'ok':
                        d.resolve(result);
                        break;
                    case 'continue':
                        let fileReader,
                            chunk,
                            length = blob.length || blob.size;

                        for (let i = 0; i < length; i += CHUNK_PKG_SIZE) {
                            chunk = blob.slice(i, i + CHUNK_PKG_SIZE);

                            if (blob instanceof Array) {
                                chunk = convertToTypedArray(chunk, Uint8Array);
                            }

                            fileReader = new FileReader();

                            fileReader.onloadend = function(e) {
                                ws.send(this.result);
                                callback(step++, total);
                            };

                            fileReader.readAsArrayBuffer(chunk);
                        }

                        break;
                    default:
                        // TODO: do something?
                        break;
                    }
                };

                events.onError = function(error) {
                    console.log(error);
                };

                fileName = fileName.replace(/ /g, '_');
                let ext = fileName.split('.');
                if(ext[ext.length - 1] === 'fc') {

                    ws.send(`upload application/fcode ${blob.size} ${uploadPath}/${fileName}`);
                }
                else if(ext[ext.length - 1] === 'gcode') {
                    fileName = fileName.split('.');
                    fileName.pop();
                    fileName.push('fc');
                    fileName = fileName.join('.');
                    ws.send(`upload text/gcode ${blob.size} ${uploadPath}/${fileName}`);
                }

                return d.promise();
            },
            getStatus: function() {
                let d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('position');
                lastOrder = 'status';

                return d.promise();
            },
            abort: function() {
                return useDefaultResponse('play abort');
            },
            start: function() {
                return useDefaultResponse('play start');
            },
            pause: function() {
                return useDefaultResponse('play pause');
            },
            resume: function() {
                return useDefaultResponse('play resume');
            },
            kick: function() {
                return useDefaultResponse('kick');
            },
            quitTask: function() {
                return useDefaultResponse('task quit');
            },
            quit: function() {
                let d = $.Deferred(),
                    counter = 0;

                const retryLength = 2000;

                const isIdle = (result) => {
                    result.device_status = result.device_status || {};
                    return result.device_status.st_id === 0;
                };

                const retry = () => {
                    counter++;
                    setTimeout(() => {
                        ws.send('play report');
                    }, retryLength);
                };

                events.onMessage = (result) => { isIdle(result) ? d.resolve() : retry(); };
                events.onError = (error) => { counter >= 3 ? d.reject(error) : retry(); };
                events.onFatal = (error) => { counter >= 3 ? d.reject(error) : retry(); };

                ws.send('play quit');
                return d.promise();
            },
            getPreview: function() {
                let d       = $.Deferred(),
                    data    = [];

                events.onMessage = function(result) {
                    if(result.status === 'ok') {
                        data.push(result);
                        d.resolve(data);
                    }
                    else {
                        data.push(result);
                    }
                };

                events.onError = (error) => { d.reject(error); };
                events.onFatal = (error) => { d.resolve(error); };

                ws.send('play info');
                return d.promise();
            },
            select: function(path, fileName) {
                return useDefaultResponse(fileName === '' ? `play select ${path.join('/')}` : `play select ${path}/${fileName}`);
            },
            deleteFile: function(fileNameWithPath) {
                return useDefaultResponse(`file rmfile ${fileNameWithPath}`);
            },

            downloadFile: function(fileNameWithPath) {
                let d = $.Deferred(),
                    file = [];

                events.onMessage = function(result) {
                    if(result.status === 'continue') {
                        d.notify(result);
                    }
                    else {
                        file.push(result);
                    }

                    if(result instanceof Blob) {
                        d.resolve(file);
                    }
                };

                events.onError = (error) => { d.reject(error); };
                events.onFatal = (error) => { d.resolve(error); };

                ws.send(`file download ${fileNameWithPath}`);
                return d.promise();
            },

            calibrate: function() {
                let d = $.Deferred();

                events.onMessage = function(result) {
                    if(result.status === 'ok') {
                        if(result.task === 'maintain') {
                            ws.send('maintain home');
                        }
                        else if(result.data) {
                            ws.send('task quit');
                        }
                        else if(result.task === '') {
                            d.resolve(result);
                        }
                        else {
                            ws.send(`maintain calibrating`);
                        }
                    }
                    else if(result.status === 'error') {
                        d.resolve(result.error || 'error');
                    };
                };

                events.onError = (error) => { d.reject(error); };
                events.onFatal = (error) => { d.resolve(error); };

                ws.send(`task maintain`);

                return d.promise();
            },

            /**
             * enter maintain mode
             * @param {Int} timeout - timeout (ms)
             *
             * @return {Promise}
             */
            enterMaintainMode: function(timeout) {
                let d = $.Deferred(),
                    timer;

                timeout = timeout || -1;

                events.onMessage = (result) => {
                    clearTimeout(timer);

                    if ('ok' === result.status) {
                        d.resolve(result);
                    }
                    else {
                        d.reject(result);
                    }
                };

                events.onError = (error) => {
                    clearTimeout(timer);
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    clearTimeout(timer);
                    d.reject(error);
                };

                ws.send('task maintain');

                if (-1 < timeout) {
                    timer = setTimeout(function() {
                        d.reject({
                            status: 'error',
                            error: 'TIMEOUT'
                        });
                    }, timeout); // magic timeout duration
                }

                return d.promise();
            },

            /**
             * maintain home
             *
             * @return {Promise}
             */
            maintainHome: function() {
                let d = $.Deferred();

                events.onMessage = (result) => {
                    switch (result.status) {
                    case 'ok':
                        d.resolve(result);
                        break;
                    case 'operating':
                        // ignore. (When the toolhead is `Home`. This status wouldn't show up)
                        break;
                    default:
                        d.reject(result);
                    }
                };

                events.onError = (error) => { d.reject(error); };
                events.onFatal = (error) => { d.reject(error); };

                ws.send('maintain home');

                return d.promise();
            },

            /**
             * change filament
             * @param {String} type - [LOAD|UNLOAD]
             *
             * @return {Promise}
             */
            changeFilament: function(type) {
                let d = $.Deferred(),
                    TIMEOUT = 30000,
                    typeMap = {},
                    timer,
                    args,
                    rejectHandler = (response) => {
                        d.reject(response);
                    };

                typeMap[DeviceConstants.LOAD_FILAMENT]   = 'load_filament';
                typeMap[DeviceConstants.UNLOAD_FILAMENT] = 'unload_filament';

                this.enterMaintainMode(TIMEOUT).pipe((response) => {
                    return this.maintainHome();
                }, rejectHandler)
                .pipe((response) => {

                    events.onMessage = (response) => {
                        clearTimeout(timer);
                        timer = setTimeout(() => {
                            d.reject({
                                status: 'error',
                                error: 'TIMEOUT'
                            });
                        }, 30000); // magic timeout duration

                        if ('ok' === response.status) {
                            d.resolve(response);
                        }
                        else if (-1 < ['loading', 'unloading'].indexOf(response.status.toLowerCase())) {
                            d.notify(response);
                        }
                        else if (response.status.toLowerCase() === 'operating') {
                            // ignore operating message
                        }
                        else {
                            d.resolve(response);
                        }
                    };

                    events.onError = (error) => {
                        clearTimeout(timer);
                        d.reject(error);
                    };

                    events.onFatal = (error) => {
                        clearTimeout(timer);
                        d.reject(error);
                    };

                    args = [
                        'maintain',
                        typeMap[type],
                        0, // extruder id
                        220 // temperature
                    ];

                    // MAGIC DELAY NUMBER for 3s!!!
                    setTimeout(
                        () => { ws.send(args.join(' ')); },
                        3000
                    );

                }, rejectHandler);

                return d.promise();
            },

            /**
             * update firmware
             * @param {File} file - file
             */
            fwUpdate: function(file) {
                let d = $.Deferred(),
                    mimeType = 'binary/flux-firmware',
                    blob = new Blob([file], { type: mimeType }),
                    args = [
                        'update_fw',
                        'binary/flux-firmware',  // mimeType
                        blob.size
                    ];

                events.onMessage = (result) => {
                    switch (result.status) {
                    case 'ok':
                        d.resolve(result);
                        break;
                    case 'continue':
                        d.notify(result);
                        ws.send(blob);
                        break;
                    case 'uploading':
                        result.percentage = (result.sent || 0) / blob.size * 100;
                        d.notify(result);
                        break;
                    default:
                        d.reject(result);
                    }
                };

                events.onError = (error) => { d.reject(error); };
                events.onFatal = (error) => { d.reject(error); };

                ws.send(args.join(' '));

                return d.promise();
            },

            /**
             * update toolhead firmware - device should in `Maintain mode`
             * @param {File} file - file
             */
            toolheadUpdate: function(file) {
                let d = $.Deferred(),
                    mimeType = 'binary/flux-firmware',
                    blob = new Blob([file], { type: mimeType }),
                    args = [
                        'maintain',
                        'update_hbfw',
                        'binary/fireware',
                        blob.size
                    ];

                events.onMessage = (result) => {
                    switch (result.status) {
                    case 'ok':
                        d.resolve(result);
                        break;
                    case 'continue':
                        d.notify(result);
                        ws.send(blob);
                        break;
                    case 'operating':
                    case 'uploading':
                    case 'update_hbfw':
                        result.percentage = (result.written || 0) / blob.size * 100;
                        d.notify(result);
                        break;
                    default:
                        d.reject(result);
                    }
                };

                events.onError = (error) => { d.reject(error); };
                events.onFatal = (error) => { d.reject(error); };

                ws.send(args.join(' '));
                return d.promise();
            },

            /**
             * fetch toolhead info
             *
             * @return Promise
             */
            headinfo: function() {
                let d = $.Deferred(),
                    args = [
                        'task',
                        'maintain'
                    ],
                    tryLimit = 4,
                    sendHeadInfoCommand = () => {
                        args = [
                            'maintain',
                            'headinfo'
                        ];

                        // MAGIC delay
                        setTimeout(
                            () => { tryLimit -= 1; ws.send(args.join(' ')); },
                            4000
                        );
                    };

                events.onMessage = (result) => {
                    switch (result.status) {
                    case 'ok':
                        if ('maintain' === result.task) {
                            sendHeadInfoCommand();
                        }
                        else {
                            if (0 < tryLimit && 'N/A' === (result.head_module || 'N/A')) {
                                sendHeadInfoCommand();
                            }
                            else {
                                d.resolve(result);
                            }
                        }
                        break;
                    default:
                        d.reject(result);
                    }
                };

                events.onError = (error) => { d.reject(error); };
                events.onFatal = (error) => { d.reject(error); };

                ws.send(args.join(' '));
                return d.promise();
            }
        };
    };
});
