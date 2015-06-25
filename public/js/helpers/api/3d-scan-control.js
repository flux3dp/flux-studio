/**
 * API 3d scan control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-control
 */
define([
    'helpers/websocket',
    'helpers/file-system'
], function(Websocket, fileSystem) {
    'use strict';

    return function(serial, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: '3d-scan-control/' + serial,
                onMessage: function(result) {
                    var data = ('string' === typeof result.data ? JSON.parse(JSON.stringify(result.data)) : result.data),
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
            ws: ws,
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
                            else if ('finished' === data) {
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
                            else {
                                // get binary
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

                var model_blobs = [],
                    next_left = 0,
                    next_right = 0,
                    point_cloud_left = [],
                    point_cloud_right = [],
                    point_cloud = {};

                check_is_connected(function() {
                    lastOrder = 'start';
                    ws.send('start');

                    events.onMessage = function(data) {
                        var fileReader = new FileReader(),
                            typedArray, blob;

                        if (true === data instanceof Blob) {
                            model_blobs.push(data);
                            point_cloud_left.push(data.slice(0, next_left));
                            point_cloud_right.push(data.slice(next_left, next_left + next_right));

                            // refresh model every time
                            fileReader.onload = function(progressEvent) {
                                typedArray = new Float32Array(this.result);
                                opts.onRendering(typedArray, model_blobs.length);
                            };

                            blob = new Blob(model_blobs);
                            fileReader.readAsArrayBuffer(blob);
                        }
                        else if (true === data.startsWith('chunk')) {
                            data = data.split(' ');

                            next_left = parseInt(data[1], 10) * 24;
                            next_right = parseInt(data[2], 10) * 24;
                        }
                        else if ('finished' === data) {
                            // disconnect
                            ws.send('quit');

                            // origanize point cloud
                            point_cloud.left = new Blob(point_cloud_left);
                            point_cloud.right = new Blob(point_cloud_right);
                            point_cloud.total = new Blob(point_cloud_left.concat(point_cloud_right));

                            opts.onFinished(point_cloud);
                        }
                    };
                });

            }
        };
    };
});