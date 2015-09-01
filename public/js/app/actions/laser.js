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
    imageData
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
                    $img = $target_image.find('img'),
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
                        self.props.fileFormat = undefined;
                    }
                    else {
                        $target_image = $img_container[0];
                    }
                }
            },
            refreshImage = function($img, threshold) {
                imageData(
                    $img.data('base'),
                    {
                        height: $img.height(),
                        width: $img.width(),
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
            refreshObjectParams = function(e, $el) {
                var bounds, el_offset, el_position,
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
                    bounds = $el.freetrans('getBounds');

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

                    refreshImage($el.find('img'), 128);

                    imagePanelRefs.objectAngle.getDOMNode().value = elementAngle($el[0]);
                    imagePanelRefs.objectPosX.getDOMNode().value = $el.data('last-x');
                    imagePanelRefs.objectPosY.getDOMNode().value = $el.data('last-y');
                    imagePanelRefs.objectSizeW.getDOMNode().value = bounds.height / PLATFORM_DIAMETER_PIXEL * DIAMETER;
                    imagePanelRefs.objectSizeH.getDOMNode().value = bounds.width / PLATFORM_DIAMETER_PIXEL * DIAMETER;
                }
            },
            $target_image = null, // changing when image clicked
            printer = null,
            printer_selecting = false,
            handleLaser = function(settings, callback) {

                var $ft_controls = $laser_platform.find('.ft-controls'),
                    _callback = function() {
                        callback.apply(null, arguments);
                        self._openBlocker(false);
                    },
                    convertToRealCoordinate = function(px, axis) {
                        var ratio = DIAMETER / PLATFORM_DIAMETER_PIXEL, // 1(px) : N(mm)
                            r = PLATFORM_DIAMETER_PIXEL / 2 * ratio,
                            mm = ratio * px - r;

                        if ('y' === axis.toLowerCase()) {
                            mm = mm * -1;
                        }

                        return mm;
                    },
                    getCenter = function($el) {
                        var container_offset = $laser_platform.offset(),
                            offset = $el.offset(),
                            half_width = $el.width() / 2,
                            half_height = $el.height() / 2;

                        return {
                            x: offset.left - container_offset.left + half_width,
                            y: offset.top - container_offset.top + half_height
                        };
                    },
                    args = [],
                    doLaser = function(settings) {
                        var imagePanelRefs = self.refs.imagePanel.refs,
                            threshold = (imagePanelRefs.threshold || {
                                getDOMNode: function() {
                                    return {
                                        value: 0
                                    };
                                }
                            });

                        $ft_controls.each(function(k, el) {
                            var $el = $(el),
                                image = new Image(),
                                top_left = getCenter($el.find('.ft-scaler-top.ft-scaler-left')),
                                bottom_right = getCenter($el.find('.ft-scaler-bottom.ft-scaler-right')),
                                $img = $el.parents('.ft-container').find('.img-container img'),
                                width = $el.width(),
                                height = $el.height(),
                                sub_data = {
                                    name: $img.data('name') || '',
                                    width: width,
                                    height: height,
                                    tl_position_x: convertToRealCoordinate(top_left.x, 'x'),
                                    tl_position_y: convertToRealCoordinate(top_left.y, 'y'),
                                    br_position_x: convertToRealCoordinate(bottom_right.x, 'x'),
                                    br_position_y: convertToRealCoordinate(bottom_right.y, 'y'),
                                    rotate: (Math.PI * elementAngle(el) / 180) * -1,
                                    threshold: parseInt(threshold.getDOMNode().value, 10)
                                },
                                grayscaleOpts = {
                                    is_svg: ('svg' === self.props.fileFormat)
                                },
                                src = '';

                            if ('svg' === self.props.fileFormat) {
                                src = $img.attr('src');
                            }
                            else {
                                src = $img.data('base');
                            }

                            imageData(
                                src,
                                {
                                    height: height,
                                    width: width,
                                    grayscale: grayscaleOpts,
                                    onComplete: function(result) {
                                        sub_data.image_data = result.imageBinary;

                                        if ('svg' === self.props.fileFormat) {
                                            sub_data.real_width = sub_data.width / $laser_platform.width() * DIAMETER;
                                            sub_data.real_height = sub_data.height / $laser_platform.height() * DIAMETER;
                                            sub_data.svg_data = svgWebSocket.History.findByName($img.data('name'))[0].data;
                                        }

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

        function setupImage(file, size, url, name) {
            var $div = $(document.createElement('div')).addClass(LASER_IMG_CLASS),
                img = new Image(),
                $img = $(img),
                instantRefresh = function(e, data) {
                    refreshObjectParams(e, $div);
                };

            $img.addClass(file.extension).
                attr('src', file.url).
                data('name', name).
                data('base', url).
                data('size', size);

            $img.one('load', function() {
                $div.freetrans({
                    x: $laser_platform.outerWidth() / 2 - $img.width() / 2,
                    y: $laser_platform.outerHeight() / 2 - $img.height() / 2,
                    onRotate: instantRefresh,
                    onMove: instantRefresh,
                    onScale: instantRefresh
                });

                $div.parent().find('.ft-controls').on('mousedown', function(e) {
                    var $self = $(e.target);

                    inactiveAllImage();
                    $target_image = $self.parent().find('.' + LASER_IMG_CLASS);
                    $target_image.find('img').addClass('image-active');
                });
            });

            // set default image
            $target_image = $div;

            $div.append($img);
            $laser_platform.append($div);

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
                        platformWidth = $laser_platform.width(),
                        platformHeight = $laser_platform.height(),
                        ratio = 1;

                    if (size.width > platformWidth || size.height > platformHeight) {
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
                            file.url = result.canvas.toDataURL('image/png');

                            setupImage(file, size, objectUrl, name);
                        }
                    });
                };

            opts.onFinished = onUploadFinished;

            parserSocket.upload(name, file, opts);
        }

        function inactiveAllImage() {
            $('.image-active').removeClass('image-active');
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

                handleUploadImage(file, parserSocket);
            },
            onFileReadEnd: function(e, files) {
                self.setState({
                    step: 'start',
                    hasImage: 0 < files.length,
                    mode: ('svg' === self.props.fileFormat ? 'cut' : 'engrave')
                });
            },
            thresholdChanged: function(e, threshold) {
                $('.' + LASER_IMG_CLASS).find('img').each(function(k, el) {
                    refreshImage($(el), threshold);
                });
            },
            inactiveAllImage: inactiveAllImage
        };
    };
});