define([
    'jquery',
    'helpers/api/bitmap-laser-parser',
    'helpers/api/svg-laser-parser',
    'helpers/convertToTypedArray',
    'helpers/element-angle',
    'helpers/api/control',
    'jsx!views/Print-Selector',
    'jsx!widgets/Modal',
    'helpers/shortcuts',
    'helpers/image-data',
    'helpers/nwjs/menu-factory',
    'freetrans',
    'helpers/jquery.box',
    'plugins/file-saver/file-saver.min'
], function(
    $,
    bitmapLaserParser,
    svgLaserParser,
    convertToTypedArray,
    elementAngle,
    control,
    PrinterSelector,
    Modal,
    shortcuts,
    imageData,
    menuFactory
) {
    'use strict';

    return function(args) {
        args = args || {};

        var self = this,    // react component
            DIAMETER = 170,    // 170mm
            bitmapWebSocket,
            svgWebSocket,
            LASER_IMG_CLASS = 'img-container',
            $laser_platform = $('.laser-object'),
            PLATFORM_DIAMETER_PIXEL = $laser_platform.width(),
            deleteImage = function() {
                var $img_container = $('.' + LASER_IMG_CLASS).not($target_image),
                    $img = $target_image,
                    reset_file_type = false;

                if (null !== $target_image) {
                    // delete svg blob from history
                    if ('svg' === self.props.fileFormat && true === $img.hasClass('svg')) {
                        svgWebSocket.History.deleteAt($img.data('name'));
                    }

                    $target_image.parents('.ft-container').remove();

                    if (0 === $img_container.length) {
                        $target_image = null;
                        self.setState({
                            hasImage: false
                        });

                        menuFactory.items.execute.enabled = false;
                        menuFactory.items.saveGCode.enabled = false;
                        self.props.fileFormat = undefined;
                    }
                    else {
                        $target_image = $img_container[0];
                    }
                }
            },
            refreshImage = function($img, threshold) {
                var box = $img.box();

                imageData(
                    $img.data('base'),
                    {
                        height: box.height,
                        width: box.width,
                        grayscale: {
                            is_rgba: true,
                            threshold: parseInt(threshold, 10)
                        },
                        onComplete: function(result) {
                            $img.attr('src', result.canvas.toDataURL('image/png'));
                        }
                    }
                );
            },
            sendToMachine = function(blob) {
                var control_methods = control(self.state.selectedPrinter.serial);
                control_methods.upload(blob.size, blob);
            },
            sendToBitmapAPI = function(args, settings, callback) {
                callback = callback || function() {};

                var laserParser = bitmapWebSocket,
                    onSetParamsFinished = function() {
                        laserParser.compute(args, {
                            onFinished: onUploadFinish
                        });
                    },
                    onUploadFinish = function() {
                        laserParser.getGCode({
                            onFinished: callback
                        });
                    };

                laserParser.params.setEach(
                    settings,
                    {
                        onFinished: onSetParamsFinished
                    }
                );
            },
            sendToSVGAPI = function(args, settings, callback) {
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

                        laserParser.getGCode(
                            names,
                            {
                                onFinished: callback
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

                return mm;
            },
            convertToHtmlCoordinate = function(n, axis) {

                var ratio = PLATFORM_DIAMETER_PIXEL / DIAMETER, // 1(px) : N(mm)
                    r = DIAMETER / 2,
                    px;

                n = parseFloat(n, 10) + r;
                px = n * ratio;

                if ('x' === axis) {
                    px -= ($target_image.width() / 2);
                }
                else {
                    px -= ($target_image.height() / 2);
                }

                return px;
            },
            refreshObjectParams = function(e, $el) {
                var el_position,
                    last_x, last_y,
                    platform_pos = $laser_platform.box(),
                    imagePanelRefs = self.refs.imagePanel.refs,
                    outOfRange = function(point, limit) {
                        var x = Math.pow((platform_pos.center.x - point.x), 2),
                            y = Math.pow((platform_pos.center.y - point.y), 2),
                            range = Math.sqrt(x + y);

                        return range > limit;
                    };

                if (null !== $el) {
                    el_position = $el.box();

                    if ('move' === e.freetransEventType) {
                        if (true === outOfRange(el_position.center, DIAMETER)) {
                            last_x = $el.data('last-x');
                            last_y = $el.data('last-y');

                            $el.freetrans({
                                x: last_x,
                                y: last_y
                            });
                        }
                        else {
                            $el.data('last-x', parseFloat($el[0].style.left, 10)).
                                data('last-y', parseFloat($el[0].style.top, 10));
                        }
                    }
                    else {
                        refreshImage($el, getThreshold().getDOMNode().value);
                    }

                    imagePanelRefs.objectAngle.getDOMNode().value = elementAngle($el[0]);
                    imagePanelRefs.objectPosX.getDOMNode().value = convertToRealCoordinate(el_position.center.x, 'x').toString().substr(0, 4);
                    imagePanelRefs.objectPosY.getDOMNode().value = convertToRealCoordinate(el_position.center.y, 'y').toString().substr(0, 4);
                    imagePanelRefs.objectSizeW.getDOMNode().value = (el_position.width / PLATFORM_DIAMETER_PIXEL * DIAMETER).toString().substr(0, 4);
                    imagePanelRefs.objectSizeH.getDOMNode().value = (el_position.height / PLATFORM_DIAMETER_PIXEL * DIAMETER).toString().substr(0, 4);
                }
            },
            $target_image = null, // changing when image clicked
            printer = null,
            printer_selecting = false,
            getThreshold = function() {
                var imagePanelRefs = self.refs.imagePanel.refs;

                return (imagePanelRefs.threshold || {
                    getDOMNode: function() {
                        return {
                            value: 255
                        };
                    }
                });
            },
            handleLaser = function(settings, callback) {

                var $ft_controls = $laser_platform.find('.ft-controls'),
                    _callback = function() {
                        callback.apply(null, arguments);
                        self._openBlocker(false);
                    },
                    getPoint = function($el, position) {
                        var containerOffset = $laser_platform.offset(),
                            offset = $el.offset(),
                            width = $el.width(),
                            height = $el.height(),
                            // default as bottom-right
                            pointX = offset.left - containerOffset.left,
                            pointY = offset.top - containerOffset.top;

                        if ('top-left' === position) {
                            pointX = pointX + width;
                            pointY = pointY + height;
                        }

                        return {
                            x: pointX,
                            y: pointY
                        };
                    },
                    args = [],
                    doLaser = function(settings) {
                        var imagePanelRefs = self.refs.imagePanel.refs,
                            threshold = getThreshold();

                        $ft_controls.each(function(k, el) {
                            var $el = $(el),
                                image = new Image(),
                                top_left = getPoint($el.find('.ft-scaler-top.ft-scaler-left'), 'top-left'),
                                bottom_right = getPoint($el.find('.ft-scaler-bottom.ft-scaler-right'), 'bottom-right'),
                                $img = $el.parents('.ft-container').find('img'),
                                width = 0,
                                height = 0,
                                sub_data = {
                                    name: $img.data('name') || '',
                                    tl_position_x: convertToRealCoordinate(top_left.x, 'x'),
                                    tl_position_y: convertToRealCoordinate(top_left.y, 'y'),
                                    br_position_x: convertToRealCoordinate(bottom_right.x, 'x'),
                                    br_position_y: convertToRealCoordinate(bottom_right.y, 'y'),
                                    rotate: (Math.PI * elementAngle(el) / 180) * -1,
                                    threshold: parseInt(threshold.getDOMNode().value, 10)
                                },
                                grayscaleOpts = {
                                    is_svg: ('svg' === self.props.fileFormat),
                                    threshold: 255
                                },
                                src = $img.data('base'),
                                previewImageSize;

                            if ('svg' === self.props.fileFormat) {
                                previewImageSize = svgWebSocket.computePreviewImageSize({
                                    width: $img.box().width,
                                    height: $img.box().height
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

                                        if ('svg' === self.props.fileFormat) {
                                            sub_data.svg_data = svgWebSocket.History.findByName($img.data('name'))[0].data;
                                        }

                                        sub_data.real_width = sub_data.width / $laser_platform.width() * DIAMETER;
                                        sub_data.real_height = sub_data.height / $laser_platform.height() * DIAMETER;

                                        args.push(sub_data);

                                        if (args.length === $ft_controls.length) {
                                            // sending data
                                            if ('svg' === self.props.fileFormat) {
                                                sendToSVGAPI(args, settings, _callback);
                                            }
                                            else {
                                                sendToBitmapAPI(args, settings, _callback);
                                            }
                                        }
                                    }
                                }
                            );
                        });
                    };

                self._openBlocker(true);

                doLaser(settings);
            };

        shortcuts.on(
            ['cmd', 'del'],
            function(e) {
                deleteImage();
            }
        );

        function setupImage(file, size, originalUrl, name) {
            var img = new Image(),
                $img = $(img).addClass(LASER_IMG_CLASS),
                instantRefresh = function(e, data) {
                    refreshObjectParams(e, $img);
                };

            $img.addClass(file.extension).
                attr('src', file.url).
                data('name', name).
                data('base', originalUrl).
                data('size', size).
                width(size.width).
                height(size.height);

            $img.one('load', function() {
                $img.freetrans({
                    x: $laser_platform.outerWidth() / 2 - size.width / 2,
                    y: $laser_platform.outerHeight() / 2 - size.height / 2,
                    originalSize: size,
                    onRotate: instantRefresh,
                    onMove: instantRefresh,
                    onScale: instantRefresh,
                    angle: size.angle || 0
                });
                $img.parent().find('.ft-controls').width(size.width).height(size.height);

                // set default image
                if (null === $target_image) {
                    $target_image = $img;
                    refreshObjectParams({ freetransEventType: 'move' }, $img);
                }

                // onmousedown
                (function(file, size, originalUrl, name, $img) {
                    $img.parent().find('.ft-controls').on('mousedown', function(e) {
                        var $self = $(e.target),
                            clone = function() {
                                var data = $img.data('freetrans');

                                size.width = size.width * data.scalex;
                                size.height = size.height * data.scaley;
                                size.angle = elementAngle($img[0]);

                                setupImage(file, size, originalUrl, name);

                                self.setState({
                                    hasImage: true,
                                });
                            };

                        inactiveAllImage();
                        $target_image = $self.parent().find('.' + LASER_IMG_CLASS);
                        refreshObjectParams({ freetransEventType: 'move' }, $target_image);

                        $self.addClass('image-active');
                        menuFactory.items.copy.enabled = true;
                        menuFactory.items.copy.onClick = function() {
                            menuFactory.items.paste.enabled = true;
                            menuFactory.items.paste.onClick = clone;
                        };
                        menuFactory.items.cut.enabled = true;
                        menuFactory.items.cut.onClick = function() {
                            deleteImage();

                            menuFactory.items.paste.enabled = true;
                            menuFactory.items.paste.onClick = function() {
                                clone();
                                menuFactory.items.paste.enabled = false;
                            };
                        };
                        menuFactory.items.duplicate.enabled = true;
                        menuFactory.items.duplicate.onClick = clone;
                    });
                })(file, size, originalUrl, name, $img);
            });


            $laser_platform.append($img);

            return $img;
        }

        function handleUploadImage(file, parserSocket) {
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

                    imageData(blob, {
                        width: size.width,
                        height: size.height,
                        type: file.type,
                        grayscale: {
                            is_rgba: true,
                            threshold: 128
                        },
                        onComplete: function(result) {
                            file.url = result.canvas.toDataURL('svg' === file.extension ? 'image/svg+xml' : 'image/png');
                            setupImage(file, size, objectUrl, name);
                        }
                    });
                };

            opts.onFinished = onUploadFinished;

            parserSocket.upload(name, file, opts);
        }

        function inactiveAllImage() {
            $('.image-active').removeClass('image-active');
            menuFactory.items.copy.enabled = false;
            menuFactory.items.cut.enabled = false;
            menuFactory.items.duplicate.enabled = false;
        }

        return {
            handleLaser: function(settings) {
                handleLaser(
                    settings,
                    sendToMachine
                );
            },
            sendToMachine: sendToMachine,
            export: function(settings) {
                handleLaser(
                    settings,
                    function(blob) {
                        var file_name = (new Date()).getTime() + '.gcode';
                        saveAs(blob, file_name);
                        self._openBlocker(false);
                    }
                );
            },
            destroySocket: function() {
                if ('undefined' !== typeof bitmapWebSocket) {
                    bitmapWebSocket.connection.close(false);
                }

                if ('undefined' !== typeof svgWebSocket) {
                    svgWebSocket.connection.close(false);
                }

                shortcuts.off(['cmd', 'del']);
            },
            resetFileFormat: function() {
                self.setProps({
                    fileFormat: undefined
                });
            },
            onReadFileStarted: function(e) {
                var firstFile = e.target.files.item(0),
                    setupPanel = self.refs.setupPanel,
                    extension = setupPanel.refs.fileUploader.getFileExtension(firstFile.name),
                    currentFileFormat = self.props.fileFormat;

                if ('string' !== typeof currentFileFormat) {
                    currentFileFormat = ('svg' === extension ? 'svg' : 'bitmap');
                    self.setProps({
                        fileFormat: currentFileFormat
                    });
                }

                if ('svg' === currentFileFormat) {
                    svgWebSocket = svgWebSocket || svgLaserParser();
                }
                else {
                    bitmapWebSocket = bitmapWebSocket || bitmapLaserParser();
                }
            },
            onFileReading: function(file) {
                var name = 'image-' + (new Date()).getTime(),
                    parserSocket;

                // go svg process
                if ('svg' === self.props.fileFormat) {
                    if ('svg' === file.extension) {
                        parserSocket = svgWebSocket;
                    }
                    else {
                        // TODO: ignore non-svg file?
                    }
                }
                // go bitmap process
                else {
                    parserSocket = bitmapWebSocket;
                }

                if ('undefined' !== typeof parserSocket) {
                    handleUploadImage(file, parserSocket);
                }
            },
            onFileReadEnd: function(e, files) {
                self.setState({
                    step: 'start',
                    hasImage: 0 < files.length,
                    mode: ('svg' === self.props.fileFormat ? 'cut' : 'engrave')
                });

                menuFactory.items.execute.enabled = true;
                menuFactory.items.saveGCode.enabled = true;
            },
            thresholdChanged: function(e, threshold) {
                var $el, bounds;

                $('.' + LASER_IMG_CLASS).each(function(k, el) {
                    $el = $(el);
                    bounds = $el.freetrans('getBounds');
                    refreshImage($el, threshold);
                });
            },
            inactiveAllImage: inactiveAllImage,
            imageTransform: function(e) {
                var $el = $(e.currentTarget),
                    type = $el.data('type'),
                    val = $el.val(),
                    freetrans = $target_image.data('freetrans'),
                    args = {};

                val = parseFloat(val, 10);

                switch (type) {
                case 'x':
                case 'y':
                    val = convertToHtmlCoordinate(val, type);
                    args[type] = val;
                    break;
                case 'width':
                    val = parseFloat((val / DIAMETER * PLATFORM_DIAMETER_PIXEL).toString().substr(0, 4), 10);
                    args.scalex = parseFloat(val / freetrans.originalSize.width, 10);
                    break;
                case 'height':
                    val = parseFloat((val / DIAMETER * PLATFORM_DIAMETER_PIXEL).toString().substr(0, 4), 10);
                    args.scaley = parseFloat(val / freetrans.originalSize.height, 10);
                    break;
                case 'angle':
                    args.angle = val;
                }

                $target_image.freetrans(args);
            },
            menuFactory: menuFactory
        };
    };
});