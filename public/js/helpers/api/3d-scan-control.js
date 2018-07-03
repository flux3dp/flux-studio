/**
 * API 3d scan control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-control
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/file-system',
    'helpers/point-cloud',
    'helpers/rsa-key'
], function($, Websocket, fileSystem, PointCloudHelper, rsaKey) {
    'use strict';

    let stopImage = false;

    return function(uuid, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onReady = opts.onReady || function() {};
        opts.printer = opts.printer || {}

        var ws,
            timeoutTimer,
            errorHandler = function(data) {
                isReady = true;
                clearTimeout(connectingTimer);
                opts.onError(data);
            },
            isReady = false,
            events = {
                onMessage: function() {}
            },
            genericSender = function(command) {
                if(stopImage && command === 'image') { return; }
                return checkDeviceIsReady().then(function() {
                    ws.send(command);
                    isReady = false;
                });
            },
            checkDeviceIsReady = function() {
                var $deferred = $.Deferred(),
                    startTime = (new Date()).getTime(),
                    currentTime,
                    readyTimer = setInterval(function() {
                        currentTime = (new Date()).getTime();

                        if (true === isReady) {
                            $deferred.resolve();
                            clearInterval(readyTimer);
                        }

                        if (false === isReady && TIMEOUT <= (currentTime - startTime)) {
                            $deferred.reject(timeoutResponse);
                            clearInterval(readyTimer);
                        }
                    }, 0);

                return $deferred.promise();
            },
            imageCommand = {
                IMAGE : 'image', // start getting image
                STOP  : 'stop'   // stop getting image
            },
            scanCommand = {
                RESOLUTION : 'resolution', // set resolution
                SCAN       : 'scan', // scan getting start
                FINISH     : 'finish'   // scan finish
            },
            timeoutResponse = { status: 'error', message: 'TIMEOUT' },
            TIMEOUT = 10000,
            $imageDeferred = $.Deferred(),
            $scanDeferred = $.Deferred(),
            connectingTimer,
            stopGettingImage = function() {
                stopImage = true;
                return $imageDeferred.notify({ status: imageCommand.STOP });
            },
            renewImageDeferred = function() {
                $imageDeferred = $.Deferred();

                $imageDeferred.progress(function(response) {
                    if (imageCommand.STOP === response.status) {
                        $imageDeferred.resolve({ status: imageCommand.STOP });
                    }
                });
            };

        renewImageDeferred();

        let url = opts.availableUsbChannel >= 0 && opts.availableUsbChannel !==null ? `usb/${opts.availableUsbChannel}` : uuid;
        ws = new Websocket({
            method: `3d-scan-control/${url}`,
            ignoreAbnormalDisconnect: true,
            autoReconnect: true,
            onMessage: function(data) {
                switch (data.status) {
                case 'connecting':
                    clearTimeout(connectingTimer);
                    connectingTimer = setTimeout(function() {
                        opts.onError(timeoutResponse);
                    }, TIMEOUT);
                    break;
                case 'ready':
                    clearTimeout(connectingTimer);
                    isReady = true;
                    console.log('scan control on open ', opts.printer);
                    if (opts.printer && opts.printer.model === 'delta-1p') {
                        ws.send('turn_on_hd');
                    }
                    opts.onReady();
                    break;
                case 'connected':
                    // wait for machine ready
                    break;
                case 'ok':
                case 'fail':
                    isReady = true;
                    events.onMessage(data);
                    break;
                default:
                    events.onMessage(data);
                }
            },
            onError: errorHandler,
            onOpen: function() {
                ws.send(rsaKey());
            }
        });

        return {
            connection: ws,
            getImage: function() {
                stopImage = false;
                renewImageDeferred();

                var goFetch = function() {
                        return genericSender('image');
                    },
                    url = (window.URL || window.webkitURL),
                    blob = null,
                    objectUrl,
                    imageLength = 0,
                    mimeType = '',
                    imageBlobs = [];

                $imageDeferred.getImage = function() {
                    $imageDeferred.notify({
                        status: imageCommand.IMAGE
                    });
                };

                $imageDeferred.progress(function(response) {
                    if (imageCommand.IMAGE === response.status) {
                        setTimeout(goFetch, 200);
                    }
                });

                console.log('set timeout');
                timeoutTimer = setTimeout(() => {
                    alert('time out');
                }, 10 * 1000);

                goFetch().done(function() {
                    console.log('clear timeout');
                    clearTimeout(timeoutTimer);
                    events.onMessage = function(data) {
                        switch (data.status) {
                        case 'binary':
                            url.revokeObjectURL(objectUrl);
                            blob = null;
                            mimeType = data.mime;
                            break;
                        case 'ok':
                            blob = new Blob(imageBlobs, { type: mimeType });

                            objectUrl = url.createObjectURL(blob);
                            mimeType = '';
                            imageBlobs = [];

                            $imageDeferred.notify({
                                status: 'ok',
                                url: objectUrl
                            });

                            break;
                        default:
                            if (data instanceof Blob) {
                                imageBlobs.push(data);
                            }
                            else {
                                // TODO: unexception data
                            }
                        }
                    };
                }).fail(function(response) {
                    $imageDeferred.reject(response);
                });

                return $imageDeferred;
            },

            stopGettingImage: stopGettingImage,

            scan: function(resolution, steps, pointCloud, onRendering) {
                console.log('steps', steps);
                $scanDeferred = $.Deferred();

                onRendering = onRendering || function() {};

                var next_left = 0,
                    next_right = 0,
                    opts = {
                        onProgress: onRendering
                    },
                    command = '',
                    totalSteps = resolution - steps,
                    runScan = function() {
                        command = scanCommand.SCAN;
                        genericSender([command, resolution - totalSteps].join(' '));
                    },
                    handleResolutionResponse = function(data) {
                        if ('ok' === data.status) {
                            runScan();
                        }
                    },
                    handleScanResponse = function(data) {
                        if (data instanceof Blob) {
                            pointCloud.push(data, next_left, next_right, opts);
                        }
                        else if ('chunk' === data.status) {
                            next_left = parseInt(data.left, 10) * 24;
                            next_right = parseInt(data.right, 10) * 24;
                        }
                        else if ('ok' === data.status) {
                            totalSteps--;

                            if (0 === parseInt(totalSteps, 10)) {
                                $scanDeferred.notify({
                                    status: scanCommand.FINISH
                                });
                            }
                            else {
                                $scanDeferred.notify({
                                    status: scanCommand.SCAN
                                });
                            }
                        }
                        else {
                            // TODO: unexception data
                        }
                    };

                $scanDeferred.progress(function(response) {
                    switch (response.status) {
                    case scanCommand.SCAN:
                        runScan();
                        break;
                    case scanCommand.FINISH:
                        $scanDeferred.resolve({
                            status: scanCommand.FINISH,
                            pointCloud: pointCloud.get()
                        });
                        break;
                    }
                });

                stopGettingImage().done(function() {
                    command = scanCommand.RESOLUTION;
                    genericSender([command, resolution].join(' ')).done(function() {
                        events.onMessage = function(data) {
                            switch (command) {
                            case scanCommand.RESOLUTION:
                                handleResolutionResponse(data);
                                break;
                            case scanCommand.SCAN:
                                handleScanResponse(data);
                                break;
                            }
                        };
                    }).fail(function(response) {
                        $scanDeferred.reject(response);
                    });

                });

                ws.onClose(function(response) {
                    $scanDeferred.reject(response);
                });

                return $scanDeferred;
            },

            stopScan: function() {
                return $scanDeferred.notify({
                    status: scanCommand.FINISH
                });
            },

            check: function() {
                var $deferred = $.Deferred(),
                    checkStarted = function() {
                        genericSender('scan_check').done(function() {
                            events.onMessage = function(data) {
                                $deferred.resolve(data);
                            };
                        });
                    };

                stopGettingImage().done(function() {
                    checkDeviceIsReady().done(checkStarted);
                });

                return $deferred.promise();
            },

            calibrate: function() {
                var $deferred = $.Deferred();

                stopGettingImage();

                checkDeviceIsReady().done(function() {
                    events.onMessage = function(data) {
                        switch (data.status) {
                        case 'continue':
                            $deferred.notify(data);
                            break;
                        case 'ok':
                            $deferred.resolve(data);
                            break;
                        case 'fail':
                            $deferred.reject(data);
                            break;
                        }
                    };

                    stopGettingImage();
                    genericSender('calibrate');
                });

                return $deferred.promise();
            },

            turnLaser: function(laser) {
                var $deferred = $.Deferred();

                stopGettingImage();

                checkDeviceIsReady().done(function() {
                    events.onMessage = function(data) {
                        switch (data.status) {
                        case 'ok':
                            $deferred.resolve(data);
                            break;
                        case 'fail':
                            $deferred.reject(data);
                            break;
                        }
                    };

                    if(laser){
                        genericSender('turn_on_laser');
                    }else{
                        genericSender('turn_off_laser');
                    }
                });

                return $deferred.promise();
            },

            retry: function(callback) {

                checkDeviceIsReady().done(function() {
                    events.onMessage = function(data) {
                        callback(data);
                    };

                    genericSender('retry');
                });
            },

            takeControl: function(callback) {
                checkDeviceIsReady().done(function() {
                    events.onMessage = function(data) {
                        callback(data);
                    };

                    genericSender('take_control');
                });
            },

            quit: function(doNotReconnect) {
                var $deferred = $.Deferred();

                checkDeviceIsReady().done(function() {
                    events.onMessage = function(result) {
                        $deferred.resolve(result);
                    };

                    events.onError = function(result) {
                        $deferred.resolve(result);
                    };

                    if (doNotReconnect) {
                        ws.setOptions({autoReconnect: false});
                    }

                    genericSender('quit');
                });

                return $deferred.promise();
            }
        };
    };
});
