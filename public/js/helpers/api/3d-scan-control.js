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

                    lastMessage = data;
                }
            }),
            is_error = false,
            is_ready = false,
            IMAGE_INTERVAL = 200,
            lastOrder = '',
            lastMessage = '',
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
            wait_gap_time = 0,
            wait_for_connected_timer,
            image_timer,
            check_is_ready = function(callback) {
                wait_for_connected_timer = setInterval(function() {
                    if (true === is_ready) {
                        clearInterval(wait_for_connected_timer);
                        wait_gap_time = 0;
                        callback();
                    }
                    else {
                        wait_gap_time = 100;
                    }

                }, wait_gap_time);
            },
            stopGettingImage = function() {
                if ('image' === lastOrder) {
                    clearInterval(image_timer);
                    lastOrder = '';
                }
            };

        return {
            connection: ws,
            getImage: function(imageHandler) {
                var allow_to_get = false,
                    image_length = 0,
                    mime_type = '',
                    image_blobs = [],
                    fetch = function() {
                        lastOrder = 'image';
                        events.onMessage = function(data) {

                            switch (data.status) {
                            case 'binary':
                                mime_type = data.mime;
                                allow_to_get = false;
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

                        image_timer = setInterval(function() {
                            if (true === allow_to_get) {
                                ws.send(lastOrder);
                            }
                        }, IMAGE_INTERVAL);
                    };

                check_is_ready(fetch);

                return {
                    stop: stopGettingImage,
                    retry: retry,
                    take_control: takeControl
                };
            },
            scan: function(resolution, opts) {
                stopGettingImage();

                opts = opts || {};
                opts.onRendering = opts.onRendering || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var pointCloud = new PointCloudHelper(),
                    next_left = 0,
                    next_right = 0,
                    _opts = {
                        onProgress: opts.onRendering
                    },
                    go_next = false,
                    got_chunk = false,
                    timer;

                lastOrder = 'scan';

                check_is_ready(function() {

                    events.onMessage = function(data) {
                        switch (data.status) {
                        case 'chunk':
                            next_left = parseInt(data.left, 10) * 24;
                            next_right = parseInt(data.right, 10) * 24;
                            got_chunk = true;
                            break;
                        case 'ok':
                            go_next = true;
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
                            ws.send(lastOrder);
                            resolution--;
                        }

                        if (0 >= resolution) {
                            opts.onFinished(pointCloud.get());
                            clearInterval(timer);
                        }
                    }, 100);

                    ws.send('resolution ' + resolution);
                });

                return {
                    retry: retry,
                    take_control: takeControl
                };
            }
        };
    };
});