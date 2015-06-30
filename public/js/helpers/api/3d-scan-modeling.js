/**
 * API 3d scan modeling
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-modeling
 */
define([
    'helpers/websocket',
    'helpers/point-cloud',
    'helpers/is-json'
], function(Websocket, PointCloudHelper, isJson) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: '3d-scan-modeling',
                onMessage: function(result) {

                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data),
                        error_code;

                    if ('string' === typeof data && true === data.startsWith('error')) {
                        error_code = result.data.replace('error ');
                        opts.onError(error_code, data);
                    }
                    else {
                        events.onMessage(data);
                    }

                    lastMessage = data;

                }
            }),
            lastOrder = '',
            lastMessage = '',
            events = {
                onMessage: function() {}
            };

        return {
            connection: ws,
            upload: function(name, point_cloud, opts) {
                opts.onFinished = opts.onFinished || function() {};

                var lastOrder = 'upload',
                    args = [
                        lastOrder,
                        name,
                        point_cloud.left.size / 24,
                        point_cloud.right.size / 24 || 0
                    ];

                events.onMessage = function(data) {
                    switch (data.status) {
                    case 'continue':
                        var reader = new FileReader();

                        reader.onloadend = function(e) {
                            var data = e.target.result;

                            ws.send(data);
                        };

                        reader.readAsArrayBuffer(point_cloud.total);

                        break;
                    case 'ok':
                        opts.onFinished();
                        break;
                    }

                };

                ws.send(args.join(' '));
            },
            cut: function(in_name, out_name, mode, direction, value) {
                opts.onFinished = opts.onFinished || function() {};

                var lastOrder = 'cut',
                    args = [
                        lastOrder,
                        in_name,
                        out_name,
                        mode,
                        direction,
                        value
                    ];

                // TODO: to count the steps of whole progress

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        opts.onFinished();
                        break;
                    }

                };

                ws.send(args.join(' '));
            },
            delete_noise: function(in_name, out_name, c, opts) {

                opts.onFinished = opts.onFinished || function() {};

                var lastOrder = 'delete_noise',
                    args = [
                        lastOrder,
                        in_name,
                        out_name,
                        c = ('number' === typeof c ? c : 0.3)   // default by 0.3
                    ];

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        opts.onFinished();
                        break;
                    }

                };

                ws.send(args.join(' '));
            },
            merge: function(name, x1, x2, y1, y2) {
                // TODO: to be implemented
            },
            dump: function(name, opts) {
                opts.onFinished = opts.onFinished || function() {};
                opts.onReceiving = opts.onReceiving || function() {};

                var lastOrder = 'dump',
                    args = [
                        lastOrder,
                        name
                    ],
                    pointCloud = new PointCloudHelper(),
                    next_left = 0,
                    next_right = 0,
                    _opts = {
                        onProgress: opts.onReceiving
                    };

                events.onMessage = function(data) {

                    if (true === data instanceof Blob) {
                        pointCloud.push(data, next_left, next_right, _opts);
                    }
                    else if ('undefined' !== typeof data.status && 'continue' === data.status) {
                        next_left = parseInt(data.left, 10) * 24;
                        next_right = parseInt(data.right, 10) * 24;
                    }
                    else if ('undefined' !== typeof data.status && 'ok' === data.status) {
                        opts.onFinished(pointCloud.get());
                    }

                };

                ws.send(args.join(' '));
            },
            export: function(name) {
                // TODO: to be implemented
            },
        };
    };
});