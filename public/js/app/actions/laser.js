define([
    'jquery',
    'helpers/file-system',
    'helpers/websocket',
    'helpers/api/bitmap-laser-parser',
    'helpers/grayscale',
    'helpers/convertToTypedArray',
    'helpers/api/control',
    'jsx!widgets/Popup',
    'freetrans'
], function(
    $,
    fileSystem,
    WebSocket,
    bitmapLaserParser,
    grayScale,
    convertToTypedArray,
    control,
    popup
) {
    'use strict';

    return function(args, reactComponent) {
        args = args || {};

        var DIAMETER = 170,    // 170mm
            DELECT_KEY_CODE = 68,
            LASER_IMG_CLASS = 'img-container',
            $uploader = $('.file-importer'),
            $uploader_file_control = $uploader.find('[type="file"]'),
            $laser_platform = $('.laser-object'),
            PLATFORM_DIAMETER_PIXEL = $laser_platform.height(),
            $angle = $('[name="object-angle"]'),
            $pos_x = $('[name="object-pos-x"]'),
            $pos_y = $('[name="object-pos-y"]'),
            $size_w = $('[name="object-size-w"]'),
            $size_h = $('[name="object-size-h"]'),
            $threshold = $('[name="threshold"]'),
            deleteImage = function() {
                var $img_container = $('.' + LASER_IMG_CLASS);

                if (null !== $target_image) {
                    $target_image.parents('.ft-container').remove();

                    if (0 === $img_container) {
                        $target_image = null;
                    }
                    else {
                        $target_image = $img_container[0];
                    }
                }
            },
            refreshImage = function($img) {
                var height = $img.height(),
                    width = $img.width(),
                    img = new Image(),
                    canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    opts = {
                        is_rgba: true,
                        threshold: parseInt($threshold.val(), 10)
                    },
                    imageData;

                img.onload = function() {
                    if (0 < width || 0 < height) {
                        ctx.drawImage(
                            img,
                            0,
                            0,
                            width,
                            height
                        );

                        imageData = ctx.createImageData(width, height);
                        imageData.data.set(convertToTypedArray(grayScale(ctx.getImageData(0, 0, width, height).data, opts), Uint8ClampedArray));

                        ctx.putImageData(imageData, 0, 0);

                        $img.attr('src', canvas.toDataURL('image/png'));
                    }
                };

                canvas.width = width;
                canvas.height = height;

                img.src = $img.data('base');
            },
            readfiles = function(files) {

                var onComplete = function(index, total) {
                        return function(e, fileEntry) {
                            var $div = $(document.createElement('div')).addClass(LASER_IMG_CLASS).data('index', $('.' + LASER_IMG_CLASS).length),
                                img = new Image(),
                                url = fileEntry.toURL(),
                                $img = $(img).data('base', url),
                                instantRefresh = function(e, data) {
                                    refreshObjectParams($div);
                                };

                            $img.addClass(fileEntry.fileExtension);

                            $img.one('load', function() {
                                $laser_platform.append($div);

                                if ($img.width() > $laser_platform.width()) {
                                    $img.width(349);
                                }

                                if ($img.height() > $laser_platform.height()) {
                                    $img.height(349);
                                }

                                $div.freetrans({
                                    x: $laser_platform.width() / 2 - $img.width() / 2,
                                    y: $laser_platform.height() / 2 - $img.height() / 2,
                                    onRotate: instantRefresh,
                                    onMove: instantRefresh,
                                    onScale: instantRefresh
                                });

                                $div.parent().find('.ft-controls').on('mousedown', function(e) {
                                    var $self = $(e.target);

                                    $('.image-active').removeClass('image-active');
                                    $target_image = $self.parent().find('.' + LASER_IMG_CLASS);
                                    $target_image.find('img').addClass('image-active');
                                });

                                refreshImage($img);

                                img.onload = null;
                            });

                            $div.append($img);

                            $img.attr('src', url);

                            // set default image
                            $target_image = $div;

                            if (index === total) {
                                reactComponent.setState({
                                    step: 'start'
                                });
                                // location.hash = 'studio/laser/start';
                            }
                        };
                    };

                for (var i = 0; i < files.length; i++) {
                    fileSystem.writeFile(
                        files.item(i),
                        {
                            onComplete: onComplete(i + 1, files.length)
                        }
                    );

                }
            },
            getAngle = function(el) {
                // refs: https://css-tricks.com/get-value-of-css-rotation-through-javascript/
                var st = window.getComputedStyle(el, null),
                    matrix = st.getPropertyValue("-webkit-transform"),
                    values = matrix.split('(')[1].split(')')[0].split(','),
                    a, b, c, d, scale, sin;

                a = values[0];
                b = values[1];
                c = values[2];
                d = values[3];

                scale = Math.sqrt(a * a + b * b);
                sin = b / scale;

                return Math.round(Math.atan2(b, a) * (180 / Math.PI));
            },
            sendingToLaser = function(args) {

                var laserParser = bitmapLaserParser(),
                    onSetupFinished = function() {
                        laserParser.uploadBitmap(args, {
                            onFinished: onUploadFinish
                        });
                    },
                    onUploadFinish = function() {
                        laserParser.getGCode({
                            onFinished: onGetGCodeFinished
                        });
                    },
                    onGetGCodeFinished = function(blob) {
                        var control_methods = control(printer.serial);
                        control_methods.upload(blob.size, blob);
                    };

                laserParser.setup(0, [1, 'wood'], {
                    onFinished: onSetupFinished
                });

            },
            refreshObjectParams = function($el) {
                var bounds, pos;

                if (null !== $el) {
                    bounds = $el.freetrans('getBounds');
                    pos = $el.position();

                    $angle.val(getAngle($el[0]));
                    $pos_x.val(pos.left);
                    $pos_y.val(pos.top);
                    $size_h.val(bounds.height);
                    $size_w.val(bounds.width);
                }
            },
            $target_image = null, // changing when image clicked
            printer = null,
            printer_selecting = false;

        $('#btn-start').on('click', function(e) {

            var $ft_controls = $laser_platform.find('.ft-controls'),
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
                doLaser = function() {
                    $ft_controls.each(function(k, el) {
                        var $el = $(el),
                            image = new Image(),
                            width = $el.width(),
                            height = $el.height(),
                            top_left = getCenter($el.find('.ft-scaler-top.ft-scaler-left')),
                            bottom_right = getCenter($el.find('.ft-scaler-bottom.ft-scaler-right')),
                            sub_data = {
                                width: width,
                                height: height,
                                tl_position_x: convertToRealCoordinate(top_left.x, 'x'),
                                tl_position_y: convertToRealCoordinate(top_left.y, 'y'),
                                br_position_x: convertToRealCoordinate(bottom_right.x, 'x'),
                                br_position_y: convertToRealCoordinate(bottom_right.y, 'y'),
                                rotate: (Math.PI * getAngle(el) / 180) * -1,
                                threshold: $threshold.val()
                            },
                            canvas = document.createElement('canvas'),
                            ctx = canvas.getContext('2d'),
                            image_blobs = [];

                        canvas.width = width;
                        canvas.height = height;
                        image.src = $el.parent().find('.ft-widget img').data('base');

                        image.onload = function() {
                            ctx.drawImage(
                                image,
                                0,
                                0,
                                width,
                                height
                            );
                            sub_data.image_data = grayScale(ctx.getImageData(0, 0, width, height).data);

                            args.push(sub_data);

                            if (args.length === $ft_controls.length) {
                                // sending data
                                sendingToLaser(args);
                            }
                        };
                    });
                };

            require(['jsx!views/Print-Selector'], function(view) {
                var popup_window;
                printer_selecting = true;

                popup_window = popup(
                    view,
                    {
                        getPrinter: function(auth_printer) {
                            printer = auth_printer;
                            popup_window.close();
                            doLaser();
                        }
                    }
                );
                popup_window.open({
                    onClose: function() {
                        printer_selecting = false;
                    }
                });
            });


        });

        $('.instant-change').on('focus', function(e) {
            var $self = $(e.currentTarget),
                args = {};

            $self.one('blur', function(e) {
                $self.off('change keyup');
            });

            $self.on('change keyup', function(e) {
                args[$self.data('type')] = parseInt($self.val(), 10);
                $target_image.freetrans(args);
            });
        });

        $uploader_file_control.on('change', function(e) {
            readfiles(this.files);
        });

        $uploader.on('dragover dragend', function() {
            return false;
        });

        $uploader.on('drop', function(e) {
            e.preventDefault();
            readfiles(e.originalEvent.dataTransfer.files);
        });

        $threshold.on('keyup', function(e) {
            $('.' + LASER_IMG_CLASS).find('img').each(function(k, el) {
                refreshImage($(el));
            });
        });

        $(document).on('keydown', function(e) {
            if (DELECT_KEY_CODE === e.keyCode && false === printer_selecting) {
                deleteImage();
            }
        });
    };
});