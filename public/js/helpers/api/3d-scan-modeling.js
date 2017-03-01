/**
 * API 3d scan modeling
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-modeling
 */
define([
    'jquery',
    'helpers/websocket',
    'helpers/point-cloud',
    'helpers/data-history'
], function($, Websocket, PointCloudHelper, history) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};
        opts.onFatal = opts.onFatal || function() {};
        opts.onClose = opts.onClose || function() {};
        opts.printer = opts.printer || {}

        var ws,
            events = {
                onMessage: function() {}
            },
            History = history(),
            splitBinary = function(blob, callback) {
                callback = callback || function() {};

                var chunk,
                    CHUNK_PKG_SIZE = 4096,
                    onLoaded = function(e) {
                        callback(this.result);
                    };

                // split up to pieces
                for (var i = 0; i < blob.size; i += CHUNK_PKG_SIZE) {
                    chunk = blob.slice(i, i + CHUNK_PKG_SIZE);
                    callback(chunk);
                }
            };

        ws = new Websocket({
            method: '3d-scan-modeling',
            onMessage: function(data) {

                events.onMessage(data);

            },
            onOpen: function(data) {
                if (opts.printer && opts.printer.model == "delta-1p") {
                    ws.send('turn_on_hd');
                }
            }
        });
        ws.onError(opts.onError).onFatal(opts.onFatal).onClose(opts.onClose);

        return {
            connection: ws,
            History: History,
            upload: function(name, point_cloud, opts) {
                opts.onStarting = opts.onStarting || function() {};
                opts.onFinished = opts.onFinished || function() {};

                if (24 > point_cloud.left.size + point_cloud.right.size) {
                    opts.onFinished(false);
                    return;
                }

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
                        ws.send(point_cloud.total);

                        break;
                    case 'ok':
                        History.push(name, point_cloud.total);
                        opts.onFinished(true);
                        break;
                    }

                };

                opts.onStarting();

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
            deleteNoise: function(in_name, out_name, c, opts) {
                opts = opts || {};
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
            merge: function(base, target, output, opts) {
                opts.onStarting = opts.onStarting || function() {};
                opts.onFinished = opts.onFinished || function() {};

                var self = this,
                    order_name = 'merge',
                    args = [
                        order_name,
                        base,
                        target,
                        output
                    ];

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        opts.onFinished();
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
                    else if ('continue' === data.status) {
                        next_left = parseInt(data.left, 10) * 24;
                        next_right = parseInt(data.right, 10) * 24;
                    }
                    else if ('ok' === data.status) {
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
            },
            /**
             * apply changes for 3d object
             *
             * @param {String}   baseName   - source name
             * @param {String}   outName    - output name
             * @param {Json}     params     - the parameters that apply for
             * @param {Function} onFinished - finished callback
             *
             */
            applyTransform: function(baseName, outName, params, onFinished) {
                onFinished = onFinished || function() {};

                var args = [
                    'apply_transform',
                    baseName,
                    params.pX || 0,
                    params.pY || 0,
                    params.pZ || 0,
                    params.rX || 0,
                    params.rY || 0,
                    params.rZ || 0,
                    outName
                ],
                doTransform = function() {
                    events.onMessage = function(data) {

                        if ('ok' === data.status) {
                            onFinished(data);
                        }
                        else {
                            // TODO: unexception result?
                        }

                    };

                    ws.send(args.join(' '));
                };

                doTransform();
            },
            /**
             * import pcd file
             *
             * @param {String}   name       - source name
             * @param {String}   fileType   - file type (only support pcd)
             * @param {Blob}     file       - binary
             * @param {Integer}  fileLength - file length
             *
             */
            import: function(name, fileType, file, fileLength) {
                var self = this,
                    $deferred = $.Deferred(),
                    args = [
                        'import_file',
                        name,
                        fileType,
                        fileLength
                    ],
                    opts = {
                        onFinished: function(pointCloud) {
                            $deferred.resolve(pointCloud);
                        }
                    };

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        self.dump(
                            name,
                            opts
                        );
                        break;
                    case 'continue':
                        splitBinary(file, function(result) {
                            ws.send(result);
                        });
                        break;
                    default:
                        $deferred.reject(data);
                    }

                };

                ws.send(args.join(' '));

                return $deferred.promise();
            },
            /**
             * export threading (running in background)
             *
             * @param {String} name     - source name
             * @param {String} fileType - file type (stl, pcd)
             *
             * @return {Promise}
             */
            export_threading: function(name, fileType) {
                var self = this,
                    $deferred = $.Deferred(),
                    args = [
                        'export_threading',
                        name,
                        fileType
                    ];

                events.onMessage = function(data) {

                    switch (data.status) {
                    case 'ok':
                        $deferred.resolve(data);
                        break;
                    default:
                        $deferred.reject(data);
                    }

                };

                ws.send(args.join(' '));

                return $deferred.promise();
            },
            /**
             * export collect (running in background)
             *
             * @param {String} name - source name
             *
             * @return {Promise}
             */
            export_collect: function(name) {
                var self = this,
                    $deferred = $.Deferred(),
                    args = [
                        'export_collect',
                        name
                    ],
                    length = 0;

                events.onMessage = function(data) {
                    if (true === data instanceof Blob) {
                        $deferred.notify({ status: 'binary', data: new Blob([data]) });
                    }
                    else {
                        switch (data.status) {
                        case 'computing':
                        case 'continue':
                            length = data.length || 0;
                            $deferred.notify(data);
                            break;
                        case 'ok':
                            $deferred.resolve(data);
                            break;
                        default:
                            $deferred.reject(data);
                        }
                    }

                };

                ws.send(args.join(' '));

                return $deferred.promise();
            }
        };
    };
});