/**
 * API 3d scan modeling
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-modeling
 */
define([
    'helpers/websocket',
    'helpers/point-cloud',
    'helpers/data-history'
], function(Websocket, PointCloudHelper, history) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onFatal = opts.onFatal || function() {};
        opts.onClose = opts.onClose || function() {};

        var ws = new Websocket({
                method: '3d-scan-modeling',
                onMessage: function(data) {

                    events.onMessage(data);

                },
                onError: opts.onError,
                onFatal: opts.onFatal,
                onClose: opts.onClose
            }),
            events = {
                onMessage: function() {}
            },
            History = history();

        return {
            connection: ws,
            History: History,
            upload: function(name, point_cloud, opts) {
                opts.onFinished = opts.onFinished || function() {};

                var order_name = 'upload',
                    args = [
                        order_name,
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
                        History.push(name, point_cloud.total);
                        opts.onFinished();
                        break;
                    }

                };

                ws.send(args.join(' '));
            },
            /**
             * @param {String} in_name  - source name
             * @param {String} out_name - target name
             * @param {Array}  args     - where to cut
             *      [
             *          { <mode>, <direction>, <value> }, ...
             *      ]
             */
            cut: function(in_name, out_name, args, opts) {
                opts = opts || {};
                opts.onStarting = opts.onStarting || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var self = this,
                    order_name = 'cut',
                    timer = null,
                    all_ok = false,
                    next_arg = args.pop(),
                    _args = [];

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        if (true === all_ok) {
                            self.dump(
                                out_name,
                                opts
                            );
                        }
                        else {
                            next_arg = args.pop();
                            // after first cut
                            in_name = out_name;
                        }
                        break;
                    }

                };

                timer = setInterval(function() {
                    if ('undefined' !== typeof next_arg) {
                        _args = [
                            order_name,
                            in_name,
                            out_name,
                            next_arg.mode,
                            next_arg.direction,
                            next_arg.value
                        ];

                        ws.send(_args.join(' '));
                        next_arg = undefined;
                    }

                    if (0 === args.length) {
                        all_ok = true;
                        clearInterval(timer);
                    }
                }, 0);

                opts.onStarting();

            },
            delete_noise: function(in_name, out_name, c, opts) {

                opts.onFinished = opts.onFinished || function() {};
                opts.onStarting = opts.onStarting || function() {};

                var self = this,
                    order_name = 'delete_noise',
                    args = [
                        order_name,
                        in_name,
                        out_name,
                        c = ('number' === typeof c ? c : 0.3)   // default by 0.3
                    ];

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        self.dump(
                            out_name,
                            opts
                        );
                        break;
                    }

                };

                ws.send(args.join(' '));
                opts.onStarting();
            },
            autoMerge: function(base, target, output, opts) {
                opts.onStarting = opts.onStarting || function() {};
                opts.onFinished = opts.onFinished || function() {};
                opts.onFail = opts.onFail || function() {};

                var self = this,
                    order_name = 'auto_merge',
                    args = [
                        order_name,
                        base,
                        target,
                        output
                    ];

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        self.dump(
                            output,
                            opts
                        );
                        break;
                    case 'fail':
                        opts.onFail();
                        break;
                    }

                };

                opts.onStarting();
                ws.send(args.join(' '));
            },
            merge: function(base, target, position, rotation, output, opts) {
                opts.onStarting = opts.onStarting || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var self = this,
                    order_name = 'merge',
                    args = [
                        order_name,
                        base,
                        target,
                        position.x,
                        position.y,
                        position.z,
                        rotation.x,
                        rotation.y,
                        rotation.z,
                        output
                    ];

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        self.dump(
                            output,
                            opts
                        );
                        break;
                    }

                };

                opts.onStarting();
                ws.send(args.join(' '));
            },
            /**
             * @param {String} name - source name
             * @param {Json}   opts - option parameters
             *      {
             *          onFinished <dump finished>
             *          onReceiving <dump on progressing>
             *      }
             */
            dump: function(name, opts) {
                opts.onFinished = opts.onFinished || function() {};
                opts.onReceiving = opts.onReceiving || function() {};

                var order_name = 'dump',
                    args = [
                        order_name,
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
                        History.push(name, pointCloud.get().total);
                        opts.onFinished(pointCloud.get());
                    }

                };

                ws.send(args.join(' '));
            },
            /**
             * @param {String} name        - source name
             * @param {String} file_format - file format (stl, pcd)
             * @param {Json}   opts        - option parameters
             *      {
             *          onFinished <export finished>
             *      }
             */
            export: function(name, file_format, opts) {
                opts.onFinished = opts.onFinished || function() {};

                var order_name = 'export',
                    args = [
                        order_name,
                        name,
                        file_format
                    ],
                    blobs = [];

                events.onMessage = function(data) {

                    if (true === data instanceof Blob) {
                        blobs.push(data);
                    }
                    else if ('string' === typeof data.status && 'continue' === data.status) {
                        // TODO: do something?
                    }
                    else if ('string' === typeof data.status && 'ok' === data.status) {
                        opts.onFinished(new Blob(blobs));
                    }

                };

                ws.send(args.join(' '));
            }
        };
    };
});