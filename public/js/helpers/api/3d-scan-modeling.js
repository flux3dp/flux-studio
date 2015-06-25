/**
 * API 3d scan modeling
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-modeling
 */
define([
    'helpers/websocket',
    'helpers/file-system'
], function(Websocket, fileSystem) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: '3d-scan-modeling',
                onMessage: function(result) {
                    var data = ('string' === typeof result.data ? JSON.parse(JSON.stringify(result.data)) : result.data),
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
            ws: ws,
            upload: function(name, point_cloud, opts) {
                opts.onFinished = opts.onFinished || function() {};

                var lastOrder = 'upload',
                    args = [
                        lastOrder,
                        name,
                        point_cloud.left.size,
                        point_cloud.right.size || 0
                    ];

                events.onMessage = function(data) {
                    console.log('upload', data);

                    switch (data.status) {
                    case 'continue':
                        ws.send(point_cloud.total);
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

                    switch (data) {
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

                    switch (data) {
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
            dump: function(name) {
                // TODO: to be implemented
            },
            export: function(name) {
                // TODO: to be implemented
            },
        };
    };
});