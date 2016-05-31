define([
    'jquery',
    'helpers/api/bitmap-laser-parser',
    'helpers/api/svg-laser-parser',
    'helpers/api/fcode-reader',
    'helpers/convertToTypedArray',
    'helpers/element-angle',
    'helpers/sprintf',
    'helpers/api/control',
    'helpers/shortcuts',
    'helpers/image-data',
    'helpers/i18n',
    'helpers/round',
    'helpers/nwjs/menu-factory',
    'app/actions/alert-actions',
    'app/actions/global-actions',
    'app/constants/global-constants',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'freetrans',
    'helpers/jquery.box',
    'plugins/file-saver/file-saver.min'
], function(
    $,
    bitmapLaserParser,
    svgLaserParser,
    fcodeReader,
    convertToTypedArray,
    elementAngle,
    sprintf,
    control,
    shortcuts,
    imageData,
    i18n,
    round,
    menuFactory,
    AlertActions,
    GlobalActions,
    GlobalConstants,
    DeviceMaster,
    DeviceConstants,
    ProgressActions,
    ProgressConstants
) {
    'use strict';

    return function(args) {
        args = args || {};

        var self = this,    // react component
            DIAMETER = 170,    // 170mm
            ACCEPTABLE_MIN_SIZE = 1, // width * height > 1
            bitmapWebSocket,
            svgWebSocket,
            LASER_IMG_CLASS = 'img-container',
            $laser_platform,
            lang = i18n.get(),
            $uploadDeferred = $.Deferred(),
            PLATFORM_DIAMETER_PIXEL,
            deleteImage = function() {
                var $img_container = $('.' + LASER_IMG_CLASS).not($target_image),
                    $img = $target_image,
                    reset_file_type = false,
                    state = {
                        selectedImage: false
                    };

                if (null !== $target_image) {
                    // delete svg blob from history
                    if ('svg' === self.state.fileFormat && true === $img.hasClass('svg')) {
                        svgWebSocket.History.deleteAt($img.data('name'));
                    }

                    $target_image.parents('.ft-container').remove();

                    if (0 === $img_container.length) {
                        $target_image = null;
                        state.hasImage = false;
                        state.images = [];

                        menuFactory.items.execute.enabled = false;
                        menuFactory.items.saveTask.enabled = false;
                        self.state.fileFormat = undefined;
                    }
                    else {
                        $target_image = $img_container[0];
                    }

                    self.setState(state);
                }
            },
            refreshImage = function($img, threshold) {
                var freetrans = $img.data('freetrans'),
                    box = {
                        height: $img.height() * freetrans.scaley,
                        width: $img.width() * freetrans.scalex,
                    };

                imageData(
                    $img.data('base'),
                    {
                        height: box.height,
                        width: box.width,
                        grayscale: {
                            is_rgba: true,
                            is_shading: self.refs.setupPanel.isShading(),
                            threshold: parseInt(threshold, 10),
                            is_svg: ('svg' === self.state.fileFormat)
                        },
                        onComplete: function(result) {
                            $img.attr('src', result.canvas.toDataURL('image/png'));
                        }
                    }
                );
            },
            sendToMachine = function(blob) {
                var blobUrl = window.URL,
                    source = self.props.page === 'draw' ? GlobalConstants.DRAW : GlobalConstants.LASER,
                    fcodeReaderMethods = fcodeReader(),
                    goToMonitor = function(thumbnailBlob) {
                        DeviceMaster.selectDevice(self.state.selectedPrinter).then(function(status) {
                            if (status === DeviceConstants.CONNECTED) {
                                GlobalActions.showMonitor(self.state.selectedPrinter, blob, blobUrl.createObjectURL(thumbnailBlob), source);
                            }
                            else if (status === DeviceConstants.TIMEOUT) {
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            }
                        });
                    },
                    parseFCode = function() {
                        fcodeReaderMethods.getThumbnail(goToMonitor, goToMonitor);
                    },
                    uploadFCode = function() {
                        fcodeReaderMethods.upload(blob, blob.size, parseFCode);
                    };

                uploadFCode();
            },
            ExportGCodeProgressing = function(data) {
                ProgressActions.updating(data.message, data.percentage * 100);
            },
            sendToBitmapAPI = function(args, settings, callback, fileMode) {
                callback = callback || function() {};

                var laserParser = bitmapWebSocket,
                    onSetParamsFinished = function() {
                        laserParser.compute(args, {
                            onFinished: onUploadFinish
                        });
                    },
                    onUploadFinish = function() {
                        laserParser.getTaskCode({
                            onProgressing: ExportGCodeProgressing,
                            onFinished: callback,
                            fileMode: fileMode
                        });
                    };

                laserParser.clear().done(function(data) {
                    laserParser.params.setEach(
                        settings,
                        {
                            onFinished: onSetParamsFinished
                        }
                    );
                });
            },
            sendToSVGAPI = function(args, settings, callback, fileMode) {
                callback = callback || function() {};

                var laserParser = svgWebSocket,
                    onSetParamsFinished = function() {
                        laserParser.compute(args, {
                            onFinished: onComputeFinished
                        });
                    },
                    onComputeFinished = function() {
                        var names = [],
                            all_svg = laserParser.History.get();

                        all_svg.forEach(function(obj) {
                            names.push(obj.name);
                        });

                        laserParser.getTaskCode(
                            names,
                            {
                                onProgressing: ExportGCodeProgressing,
                                onFinished: callback,
                                fileMode: fileMode
                            }
                        );
                    };

                laserParser.params.setEach(
                    settings,
                    {
                        onFinished: onSetParamsFinished
                    }
                );
            },
            convertToRealCoordinate = function(px, axis) {
                axis = axis || '';

                var ratio = DIAMETER / PLATFORM_DIAMETER_PIXEL, // 1(px) : N(mm)
                    r = PLATFORM_DIAMETER_PIXEL / 2 * ratio,
                    mm = ratio * px - r;

                if ('y' === axis.toLowerCase()) {
                    mm = mm * -1;
                }

                return round(mm, -2);
            },
            convertToHtmlCoordinate = function(n, axis) {

                var ratio = PLATFORM_DIAMETER_PIXEL / DIAMETER, // 1(px) : N(mm)
                    r = DIAMETER / 2,
                    freetrans = $target_image.data('freetrans'),
                    px;

                n = parseFloat(n, 10) + r;
                px = n * ratio;

                if ('x' === axis) {
                    px -= ($target_image.width() * freetrans.scalex / 2);
                    px -= ($target_image.width() * (1 - freetrans.scalex));
                }
                else {
                    px -= ($target_image.height() * freetrans.scaley  / 2);
                    px -= ($target_image.height() * (1 - freetrans.scaley));
                }

                return round(px, -2);
            },
            outOfRange = function(point) {
                var platform_pos = $laser_platform.box(true),
                    limit = platform_pos.width / 2,
                    x = Math.pow((platform_pos.center.x - point.x), 2),
                    y = Math.pow((platform_pos.center.y - point.y), 2),
                    range = Math.sqrt(x + y);

                return range > limit;
            },
            sleep,
            resetPosition = function() {
                var $img_container = $('.' + LASER_IMG_CLASS),
                    platform_pos = $laser_platform.box(true),
                    rollback = true,
                    $controlPoints,
                    el_position;

                $img_container.each(function(i, el) {
                    var $el = $(el),
                        data = $el.data('freetrans');

                    el_position = $el.box();

                    $controlPoints = $el.parent().find('.ft-scaler');
                    $controlPoints.each(function(k, el) {
                        var elPosition = $(el).box(true);

                        rollback = (
                            false === outOfRange(elPosition.center) ?
                            false :
                            rollback
                        );
                    });

                    if (true === rollback && 'undefined' !== typeof data) {
                        $el.addClass('bounce').parent().find('.ft-controls').addClass('bounce');

                        $el.freetrans({
                            x: ((platform_pos.width - el_position.width) / 2) - data.originalSize.width * (1 - data.scalex),
                            y: ((platform_pos.height - el_position.height) / 2) - data.originalSize.height * (1 - data.scaley)
                        });

                        // set fallback for older version of chrome
                        $el.one('transitionend webkitTransitionend', function() {
                            $el.removeClass('bounce').parent().find('.ft-controls').removeClass('bounce');
                        });
                    }
                });
            },
            refreshObjectParams = function(e, $el) {
                var el_position, el_offset_position, position, size, angle, threshold, data;

                if (null !== $el) {
                    el_position = $el.box();
                    el_offset_position = $el.box(true);
                    data = $el.data('freetrans');

                    position = {
                        x: convertToRealCoordinate(el_position.center.x, 'x'),
                        y: convertToRealCoordinate(el_position.center.y, 'y')
                    };
                    size = {
                        width: round($el.width() * data.scalex / PLATFORM_DIAMETER_PIXEL * DIAMETER, -2),
                        height: round($el.height() * data.scaley / PLATFORM_DIAMETER_PIXEL * DIAMETER, -2)
                    };
                    angle = elementAngle($el[0]);
                    threshold = $el.data('threshold') || 128;

                    if ('scale' === e.freetransEventType) {
                        refreshImage($el, threshold);
                    }

                    self.setState({
                        position: position,
                        size: size,
                        angle: angle,
                        threshold: threshold
                    }, function() {
                        refreshImagePanelPos();
                    });
                }
            },
            $target_image = null, // changing when image clicked
            printer = null,
            resetPosTimer = null,
            printer_selecting = false,
            handleLaser = function(settings, callback, progressType, fileMode) {
                fileMode = fileMode || '-f';
                progressType = progressType || ProgressConstants.NONSTOP;

                var $ft_controls = $laser_platform.find('.ft-controls'),
                    _callback = function() {
                        GlobalActions.sliceComplete({ time: arguments[2] });
                        callback.apply(null, arguments);
                        ProgressActions.close();
                    },
                    getPoint = function($el) {
                        var containerOffset = $laser_platform.offset(),
                            offset = $el.offset(),
                            width = $el.width(),
                            height = $el.height(),
                            pointX = offset.left - containerOffset.left + (width / 2),
                            pointY = offset.top - containerOffset.top + (height / 2);

                        return {
                            x: pointX,
                            y: pointY
                        };
                    },
                    args = [],
                    doLaser = function(settings) {

                        $ft_controls.each(function(k, el) {
                            var $el = $(el),
                                image = new Image(),
                                top_left = getPoint($el.find('.ft-scaler-top.ft-scaler-left')),
                                bottom_right = getPoint($el.find('.ft-scaler-bottom.ft-scaler-right')),
                                $img = $el.parents('.ft-container').find('img'),
                                box = $img.box(),
                                isShading = self.refs.setupPanel.isShading(),
                                width = 0,
                                height = 0,
                                sub_data = {
                                    name: $img.data('name') || '',
                                    tl_position_x: convertToRealCoordinate(top_left.x, 'x'),
                                    tl_position_y: convertToRealCoordinate(top_left.y, 'y'),
                                    br_position_x: convertToRealCoordinate(bottom_right.x, 'x'),
                                    br_position_y: convertToRealCoordinate(bottom_right.y, 'y'),
                                    rotate: (Math.PI * elementAngle(el) / 180) * -1,
                                    threshold: $img.data('threshold') || 128
                                },
                                grayscaleOpts = {
                                    is_svg: ('svg' === self.state.fileFormat),
                                    threshold: 255
                                },
                                src = $img.data('base'),
                                previewImageSize;

                            if ('svg' === self.state.fileFormat) {
                                previewImageSize = svgWebSocket.computePreviewImageSize({
                                    width: box.width,
                                    height: box.height
                                });

                                // only svg file need size to convert to binary
                                height = parseInt(previewImageSize.height, 10);
                                width = parseInt(previewImageSize.width, 10);
                            }

                            imageData(
                                src,
                                {
                                    height: height,
                                    width: width,
                                    grayscale: grayscaleOpts,
                                    onComplete: function(result) {
                                        sub_data.image_data = result.imageBinary;
                                        sub_data.height = result.size.height;
                                        sub_data.width = result.size.width;

                                        if ('svg' === self.state.fileFormat) {
                                            sub_data.svg_data = svgWebSocket.History.findByName($img.data('name'))[0].data;
                                        }

                                        sub_data.real_width = box.width / $laser_platform.width() * DIAMETER;
                                        sub_data.real_height = box.height / $laser_platform.height() * DIAMETER;

                                        args.push(sub_data);

                                        if (args.length === $ft_controls.length) {
                                            // sending data
                                            if ('svg' === self.state.fileFormat) {
                                                sendToSVGAPI(args, settings, _callback, fileMode);
                                            }
                                            else {
                                                sendToBitmapAPI(args, settings, _callback, fileMode);
                                            }
                                        }
                                    }
                                }
                            );
                        });
                    };

                ProgressActions.open(progressType, lang.laser.process_caption, 'Processing...', false);

                doLaser(settings);
            };

        shortcuts.on(
            ['del'],
            function(e) {
                if ('INPUT' !== e.target.tagName) {
                    deleteImage();
                }
            }
        );

        function setupImage(file, size, originalUrl, name) {
            var img = new Image(),
                $img = $(img).addClass(LASER_IMG_CLASS),
                instantRefresh = function(e, data) {
                    refreshObjectParams(e, $img);
                },
                $ftControls;

            $img.addClass(file.extension).
                attr('src', file.url).
                data('name', name).
                data('base', originalUrl).
                data('size', size).
                data('sizeLock', true).
                width(size.width).
                height(size.height);

            $img.one('load', function() {
                $img.freetrans({
                    x: ($laser_platform.outerWidth() - size.width) / 2,
                    y: ($laser_platform.outerHeight() - size.height) / 2,
                    originalSize: size,
                    onRotate: instantRefresh,
                    onMove: instantRefresh,
                    onScale: instantRefresh,
                    maintainAspectRatio: true,
                    angle: size.angle || 0
                });
                $ftControls = $img.parent().find('.ft-controls');
                $ftControls.width(size.width).height(size.height);

                if (file.index === file.totalFiles - 1) {
                    ProgressActions.close();
                }

                // set default image
                if (null === $target_image) {
                    refreshObjectParams({ freetransEventType: 'move' }, $img);
                }

                // onmousedown
                (function(file, size, originalUrl, name, $img) {

                    $ftControls.on('mousedown', function(e) {
                        var clone = function() {
                                var data = $img.data('freetrans');

                                size.width = size.width * data.scalex;
                                size.height = size.height * data.scaley;
                                size.angle = elementAngle($img[0]);

                                setupImage(file, size, originalUrl, name);

                                self.setState({
                                    hasImage: true
                                });
                            };

                        if (false === $img.hasClass('image-active')) {
                            inactiveAllImage();

                            $target_image = $img;

                            refreshObjectParams({ freetransEventType: 'move' }, $img);

                            $img.on('transitionend', function(e) {
                                refreshImagePanelPos();
                            });

                            self.setState({
                                selectedImage: true,
                                sizeLock: $img.data('sizeLock')
                            });

                            $img.addClass('image-active');
                        }

                        menuFactory.items.duplicate.enabled = true;
                        menuFactory.items.duplicate.onClick = clone;
                    });
                })(file, size, originalUrl, name, $img);
            });


            $laser_platform.append($img);

            return $img;
        }

        function handleUploadImage(file, parserSocket, isEnd, deferred) {
            var name = 'image-' + (new Date()).getTime(),
                opts = {},
                onUploadFinished = function(data) {
                    opts.onFinished = onGetFinished;
                    parserSocket.get(name, opts);
                },
                onGetFinished = function(data, size) {
                    var url = window.URL,
                        blob = new Blob([data], { type: file.type }),
                        objectUrl = url.createObjectURL(blob),
                        platformDiameter = $laser_platform.width(),
                        ratio = 1;

                    if (platformDiameter < Math.max(size.width , size.height)) {
                        ratio = Math.min(360 / size.width, 360 / size.height);
                        size.width = size.width * ratio;
                        size.height = size.height * ratio;
                    }

                    if (ACCEPTABLE_MIN_SIZE < size.width * size.height) {
                        file.error = [];

                        imageData(blob, {
                            width: size.width,
                            height: size.height,
                            type: file.type,
                            grayscale: {
                                is_rgba: true,
                                is_shading: self.refs.setupPanel.isShading(),
                                threshold: 128,
                                is_svg: ('svg' === self.state.fileFormat)
                            },
                            onComplete: function(result) {
                                ProgressActions.close();

                                file.url = result.canvas.toDataURL('svg' === file.extension ? 'image/svg+xml' : 'image/png');

                                $uploadDeferred.notify(file, isEnd);

                                setupImage(file, size, objectUrl, name);
                            }
                        });
                    }
                    else {
                        file.invaild = true;
                        file.error = [lang.message.image_is_too_small];
                        $uploadDeferred.notify(file, isEnd);
                    }
                };

            file.invaild = false;
            opts.onFinished = onUploadFinished;
            opts.onError = function(file, warning_collection, isBroken) {
                warning_collection.forEach(function(errorCode, i) {
                    warning_collection[i] = lang.laser.svg_fail_messages[errorCode] || lang.laser.svg_fail_messages.SVG_BROKEN;
                });

                file.invaild = isBroken;
                file.error = warning_collection;
                $uploadDeferred.notify(file, isEnd);
                ProgressActions.close();
            };

            parserSocket.upload(name, file, opts);
        }

        function inactiveAllImage($exclude) {
            $('.image-active').not($exclude).removeClass('image-active');
            menuFactory.items.duplicate.enabled = false;

            if (0 === $('.image-active').length) {
                $target_image = null;

                self.setState({
                    selectedImage: false
                });
            }
        }

        function refreshImagePanelPos() {
            if (null !== $target_image) {
                var pos = $target_image.box(true),
                    imagePanel = self.refs.imagePanel,
                    platformPos = $laser_platform.box(true),
                    windowPos = $('body').box(true),
                    initialPosition = {
                        left: pos.right + 10,
                        top: pos.center.y - 66
                    };

                // check position top
                if ('undefined' !== typeof imagePanel && pos.bottom > windowPos.bottom) {
                    initialPosition.top = windowPos.bottom - imagePanel.getDOMNode().clientHeight;
                }

                if (windowPos.top > initialPosition.top) {
                    initialPosition.top = windowPos.top;
                }

                // check position left
                if (initialPosition.left > platformPos.right) {
                    initialPosition.left = platformPos.right + 10;
                }

                self.setState({
                    initialPosition: initialPosition
                });
            }
        }

        // on window resize
        window.addEventListener('resize', function(e) {
            refreshImagePanelPos();
        });

        resetPosTimer = setInterval(resetPosition, 200);

        return {
            handleLaser: function(settings) {
                handleLaser(
                    settings,
                    sendToMachine,
                    ProgressConstants.STEPPING
                );
            },
            sendToMachine: sendToMachine,
            exportTaskCode: function(settings, fileMode) {
                handleLaser(
                    settings,
                    function(blob, fileMode) {
                        var extension = ('-f' === fileMode ? 'fc' : 'gcode'),
                            // split by . and get unless the last then join as string
                            fileName = self.state.images[0].name.split('.').slice(0, -1).join(''),
                            fullName = fileName + '.' + extension;

                        saveAs(blob, fullName);
                    },
                    ProgressConstants.STEPPING,
                    fileMode || '-f'
                );
            },
            destroySocket: function() {
                if ('undefined' !== typeof bitmapWebSocket) {
                    bitmapWebSocket.connection.close(false);
                }

                if ('undefined' !== typeof svgWebSocket) {
                    svgWebSocket.connection.close(false);
                }
            },
            resetFileFormat: function() {
                self.setState({
                    fileFormat: undefined
                });
            },
            onReadFileStarted: function(e) {
                var firstFile = e.target.files.item(0),
                    setupPanel = self.refs.setupPanel,
                    extension = self.refs.fileUploader.getFileExtension(firstFile.name),
                    currentFileFormat = self.state.fileFormat,
                    totalfiles = [],
                    goodFiles = [];

                $uploadDeferred = $.Deferred();

                $uploadDeferred.progress(function(file, isEnd) {
                    totalfiles.push(file);

                    if (false === file.invaild) {
                        goodFiles.push(file);
                    }

                    if (true === isEnd) {
                        $uploadDeferred.resolve({
                            total: totalfiles,
                            good: goodFiles
                        });
                    }
                }).always(function(files) {
                    var badFiles = files.total.filter(function(file) {
                            return 0 < file.error.length;
                        }),
                        messages = [];

                    badFiles.forEach(function(file, i) {
                        messages.push('[' + file.name + ']');
                        messages = messages.concat(file.error);
                    });

                    if (0 < badFiles.length) {
                        AlertActions.showPopupWarning('svg-parse-fail', messages.join('\n'));
                    }
                }).done(function(files) {
                    var operationMode = ('svg' === self.state.fileFormat ? 'cut' : 'engrave'),
                        hasImage = (0 < self.state.images.length + files.good.length);

                    self.state.images = self.state.images.concat(files.good);

                    menuFactory.items.execute.enabled = hasImage;
                    menuFactory.items.saveTask.enabled = hasImage;

                    self.setState({
                        images: self.state.images,
                        hasImage: hasImage,
                        mode: operationMode,
                        fileFormat: (0 < self.state.images.length ? currentFileFormat : undefined)
                    });
                });

                ProgressActions.open(ProgressConstants.NONSTOP);

                if ('string' !== typeof currentFileFormat) {
                    currentFileFormat = ('svg' === extension ? 'svg' : 'bitmap');
                    // in draw mode. only svg files are acceptable.
                    currentFileFormat = (self.props.page === 'draw' ? 'svg' : currentFileFormat);
                    self.setState({
                        fileFormat: currentFileFormat
                    });
                }

                if ('svg' === currentFileFormat) {
                    svgWebSocket = svgWebSocket || svgLaserParser({
                        isLaser: 'laser' === self.props.page
                    });
                }
                else {
                    bitmapWebSocket = bitmapWebSocket || bitmapLaserParser();
                }
            },
            onFileReading: function(file, isEnd, deferred) {
                var name = 'image-' + (new Date()).getTime(),
                    parserSocket;

                // go svg process
                if ('svg' === self.state.fileFormat) {
                    if ('svg' === file.extension) {
                        parserSocket = svgWebSocket;
                    }
                    else {
                        ProgressActions.close();
                        AlertActions.showPopupError('svg-only', lang.laser.svg_only);
                    }
                }
                // go bitmap process
                else {
                    parserSocket = bitmapWebSocket;
                }

                if ('undefined' !== typeof parserSocket) {
                    handleUploadImage(file, parserSocket, isEnd, deferred);
                }
            },
            thresholdChanged: function(threshold) {
                var $el = $('.image-active:eq(0)');

                $el.data('threshold', threshold);
                refreshImage($el, threshold);
            },
            inactiveAllImage: inactiveAllImage,
            imageTransform: function(e, params) {
                var $el = $(e.currentTarget),
                    type = $el.data('type'),
                    box = $el.box(),
                    val = $el.val(),
                    freetrans = $target_image.data('freetrans'),
                    args = {
                        maintainAspectRatio: params.sizeLock
                    };

                $target_image.data('sizeLock', params.sizeLock);
                val = parseFloat(val, 10);

                switch (type) {
                case 'x':
                case 'y':
                    val = convertToHtmlCoordinate(val, type);
                    args[type] = val;
                    break;
                case 'width':
                    val = round(val / DIAMETER * PLATFORM_DIAMETER_PIXEL, -2);
                    args.scalex = round(val / freetrans.originalSize.width, -2);
                    val = round(params.size.height / DIAMETER * PLATFORM_DIAMETER_PIXEL, -2);
                    args.scaley = round(val / freetrans.originalSize.height, -2);
                    break;
                case 'height':
                    val = round(val / DIAMETER * PLATFORM_DIAMETER_PIXEL, -2);
                    args.scaley = round(val / freetrans.originalSize.height, -2);
                    val = round(params.size.width / DIAMETER * PLATFORM_DIAMETER_PIXEL, -2);
                    args.scalex = round(val / freetrans.originalSize.width, -2);
                    break;
                case 'angle':
                    args.angle = val;
                }

                refreshObjectParams(e, $target_image);

                refreshImagePanelPos();
                self.setState(params);

                $target_image.freetrans(args);
            },
            menuFactory: menuFactory,
            setPlatform: function(el) {
                $laser_platform = $(el);
                PLATFORM_DIAMETER_PIXEL = $laser_platform.width();
            },
            refreshImage: refreshImage,
            getCurrentImages: function() {
                return $('.' + LASER_IMG_CLASS);
            },
            destroy: function() {
                clearInterval(resetPosTimer);
            }
        };
    };
});
