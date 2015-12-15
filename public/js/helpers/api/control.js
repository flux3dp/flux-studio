/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/convertToTypedArray'
], function($, Websocket, convertToTypedArray) {
    'use strict';

    return function(uuid, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onConnect = opts.onConnect || function() {};

        var timeout = 10000,
            timmer,
            isConnected = false,
            ws = new Websocket({
                method: 'control/' + uuid,
                onMessage: function(data) {
                    clearTimeout(timmer);
                    switch (data.status) {
                    case 'connecting':
                        opts.onConnect(data);
                        timmer = setTimeout(isTimeout, timeout);
                        break;
                    case 'connected':
                        opts.onConnect(data);
                        break;
                    default:
                        isConnected = true;
                        events.onMessage(data);
                        break;
                    }
                },
                // onError: opts.onError,
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
                autoReconnect: false
            }),
            lastOrder = '',
            events = {
                onMessage: function() {},
                onError: opts.onError
            },
            genericOptions = function(opts) {
                var emptyFunction = function() {};

                opts = opts || {};
                opts.onStarting = opts.onStarting || function() {};
                opts.onFinished = opts.onFinished || function() {};

                return opts;
            },
            isTimeout = function() {
                var error = {
                    "status": "error",
                    "error": "TIMEOUT",
                    "info": "connection timeoout"
                };
                opts.onError(error);
            };

        return {
            connection: ws,
            ls: function(path) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    switch (result.status) {
                        case 'connected':
                            break;
                        case 'ok':
                            d.resolve(result);
                            break;
                        default:
                            break;
                    }
                };
                events.onError = function(result) {
                    d.resolve(result);
                };
                lastOrder = 'ls';
                ws.send(lastOrder + ' ' + path);

                return d.promise();
            },
            fileInfo: function(path, fileNameWithPath, opt) {
                opts = genericOptions(opts);
                var d = $.Deferred(),
                    data = [];

                data.push(fileNameWithPath);
                lastOrder = 'fileinfo';
                ws.send(lastOrder + ' ' + path + '/' + fileNameWithPath);
                events.onMessage = function(result) {
                    if(result instanceof Blob) {
                        data.push(result);
                    }
                    switch(result.status) {
                        case 'ok':
                            d.resolve(data);
                            break;
                        default:
                            break;
                    }
                };
                events.onError = function(result) {
                    d.resolve(result);
                };

                return d.promise();
            },
            selectFile: function(filename) {
                lastOrder = 'select';
                ws.send(lastOrder + ' ' + filename);
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
            report: function(opts) {
                opts = genericOptions(opts);

                events.onMessage = function(response) {
                    opts.onFinished(response);
                };

                events.onError = function(response) {
                    opts.onFinished(response);
                };

                ws.send('report');
            },
            upload: function(filesize, print_data, opts) {
                opts = genericOptions(opts);

                var self = this,
                    CHUNK_PKG_SIZE = 4096,
                    length = print_data.length || print_data.size,
                    interrupt = function(cmd) {
                        if ('start' === lastOrder) {
                            ws.send(cmd);
                        }
                    },
                    positioning = function() {
                        self.position({
                            onFinished: function(response) {
                                if ('PlayTask' === response.location) {
                                    console.log('reporting');
                                    reporting();
                                }
                                else {
                                    console.log('do upload');
                                    doUpload();
                                }
                            }
                        });
                    },
                    reporting = function() {
                        self.report({
                            onFinished: function(response) {
                                if(typeof(response) === 'string') {
                                    try {
                                        response = JSON.parse(response);
                                    } catch (variable) {
                                        response.status = 'ERROR';
                                    } finally {
                                        response.status = response.status.toUpperCase();
                                    }
                                }
                                else {
                                    response.status = response.status.toUpperCase();
                                }

                                if (true === response.status.startsWith('COMPLETED')) {
                                    self.quit().then(function(data) {
                                        console.log('do upload 1', data);
                                        doUpload();
                                    });
                                }
                                else {
                                    console.log('do upload 2');
                                    doUpload();
                                }
                            }
                        });
                    },
                    uploading = function(data) {
                        if ('continue' === data.status) {
                            var fileReader, chunk;

                            for (var i = 0; i < length; i += CHUNK_PKG_SIZE) {
                                chunk = print_data.slice(i, i + CHUNK_PKG_SIZE);

                                if (print_data instanceof Array) {
                                    chunk = convertToTypedArray(chunk, Uint8Array);
                                }

                                fileReader = new FileReader();

                                fileReader.onloadend = function(e) {
                                    ws.send(this.result);
                                };

                                fileReader.readAsArrayBuffer(chunk);
                            }

                        }
                        else if ('ok' === data.status) {
                            self.start(opts).then(function() {
                                opts.onFinished(data);
                            });
                        }
                        else if(data.status === 'error') {
                            opts.onError(data);
                        }
                    },
                    doUpload = function() {
                        events.onMessage = uploading;
                        ws.send(lastOrder + ' application/fcode ' + filesize);
                    };

                lastOrder = 'upload';

                events.onMessage = positioning;

                doUpload();

                return {
                    pause: function() {
                        interrupt('pause');
                    },
                    resume: function() {
                        interrupt('resume');
                    },
                    abort: function() {
                        interrupt('abort');
                    }
                };
            },
            getStatus: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('position');
                lastOrder = 'status';

                return d.promise();
            },
            abort: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };
                events.onError = function(result) {
                    d.resolve(result);
                };

                ws.send('abort');
                lastOrder = 'abort';

                return d.promise();
            },
            start: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                events.onError = function(result) {
                    d.resolve(result);
                };

                ws.send('start');
                lastOrder = 'start';

                return d.promise();
            },
            pause: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                events.onError = function(result) {
                    d.resolve(result);
                };

                ws.send('pause');
                lastOrder = 'pause';

                return d.promise();
            },
            resume: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                events.onError = function(result) {
                    d.resolve(result);
                };

                ws.send('resume');
                lastOrder = 'resume';

                return d.promise();
            },
            reset: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('kick');
                lastOrder = 'kick';

                return d.promise();
            },
            quit: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                events.onError = function(result) {
                    d.resolve(result);
                }

                ws.send('quit');
                lastOrder = 'quit';

                return d.promise();
            },
            getPreview: function() {
                var d = $.Deferred(),
                    blob;

                events.onMessage = function(result) {
                    if(result instanceof Blob) {
                        d.resolve(result);
                    }
                };

                events.onError = function(result) {
                    d.resolve('');
                }

                ws.send('play info');
                lastOrder = 'play info';

                return d.promise();
            }
        };
    };
});
