/**
 * API 3d scan control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-control
 */
define([
    'helpers/websocket',
    'helpers/file-system',
    'helpers/point-cloud',
    'helpers/is-json'
], function(Websocket, fileSystem, PointCloudHelper, isJson) {
    'use strict';

    return function(serial, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onClose = opts.onClose || function() {};
        opts.onStarting = opts.onStarting || function() {};
        opts.onReady = opts.onReady || function() {};

        var ws = new Websocket({
                method: '3d-scan-control/' + serial,
                onMessage: function(result) {

                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data);

                    switch (data.status) {
                    case 'error':
                        is_ready = false;
                        is_error = true;
                        opts.onError(data);
                        break;
                    case 'fatal':
                        is_ready = false;
                        is_error = true;
                        break;
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
                        events.onMessage(data);
                    }
                },
                onClose: function() {
                    opts.onClose();
                },
                onOpen: opts.onStarting
            }),
            is_error = false,
            is_ready = false,
            IMAGE_INTERVAL = 200,
            events = {
                onMessage: function() {}
            },
            retry = function() {
                if (true === is_error) {
                    ws.send('retry');
                }
            },
            takeControl = function() {
                if (true === is_error) {
                    ws.send('take_control');
                }
            },
            wait_for_connected_timer,
            image_timer,
            stopGettingImage = function(callback) {
                var timer = setInterval(function() {
                    if ('undefined' !== typeof image_timer) {
                        clearInterval(image_timer);
                        image_timer = undefined;
                    }
                    else {
                        callback();
                        clearInterval(timer);
                    }
                }, 100);
            };

        return {
            connection: ws,
            getImage: function(imageHandler) {
                var allow_to_get = true,
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
                                allow_to_get = true;
                                image_blobs = [];
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

                image_timer = setInterval(function() {
                    if (true === allow_to_get) {
                        ws.send('image');
                        allow_to_get = false;
                    }
                }, IMAGE_INTERVAL);

                fetch();

                return {
                    retry: retry,
                    take_control: takeControl
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
                    go_next = true,
                    got_chunk = false,
                    timer,
                    onResolutionMessage = function() {
                        events.onMessage = function(data) {
                            if ('ok' === data.status) {
                                onScanMessage();
                            }
                        };
                    },
                    onScanMessage = function() {
                        events.onMessage = function(data) {
                            switch (data.status) {
                            case 'chunk':
                                next_left = parseInt(data.left, 10) * 24;
                                next_right = parseInt(data.right, 10) * 24;
                                got_chunk = true;
                                break;
                            case 'ok':
                                resolution--;
                                go_next = (0 < resolution);
                                got_chunk = false;
                                break;
                            default:
                                if (data instanceof Blob && true === got_chunk) {
                                    pointCloud.push(data, next_left, next_right, _opts);
                                }
                                else {
                                    // TODO: unexception data
                                }
                            }
                        };

                        timer = setInterval(function() {
                            if (true === go_next) {
                                go_next = false;
                                ws.send('scan');
                            }

                            if (0 >= resolution) {
                                opts.onFinished(pointCloud.get());
                                clearInterval(timer);
                            }
                        }, 100);
                    },
                    scanStarted = function() {
                        onResolutionMessage();
                        ws.send('resolution ' + resolution);
                    };

                stopGettingImage(scanStarted);

                return {
                    retry: retry,
                    take_control: takeControl
                };
            }
        };
    };
});