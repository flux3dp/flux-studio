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

        const createWs = () => {
            let _ws = new Websocket({
                method: 'control/' + uuid,
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
                        opts.onConnect(data);
                        break;
                    default:
                        isConnected = true;
                        events.onMessage(data);
                        break;
                    }
                },
                onError: (response) => {
                    events.onError(response);
                },
                onFatal: (response) => {
                    clearTimeout(timmer);
                    events.onError(response);
                },
                onClose: (response) => {
                    isConnected = false;
                },
                onOpen: () => {
                    _ws.send(rsaKey());
                },
                autoReconnect: false
            });

            return _ws;
        }

        // id is int
        const createDedicatedWs = (id) => {
            if(!dedicatedWs[id]) {
                dedicatedWs[id] = createWs();
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
        }

        ws = createWs();

        return {
            connection: ws,
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
                    if(response instanceof Blob || data.length === 2) {
                        data.push(response);
                    }

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
                let d = $.Deferred(),
                    CHUNK_PKG_SIZE = 4096,
                    length = data.length || data.size,
                    uploading,
                    step = 0;

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

            abort: () => { return useDefaultResponse('play abort'); },

            start: () => { return useDefaultResponse('play start'); },

            pause: () => { return useDefaultResponse('play pause'); },

            resume: () => { return useDefaultResponse('play resume'); },

            kick: () => { return useDefaultResponse('kick'); },

            quitTask: () => { return useDefaultResponse('task quit'); },

            quit: () => {
                let d = $.Deferred(),
                    counter = 0;

                const retryLength = 2000;

                const isIdle = (response) => {
                    response.device_status = response.device_status || {};
                    return response.device_status.st_id === 0;
                };

                const retry = () => {
                    counter++;
                    setTimeout(() => {
                        ws.send('play report');
                    }, retryLength);
                };

                events.onMessage = (response) => { isIdle(response) ? d.resolve() : retry(); };
                events.onError = (response) => { counter >= 3 ? d.reject(response) : retry(); };
                events.onFatal = (response) => { counter >= 3 ? d.reject(response) : retry(); };

                ws.send('play quit');
                return d.promise();
            },

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

            calibrate: () => {
                let d = $.Deferred();

                events.onMessage = (response) => {
                    if(response.status === 'ok') {
                        if(response.task === 'maintain') {
                            ws.send('maintain home');
                        }
                        else if(response.data) {
                            ws.send('task quit');
                        }
                        else if(response.task === '') {
                            d.resolve(response);
                        }
                        else {
                            ws.send(`maintain calibrating`);
                        }
                    }
                    else if(response.status === 'error') {
                        d.resolve(response.error || 'error');
                    };
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.resolve(response); };

                ws.send(`task maintain`);

                return d.promise();
            },

            /**
             * enter maintain mode
             * @param {Int} timeout - timeout (ms)
             *
             * @return {Promise}
             */
            enterMaintainMode: (timeout) => {
                let d = $.Deferred(),
                    timer;

                timeout = timeout || -1;

                events.onMessage = (response) => {
                    clearTimeout(timer);

                    if ('ok' === response.status) {
                        d.resolve(response);
                    }
                    else {
                        d.reject(response);
                    }
                };

                events.onError = (response) => {
                    clearTimeout(timer);
                    d.reject(response);
                };

                events.onFatal = (response) => {
                    clearTimeout(timer);
                    d.reject(response);
                };

                ws.send('task maintain');

                if (-1 < timeout) {
                    timer = setTimeout(() => {
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
            maintainHome: () => {
                let d = $.Deferred();

                events.onMessage = (response) => {
                    switch (response.status) {
                    case 'ok':
                        d.resolve(response);
                        break;
                    case 'operating':
                        // ignore. (When the toolhead is `Home`. This status wouldn't show up)
                        break;
                    default:
                        d.reject(response);
                    }
                };

                events.onError = (response) => { d.reject(response); };
                events.onFatal = (response) => { d.reject(response); };

                ws.send('maintain home');

                return d.promise();
            },

            /**
             * change filament
             * @param {String} type - [LOAD|UNLOAD]
             *
             * @return {Promise}
             */
            changeFilament: (type) => {
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

                    events.onError = (response) => {
                        clearTimeout(timer);
                        d.reject(response);
                    };

                    events.onFatal = (response) => {
                        clearTimeout(timer);
                        d.reject(response);
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
            fwUpdate: (file) => {
                let d = $.Deferred(),
                    mimeType = 'binary/flux-firmware',
                    blob = new Blob([file], { type: mimeType }),
                    args = [
                        'update_fw',
                        'binary/flux-firmware',  // mimeType
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

                ws.send(args.join(' '));

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
            },

            /**
             * fetch toolhead info
             *
             * @return Promise
             */
            headinfo: () => {
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

                events.onMessage = (response) => {
                    switch (response.status) {
                    case 'ok':
                        if ('maintain' === response.task) {
                            sendHeadInfoCommand();
                        }
                        else {
                            if (0 < tryLimit && 'N/A' === (response.head_module || 'N/A')) {
                                sendHeadInfoCommand();
                            }
                            else {
                                d.resolve(response);
                            }
                        }
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
    };
});
