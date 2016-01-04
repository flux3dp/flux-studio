/**
 * API 3d scan control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-control
 */
define([
    'jquery',
    'helpers/websocket-debug',
    'helpers/file-system',
    'helpers/point-cloud'
], function($, Websocket, fileSystem, PointCloudHelper) {
    'use strict';

    return function(uuid, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onClose = opts.onClose || function() {};
        opts.onReady = opts.onReady || function() {};

        var ws,
            errorHandler = function(data) {
                is_ready = false;
                is_error = true;
                opts.onError(data);
            },
            is_error = false,
            is_ready = false,
            events,
            initialEvents = function() {
                events = {
                    onMessage: undefined
                };
            },
            fetchImage = function(goFetch) {
                if ('boolean' === typeof goFetch && true === goFetch) {
                    return function() {
                        ws.send('image');
                    };
                }
                else {
                    return function() {};
                }
            },
            wait_for_connected_timer,
            stopGettingImage = function(callback) {
                callback = callback || function() {};

                if ('undefined' === typeof events.onMessage) {
                    callback();
                }
                else {
                    events.onMessage = function(data) {
                        if ('ok' === data.status) {
                            initialEvents();
                            callback();
                        }
                    };
                }
            };

        ws = new Websocket({
            method: '3d-scan-control/' + uuid,
            onMessage: function(data) {

                switch (data.status) {
                case 'ready':
                    is_ready = true;
                    is_error = false;
                    opts.onReady();
                    break;
                case 'connected':
                    // wait for machine ready
                    break;
                default:
                    break;
                }

                if (true === is_ready) {
                    (events.onMessage || function() {})(data);
                }
            },
            onError: errorHandler,
            onClose: opts.onClose
        });

        initialEvents();

        return {
            connection: ws,
            getImage: function(imageHandler) {
                var goFetch = function() {
                        ws.send('image');
                    },
                    image_length = 0,
                    mime_type = '',
                    image_blobs = [],
                    fetch = function() {
                        events.onMessage = function(data) {
                            switch (data.status) {
                            case 'binary':
                                mime_type = data.mime;
                                break;
                            case 'ok':
                                imageHandler(image_blobs, mime_type);
                                image_blobs = [];

                                setTimeout(function() {
                                    goFetch();
                                }, 200);

                                break;
                            default:
                                if (data instanceof Blob) {
                                    image_blobs.push(data);
                                }
                                else {
                                    // TODO: unexception data
                                }
                            }
                        };
                    };

                fetch();
                goFetch();

                return {
                    stop: stopGettingImage
                };
            },
            scan: function(resolution, opts) {
                opts = opts || {};
                opts.onRendering = opts.onRendering || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var pointCloud = new PointCloudHelper(),
                    next_left = 0,
                    next_right = 0,
                    _opts = {
                        onProgress: opts.onRendering
                    },
                    timer,
                    onResolutionMessage = function() {
                        events.onMessage = function(data) {
                            if ('ok' === data.status) {
                                onScanMessage();
                            }
                        };
                    },
                    onScanMessage = function() {
                        var runScan = function() {
                            ws.send('scan');
                        };

                        events.onMessage = function(data) {
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
                                    initialEvents();
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

                        runScan();
                    },
                    scanStarted = function() {
                        onResolutionMessage();
                        ws.send('resolution ' + resolution);
                    };

                stopGettingImage(scanStarted);

                return {
                    stop: function(callback) {
                        callback = callback || function() {};
                        callback(pointCloud.get());
                        initialEvents();
                    }
                };
            },
            check: function() {
                var $deferred = $.Deferred(),
                    checkStarted = function() {
                        events.onMessage = function(data) {
                            initialEvents();

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
                        initialEvents();
                        $deferred.resolve(data);
                        break;
                    case 'fail':
                        initialEvents();
                        $deferred.reject(data);
                        break;
                    }
                };

                ws.send('calibrate');

                return $deferred.promise();
            },

            retry: function(callback) {
                events.onMessage = function(data) {
                    initialEvents();

                    callback(data);
                };

                ws.send('retry');
            },

            takeControl: function(callback) {
                events.onMessage = function(data) {
                    initialEvents();

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
