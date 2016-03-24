/**
 * API 3d scan control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-control
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/file-system',
    'helpers/point-cloud'
], function($, Websocket, fileSystem, PointCloudHelper) {
    'use strict';

    return function(uuid, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onReady = opts.onReady || function() {};

        var ws,
            errorHandler = function(data) {
                isReady = true;
                opts.onError(data);
            },
            isReady = false,
            events = {
                onMessage: function() {}
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
                    });

                return $deferred.promise();
            },
            imageCommand = {
                IMAGE: 'image', // start getting image
                STOP: 'stop'   // stop getting image
            },
            timeoutResponse = { status: 'error', message: 'TIMEOUT' },
            TIMEOUT = 10000,
            $imageDeferred = $.Deferred(),
            $scanDeferred = $.Deferred(),
            connectingTimer,
            genericSender = function(command) {
                ws.send(command);
                isReady = false;
            },
            stopGettingImage = function() {
                return $imageDeferred.notify({ status: imageCommand.STOP });
            };

        ws = new Websocket({
            method: '3d-scan-control/' + uuid,
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
            onClose: errorHandler
        });

        return {
            connection: ws,
            imageCommand: imageCommand,
            getImage: function() {
                $imageDeferred = $.Deferred();

                var goFetch = function() {
                        genericSender('image');
                    },
                    url = (window.URL || window.webkitURL),
                    blob,
                    objectUrl,
                    imageLength = 0,
                    mimeType = '',
                    imageBlobs = [];

                events.onMessage = function(data) {
                    switch (data.status) {
                    case 'binary':
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

                $imageDeferred.progress(function(response) {
                    switch (response.status) {
                    case imageCommand.IMAGE:
                        setTimeout(goFetch, 200);
                        break;
                    case imageCommand.STOP:
                        $imageDeferred.resolve({ status: 'stop' });
                        break;
                    }
                });

                checkDeviceIsReady().done(function() {
                    goFetch();
                }).fail(function(response) {
                    $imageDeferred.reject(response);
                });

                return $imageDeferred;
            },

            stopGettingImage: stopGettingImage,

            scan: function(resolution, opts) {
                $scanDeferred = $.Deferred();

                opts = opts || {};
                opts.onRendering = opts.onRendering || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var pointCloud = new PointCloudHelper(),
                    next_left = 0,
                    next_right = 0,
                    _opts = {
                        onProgress: opts.onRendering
                    },
                    command = '',
                    handleResolutionResponse = function(data) {
                        if ('ok' === data.status) {
                            command = 'send';
                            genericSender(command);
                        }
                    },
                    handleScanResponse = function(data) {
                        if (data instanceof Blob) {
                            pointCloud.push(data, next_left, next_right, _opts);
                        }
                        else if ('chunk' === data.status) {
                            next_left = parseInt(data.left, 10) * 24;
                            next_right = parseInt(data.right, 10) * 24;
                        }
                        else if ('ok' === data.status) {
                            resolution--;

                            if (0 === parseInt(resolution, 10)) {
                                opts.onFinished(pointCloud.get());
                            }
                            else {
                                runScan();
                            }
                        }
                        else {
                            // TODO: unexception data
                        }
                    };

                events.onMessage = function(data) {
                    switch (command) {
                    case 'resolution':
                        handleResolutionResponse(data);
                        break;
                    case 'scan':
                        handleScanResponse(data);
                        break;
                    }
                };

                stopGettingImage();

                checkDeviceIsReady().done(function() {
                    command = 'resolution';
                    genericSender([command, resolution].join(' '));
                }).fail(function(response) {
                    $scanDeferred.reject(response);
                });

                return $scanDeferred;
                return {
                    stop: function(callback) {
                        callback = callback || function() {};
                        callback(pointCloud.get());
                    }
                };
            },

            check: function() {
                var $deferred = $.Deferred(),
                    checkStarted = function() {
                        events.onMessage = function(data) {

                            $deferred.resolve(data);
                        };

                        ws.send('scan_check');
                    };

                stopGettingImage(checkStarted);

                return $deferred.promise();
            },

            calibrate: function() {
                var $deferred = $.Deferred();

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

                ws.send('calibrate');

                return $deferred.promise();
            },

            retry: function(callback) {
                events.onMessage = function(data) {
                    callback(data);
                };

                ws.send('retry');
            },

            takeControl: function(callback) {
                events.onMessage = function(data) {
                    callback(data);
                };

                ws.send('take_control');
            },

            quit: function(opts) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                events.onError = function(result) {
                    d.resolve(result);
                };
                ws.send('quit');

                return d.promise();
            }
        };
    };
});
