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

                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data),
                        error_code;

                    if ('string' === typeof data && true === data.startsWith('error')) {
                        error_code = result.data.replace('error ');
                        opts.onError(error_code, data);

                    }
                    else {
                        if ('connected' === data) {
                            is_connected = true;
                        }

                        events.onMessage(data);
                    }

                    lastMessage = data;

                }
            }),
            is_connected = false,
            IMAGE_INTERVAL = 500,
            lastOrder = '',
            lastMessage = '',
            events = {
                onMessage: function() {}
            },
            wait_gap_time = 0,
            wait_for_connected_timer,
            image_timer,
            check_is_connected = function(callback) {
                wait_for_connected_timer = setInterval(function() {
                    if (true === is_connected) {
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
                }
            };

        return {
            connection: ws,
            getImage: function(imageHandler) {
                var allow_to_get = true,
                    image_length = 0,
                    image_blobs = [],
                    fetch = function() {
                        lastOrder = 'image';
                        events.onMessage = function(data) {
                            var image_file;

                            allow_to_get = false;

                            // ok [length]
                            if ('string' === typeof data && true === data.startsWith('ok')) {
                                image_length = parseInt(data.replace('ok '), 10);
                            }
                            else if ('string' === typeof data && 'finished' === data) {
                                image_file = new File(
                                    image_blobs,
                                    'scan.png'
                                );

                                allow_to_get = true;

                                fileSystem.writeFile(
                                    image_file,
                                    {
                                        onComplete: imageHandler
                                    }
                                );
                            }
                            else if (true === data instanceof Blob) {
                                // get
                                image_blobs.push(data);
                            }
                        };

                        image_timer = setInterval(function() {
                            if (true === allow_to_get) {
                                allow_to_get = false;
                                ws.send(lastOrder);
                            }
                        }, IMAGE_INTERVAL);
                    };

                check_is_connected(fetch);

                return {
                    stop: stopGettingImage
                };
            },
            scan: function(opts) {
                stopGettingImage();

                opts = opts || {};
                opts.onRendering = opts.onRendering || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var pointCloud = new PointCloudHelper(),
                    next_left = 0,
                    next_right = 0,
                    _opts = {
                        onProgress: opts.onRendering
                    };

                check_is_connected(function() {
                    lastOrder = 'start';
                    ws.send('start');

                    events.onMessage = function(data) {

                        if (true === data instanceof Blob) {
                            pointCloud.push(data, next_left, next_right, _opts);
                        }
                        else if ('undefined' !== typeof data.status && 'chunk' === data.status) {
                            next_left = parseInt(data.left, 10) * 24;
                            next_right = parseInt(data.right, 10) * 24;
                        }
                        else if ('string' === typeof data && 'finished' === data) {
                            // disconnect
                            ws.send('quit');

                            opts.onFinished(pointCloud.get());
                        }
                    };
                });

            }
        };
    };
});