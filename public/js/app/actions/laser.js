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
    'helpers/device-error-handler',
    'helpers/check-device-status',
    'freetrans',
    'helpers/jquery.box',
    'plugins/file-saver/file-saver.min',
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
    ProgressConstants,
    DeviceErrorHandler,
    CheckDeviceStatus
) {
    'use strict';

    return function(args) {
        args = args || {};

        var self = this,    // react component
            IMAGE_REAL_RATIO = 4.7244094488, // 1mm = 4.72px
            DIAMETER = 300,    // 170mm
            ACCEPTABLE_MIN_SIZE = 1, // width * height > 1
            bitmapWebSocket,
            svgWebSocket,
            LASER_IMG_CLASS = 'img-container',
            $laser_platform,
            lang = i18n.get(),
            fileFormat = '',
            PLATFORM_DIAMETER_PIXEL,
            _onUploadResponse = function(response) {
                var url = window.URL,
                    platformDiameter = $laser_platform.width(),
                    ratio = 1,
                    messages = [];

                // handle bad files
                response.files.forEach((file, i) => {
                    file.url = url.createObjectURL(file.blob, { type: file.type });
                    file.imgSize = file.imgSize || { width: 0, height: 0 };

                    // convert image size with 120dpi
                    file.imgSize.width = file.imgSize.width / IMAGE_REAL_RATIO / DIAMETER * platformDiameter;
                    file.imgSize.height = file.imgSize.height / IMAGE_REAL_RATIO / DIAMETER * platformDiameter;

                    if (platformDiameter < Math.max(file.imgSize.width , file.imgSize.height)) {
                        ratio = Math.min(360 / file.imgSize.width, 360 / file.imgSize.height);
                        file.imgSize.width = file.imgSize.width * ratio;
                        file.imgSize.height = file.imgSize.height * ratio;
                    }
                    console.log('platformDiameter', platformDiameter);

                    if ('good' === file.status &&
                        ACCEPTABLE_MIN_SIZE > file.imgSize.width * file.imgSize.height
                    ) {
                        file.status = 'bad';
                        file.messages.push(lang.message.image_is_too_small);
                        file.isBroken = true;
                    }

                    if ('bad' === file.status) {
                        messages.push('[' + file.name + ']');

                        file.messages.forEach((errorCode, i) => {
                            messages.push(lang.laser.svg_fail_messages[errorCode] || lang.laser.svg_fail_messages.SVG_BROKEN);
                        });
                    }
                });

                if (0 < messages.length) {
                    AlertActions.showPopupWarning('svg-parse-fail', messages.join('\n'));
                }

                ProgressActions.close();
            },
            _onUploaded = function(response) {
                var goodFiles = response.files.filter((file) => {
                        return false === file.isBroken;
                    }),
                    currentFileFormat = self.state.fileFormat,
                    hasImage = (0 < self.state.images.length + goodFiles.length);

                self.state.images = self.state.images.concat(goodFiles);

                menuFactory.items.alignCenter.enabled = hasImage;
                menuFactory.items.execute.enabled = hasImage;
                menuFactory.items.saveTask.enabled = hasImage;
                menuFactory.items.clear.enabled = true;
                menuFactory.methods.refresh();

                self.setState({
                    images: self.state.images,
                    hasImage: hasImage,
                    mode: self.props.page,
                    fileFormat: (0 < self.state.images.length ? currentFileFormat : undefined)
                });

                goodFiles.forEach(function(file) {
                    handleUploadImage(file);
                });
            },
            deleteImage = function() {
                var $img_container = $('.' + LASER_IMG_CLASS).not($target_image),
                    $img = $target_image,
                    state = {
                        selectedImage: false,
                        debug: false
                    };

                if (null !== $target_image) {
                    // delete svg blob from history
                    if (fileFormat === 'svg' && $img.hasClass('svg')) {
                        svgWebSocket.History.deleteAt($img.data('name'));
                    }

                    $target_image.parents('.ft-container').remove();

                    if (0 === $img_container.length) {
                        $target_image = null;
                        state.hasImage = false;
                        state.images = [];

                        menuFactory.items.alignCenter.enabled = false;
                        menuFactory.items.duplicate.enabled = false;
                        menuFactory.items.execute.enabled = false;
                        menuFactory.items.saveTask.enabled = false;
                        menuFactory.methods.refresh();
                        fileFormat = '';
                    }
                    else {
                        $target_image = $img_container[0];
                    }

                    self.setState(state);
                }
            },
            clearScene = function() {
                $('.ft-container').remove();
                self.setState({
                    images: [],
                    hasImage: false
                });
                menuFactory.items.clear.enabled = false;
            },
            refreshImage = function($img, threshold) {
                var freetrans = $img.data('freetrans'),
                    box = {
                        height: $img.height() * freetrans.scaley,
                        width: $img.width() * freetrans.scalex,
                    };
                console.log("referesh iamge", threshold, self.refs.setupPanel.isShading(), self.state.fileFormat);
                imageData(
                    $img.data('file').blob,
                    {
                        height: box.height,
                        width: box.width,
                        grayscale: {
                            is_rgba: true,
                            is_shading: self.refs.setupPanel.isShading(),
                            threshold: parseInt(threshold, 10),
                            is_svg: (fileFormat === 'svg')
                        },
                        onComplete: function(result) {
                            $img.attr('src', result.canvas.toDataURL('image/png'));
                        }
                    }
                );
            },
            sendToMachine = function(blob) {
                var blobUrl = window.URL,
                    source = (self.props.page || '').toUpperCase(),
                    fcodeReaderMethods = fcodeReader(),
                    goToMonitor = function(thumbnailBlob) {
                        ProgressActions.close();
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
                            fcodeReaderMethods.getThumbnail().then((data) => {
                            goToMonitor(data);
                        });
                    },
                    uploadFCode = function() {
                        fcodeReaderMethods.upload(blob).then(() => {
                            parseFCode();
                        });
                    };

                ProgressActions.updating(lang.message.uploading_fcode, 100);
                uploadFCode();
            },
            ExportGCodeProgressing = function(data) {
                ProgressActions.open(ProgressConstants.STEPPING);
                ProgressActions.updating(data.message, data.percentage * 100);
            },
            sendToBitmapAPI = function(args, settings, callback, fileMode) {
                callback = callback || function() {};

                var laserParser = bitmapWebSocket,
                    onSetParamsFinished = function() {
                        laserParser.compute(args).done(onUploadFinish);
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
                        laserParser.compute(args).done(onComputeFinished);
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
                    mm = ratio * px;

                if (axis.toLowerCase() === 'x') {
                    mm = DIAMETER - mm;
                }

                console.log('axis', axis, mm);
                return round(mm, -2);
            },
            convertToHtmlCoordinate = function(n, axis) {
                var ratio = PLATFORM_DIAMETER_PIXEL / DIAMETER, // 1(px) : N(mm)
                    freetrans = $target_image.data('freetrans'),
                    px;

                n = parseFloat(n, 10);
                px = n * ratio;

                console.log('234234', freetrans, PLATFORM_DIAMETER_PIXEL, DIAMETER, n, px);
                console.log('$target_image.width', $target_image.width())

                if ('x' === axis) {
                    px -= ($target_image.width() * freetrans.scalex / 2);
                    px -= ($target_image.width() * (1 - freetrans.scalex));
                    //px = PLATFORM_DIAMETER_PIXEL - px;
                }
                else {
                    px -= ($target_image.height() * freetrans.scaley  / 2);
                    px -= ($target_image.height() * (1 - freetrans.scaley));
                }

                console.log('px', px);
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
            resetPosition = function($target) {
                var $img_container = $target || $('.' + LASER_IMG_CLASS),
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
            refreshObjectParams = function(e, $el, returnState) {
                var el_position, el_offset_position, position, size, angle, threshold, data;

                if (null !== $el) {
                    el_position = $el.box();
                    el_offset_position = $el.box(true);
                    data = $el.data('freetrans');

                    // make center display (0, 0) is possible.
                    let x = convertToRealCoordinate(el_position.center.x, 'x'),
                        y = convertToRealCoordinate(el_position.center.y, 'y');
                    position = {
                        x: x > -0.33 && x < 0.33 ? 0 : x,
                        y: y > -0.33 && y < 0.33 ? 0 : y
                    };

                    size = {
                        width: round(el_position.width * DIAMETER / PLATFORM_DIAMETER_PIXEL, -2),
                        height: round(el_position.height * DIAMETER / PLATFORM_DIAMETER_PIXEL, -2)
                    };
                    angle = elementAngle($el[0]);
                    threshold = $el.data('threshold') || 255;

                    if ('scale' === e.freetransEventType) {
                        refreshImage($el, threshold);
                    }

                    resetPosition($el);

                    if (!returnState) {
                        self.setState({
                            position: position,
                            size: size,
                            angle: angle,
                            threshold: threshold
                        }, function() {
                            refreshImagePanelPos();
                        });
                    } else {
                        return {
                            position: position,
                            size: size,
                            angle: angle,
                            threshold: threshold
                        };
                    }
                }
            },
            $target_image = null, // changing when image clicked
            resetPosTimer = null,
            //============== for test async function ===========================
            showOutline = async (object_height, outLine_data) => {
              await DeviceMaster.select(self.state.selectedPrinter);
                ProgressActions.open(
                    ProgressConstants.WAITING,
                    lang.device.showOutline
                );
              await DeviceMaster.showOutline(object_height, outLine_data);
              ProgressActions.close();
            },
            //======================END ========================================

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

            getToolpath = function(settings, callback, progressType, fileMode) {
                fileMode = fileMode || '-f';
                progressType = progressType || ProgressConstants.NONSTOP;

                var $ft_controls = $laser_platform.find('.ft-controls'),
                    _callback = function() {
                        GlobalActions.sliceComplete({ time: arguments[2] });
                        callback.apply(null, arguments);
                    },

                    /*== move to up-level for other function useing===========
                    getPoint = function($el) {
                    //================ END ==================================*/
                    args = [],
                    doLaser = function(settings) {
                        $ft_controls.each(function(k, el) {
                            var $el = $(el),
                                top_left = getPoint($el.find('.ft-scaler-top.ft-scaler-left')),
                                bottom_right = getPoint($el.find('.ft-scaler-bottom.ft-scaler-right')),
                                $img = $el.parents('.ft-container').find('img'),
                                box = $img.box(),
                                width = 0,
                                height = 0,
                                sub_data = {
                                    name: $img.data('name') || '',
                                    tl_position_x: convertToRealCoordinate(top_left.x, 'x'),
                                    tl_position_y: convertToRealCoordinate(top_left.y, 'y'),
                                    br_position_x: convertToRealCoordinate(bottom_right.x, 'x'),
                                    br_position_y: convertToRealCoordinate(bottom_right.y, 'y'),
                                    rotate: (Math.PI * elementAngle(el) / 180) * -1,
                                    threshold: $img.data('threshold') || 255
                                },
                                grayscaleOpts = {
                                    is_svg: (fileFormat === 'svg'),
                                    threshold: 255
                                },
                                src = $img.data('base'),
                                previewImageSize;

                            if (fileFormat === 'svg') {
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

                                        if (fileFormat === 'svg') {
                                            sub_data.svg_data = svgWebSocket.History.findByName($img.data('name'))[0].data;
                                        }

                                        sub_data.real_width = box.width / $laser_platform.width() * DIAMETER;
                                        sub_data.real_height = box.height / $laser_platform.height() * DIAMETER;

                                        args.push(sub_data);

                                        if (args.length === $ft_controls.length) {
                                            // sending data
                                            if (fileFormat === 'svg') {
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

        resetPosTimer = setInterval(resetPosition, 100);

        shortcuts.on(
            ['del'],
            function(e) {
                if ('INPUT' !== e.target.tagName) {
                    deleteImage();
                }
            }
        );

        function setupImage(file, size, originalUrl) {
            var img = new Image(),
                $img = $(img).addClass(LASER_IMG_CLASS),
                instantRefresh = function(e, data) {
                    refreshObjectParams(e, $img);
                },
                $ftControls;

            $img.addClass(file.extension).
                attr('src', file.url).
                data('name', file.uploadName).
                data('base', originalUrl).
                data('file', file).
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
                (function(file, size, originalUrl, $img) {

                    $ftControls.on('mousedown', function(e) {
                        var clone = function() {
                                var data = $img.data('freetrans');

                                size.width = size.width * data.scalex;
                                size.height = size.height * data.scaley;
                                size.angle = elementAngle($img[0]);

                                setupImage(file, size, originalUrl);

                                self.setState({
                                    hasImage: true
                                });
                            },

                            alignCenter = function() {
                              let args = {
                                      maintainAspectRatio: true,
                                      x: convertToHtmlCoordinate(0, 'x'),
                                      y: convertToHtmlCoordinate(0, 'y')
                                  },
                                  params = {
                                    position :{ x: 0, y: 0 },
                                  };

                              self.setState(params);
                              $target_image.freetrans(args);
                              refreshImagePanelPos();
                              refreshObjectParams(e, $target_image);
                            };

                        if (false === $img.hasClass('image-active')) {
                            inactiveAllImage(null, true);

                            $target_image = $img;
                            let objectParamState = refreshObjectParams({ freetransEventType: 'move' }, $img, true);

                            // $img.on('transitionend', function(e) {
                            //     refreshImagePanelPos();
                            // });

                            self.setState(Object.assign({
                                selectedImage: true,
                                sizeLock: $img.data('sizeLock')
                            }, objectParamState), refreshImagePanelPos );



                            $img.addClass('image-active');
                        }
                        setTimeout(() => {
                            // Async heavy call
                            menuFactory.items.duplicate.enabled = true;
                            menuFactory.items.duplicate.onClick = clone;
                            menuFactory.items.alignCenter.enabled = true;
                            menuFactory.items.alignCenter.onClick = alignCenter;
                            menuFactory.methods.refresh();
                        }, 50);
                    });
                })(file, size, originalUrl, $img);
            });


            $laser_platform.append($img);

            return $img;
        }

        function handleUploadImage(file) {
            // if this is svg file that does provide a bigger enough image
            var width = file.imgSize.width,
                height = file.imgSize.height;

            imageData(file.blob, {
                width: width,
                height: height,
                type: file.type,
                grayscale: {
                    is_rgba: true,
                    is_shading: self.refs.setupPanel.isShading(),
                    threshold: 255,
                    is_svg: (fileFormat === 'svg')
                },
                onComplete: function(result) {
                    var originalUrl = file.url;

                    file.url = result.canvas.toDataURL('image/png');

                    setupImage(file, file.imgSize, originalUrl);
                }
            });
        }

        function inactiveAllImage($exclude, dontRefresh) {
            let $imageActive = $('img.image-active');
            if ($exclude) {
                $imageActive = $imageActive.not($exclude);
            }
            $imageActive.removeClass('image-active');

            if (!dontRefresh) {
                menuFactory.items.duplicate.enabled = false;
                menuFactory.items.alignCenter.enabled = false;
                menuFactory.methods.refresh();
            }

            if (!$exclude || ($exclude && $('img.image-active').length === 0)) {
                $target_image = null;

                if (!dontRefresh) {
                    self.setState({
                        selectedImage: false
                    });
                }
                else {
                    return { selectedImage: false };
                }
            }
        }

        function refreshImagePanelPos(returnState) {
            if (null !== $target_image) {
                var pos = $target_image.box(true),
                    imagePanel = self.refs.imagePanel,
                    platformPos = $laser_platform.box(true),
                    windowPos = $('body').box(true),
                    initialPosition = {
                        left: pos.right + 10,
                        top: pos.center.y  - 66
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

                if (!returnState) {
                    self.setState({
                        initialPosition: initialPosition
                    });
                } else {
                    return {
                        initialPosition: initialPosition
                    };
                }
            }
        }

        // on window resize
        window.addEventListener('resize', function(e) {
            refreshImagePanelPos();
        });

        return {
            runCommand: function(settings, command) {
                if (command === 'start') {
                    getToolpath(
                        settings,
                        sendToMachine,
                        ProgressConstants.STEPPING
                    );
                } else if (command === 'showOutline') {
                    let positions = [],
                        objectHeight = settings.object_height,
                        $ft_controls = $laser_platform.find('.ft-controls');
                    console.log('height', objectHeight);
                    $ft_controls.each(function(index, image) {
                        let $image = $(image),
                            tl = getPoint($image.find('.ft-scaler-top.ft-scaler-left')),
                            tr = getPoint($image.find('.ft-scaler-top.ft-scaler-right')),
                            br = getPoint($image.find('.ft-scaler-bottom.ft-scaler-right')),
                            bl = getPoint($image.find('.ft-scaler-bottom.ft-scaler-left')),
                            position = {
                                first: [convertToRealCoordinate(tl.x, 'x'),
                                        convertToRealCoordinate(tl.y, 'y')],
                                second: [convertToRealCoordinate(tr.x, 'x'),
                                         convertToRealCoordinate(tr.y, 'y')],
                                third: [convertToRealCoordinate(br.x, 'x'),
                                        convertToRealCoordinate(br.y, 'y')],
                                fourth: [convertToRealCoordinate(bl.x, 'x'),
                                         convertToRealCoordinate(bl.y, 'y')],
                            };
                        positions.push(position);
                    });
                    showOutline(objectHeight, positions);

                } else if (command === 'calibrate') {
                    DeviceMaster.select(self.state.selectedPrinter).then((printer) => {
                        setTimeout(() => {
                            ProgressActions.open(
                                ProgressConstants.NONSTOP,
                                lang.cut.running_horizontal_adjustment
                            );
                        }, 1);
                        CheckDeviceStatus(self.state.selectedPrinter).then(() => {
                            DeviceMaster.calibrate({forceExtruder: false, doubleZProbe: false, withoutZProbe: true}).done((debug_message) => {
                                setTimeout(() => {
                                    AlertActions.showPopupInfo('zprobed', lang.cut.run_height_adjustment, lang.cut.horizontal_adjustment_completed);
                                }, 100);
                            }).fail((resp) => {
                                console.log('fail');
                                if (resp.error[0] === 'EDGE_CASE') { return; }
                                if (resp.module === 'LASER') {
                                    AlertActions.showPopupError('calibrate-fail', lang.calibration.extruderOnly);
                                }
                                else {
                                    DeviceErrorHandler.processDeviceMasterResponse(resp);
                                    AlertActions.showPopupError('calibrate-fail', DeviceErrorHandler.translate(resp.error));
                                }
                            }).always(() => {
                                ProgressActions.close();
                            });
                        }).fail(() => {
                            ProgressActions.close();
                        });
                    }).fail(() => {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                } else if (command === 'zprobe') {
                    DeviceMaster.select(self.state.selectedPrinter).then((printer) => {
                        setTimeout(() => {
                            ProgressActions.open(
                                ProgressConstants.NONSTOP,
                                lang.cut.running_height_adjustment
                            );
                        }, 1);
                        CheckDeviceStatus(self.state.selectedPrinter).then(() => {
                            DeviceMaster.zprobe({forceExtruder: false}).done((debug_message) => {
                                setTimeout(() => {
                                    AlertActions.showPopupInfo('zprobed', lang.cut.you_can_now_cut, lang.cut.height_adjustment_completed);
                                }, 100);
                            }).fail((resp) => {
                                if (resp.error[0] === 'EDGE_CASE') { return; }
                                if (resp.module === 'LASER') {
                                    AlertActions.showPopupError('zprobe-fail', lang.calibration.extruderOnly);
                                }
                                else {
                                    DeviceErrorHandler.processDeviceMasterResponse(resp);
                                    AlertActions.showPopupError('zprobe-fail', DeviceErrorHandler.translate(resp.error));
                                }
                            }).always(() => {
                                ProgressActions.close();
                            });
                        }).fail(() => {
                            ProgressActions.close();
                        });
                    }).fail(() => {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                }
            },
            sendToMachine: sendToMachine,
            exportTaskCode: function(settings, fileMode) {
                getToolpath(
                    settings,
                    function(blob, fileMode) {
                        var extension = ('-f' === fileMode ? 'fc' : 'gcode'),
                            // split by . and get unless the last then join as string
                            fileName = self.state.images[0].name.split('.').slice(0, -1).join(''),
                            fullName = fileName + '.' + extension;

                        ProgressActions.close();
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
            uploadDefaultLaserImage: function() {
                let activeLang = i18n.getActiveLang(),
                    calibrationLocation = 'img/' + activeLang + '/laser-calibration.png';
                var fileEntry = {};
                fileEntry.name = calibrationLocation;
                fileEntry.toURL = function() {
                    return calibrationLocation;
                };
                var oReq = new XMLHttpRequest();
                oReq.responseType = 'blob';
                console.log('loading laser c');
                bitmapWebSocket = bitmapWebSocket || bitmapLaserParser();
                oReq.onload = function(oEvent) {
                    console.log('on load laser c');
                    var blob = oReq.response;
                    blob.name = calibrationLocation;
                    var file = {
                        blob: blob,
                        name: calibrationLocation,
                        type: 'image/png'
                    }
                    bitmapWebSocket.upload([file]).always(_onUploadResponse).done(_onUploaded);
                };

                oReq.open('GET', calibrationLocation, true);
                oReq.send();
            },
            onReadFileStarted: function(e) {
                var firstFile = e.target.files.item(0),
                    extension = self.refs.fileUploader.getFileExtension(firstFile.name).toLowerCase(),
                    currentFileFormat = self.state.fileFormat;

                fileFormat = extension;
                ProgressActions.open(ProgressConstants.NONSTOP);

                if ('string' !== typeof currentFileFormat) {
                    currentFileFormat = ('svg' === extension.toLowerCase() ? 'svg' : 'bitmap');
                    // in draw mode. only svg files are acceptable.
                    currentFileFormat = self.props.page === 'laser' ? currentFileFormat : 'svg';
                    self.setState({
                        fileFormat: currentFileFormat
                    });
                }
                if (extension === 'svg') {
                    svgWebSocket = svgWebSocket || svgLaserParser({
                        type: self.props.page
                    });
                }
                else {
                    bitmapWebSocket = bitmapWebSocket || bitmapLaserParser();
                }
            },
            onFileReadEnd: function(e, files) {
                var parserSocket;

                // go svg process
                if (fileFormat === 'svg') {
                    parserSocket = svgWebSocket;
                }
                // go bitmap process
                else {
                    parserSocket = bitmapWebSocket;
                }

                // rename
                files.forEach(function(file) {
                    file.uploadName = file.url.split('/').pop();
                });

                parserSocket.upload(files).always(_onUploadResponse).done(_onUploaded);
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
                    val = $el.val(),
                    freetrans = $target_image.data('freetrans'),
                    args = {
                        maintainAspectRatio: params.sizeLock
                    };

                console.log('$el, $target_image', $el, $target_image);
                $target_image.data('sizeLock', params.sizeLock);
                val = parseFloat(val, 10);

                switch (type) {
                case 'x':
                case 'y':
                    val = convertToHtmlCoordinate(val, type);
                    args[type] = val;
                    break;
                case 'width':
                    val = round(val * PLATFORM_DIAMETER_PIXEL / DIAMETER, -2);
                    args.scalex = val / freetrans.originalSize.width;
                    val = round(params.size.height * PLATFORM_DIAMETER_PIXEL / DIAMETER, -2);
                    args.scaley = val / freetrans.originalSize.height;
                    break;
                case 'height':
                    val = round(val * PLATFORM_DIAMETER_PIXEL / DIAMETER, -2);
                    args.scaley = val / freetrans.originalSize.height;
                    val = round(params.size.width * PLATFORM_DIAMETER_PIXEL / DIAMETER, -2);
                    args.scalex = val / freetrans.originalSize.width;
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
                console.log('laser_platform', $laser_platform);
                PLATFORM_DIAMETER_PIXEL = $laser_platform.width();
            },
            refreshImage: refreshImage,
            getCurrentImages: function() {
                return $('.' + LASER_IMG_CLASS);
            },
            destroy: function() {
                clearInterval(resetPosTimer);
            },
            clearScene: clearScene
        };
    };
});
