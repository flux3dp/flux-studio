define([
    'jquery',
    'helpers/file-system',
    'helpers/websocket',
    'helpers/grayscale',
    'helpers/convertToTypedArray',
    'helpers/api/discover',
    'helpers/api/touch',
    'helpers/api/control',
    'freetrans'
], function($, fileSystem, WebSocket, grayScale, convertToTypedArray, discover, touch, control) {
    'use strict';

    return function(args) {

        var DIAMETER = 170,    // 170mm
            CHUNK_PKG_SIZE = 4096,
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

                $target_image.parents('.ft-container').remove();

                if (0 === $img_container) {
                    $target_image = null;
                }
                else {
                    $target_image = $img_container[0];
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
                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );

                    imageData = new ImageData(
                        convertToTypedArray(grayScale(ctx.getImageData(0, 0, width, height).data, opts), Uint8ClampedArray),
                        width,
                        height
                    );

                    ctx.putImageData(imageData, 0, 0);

                    ctx.fillStyle = '#fff';
                    // refers to: https://developer.mozilla.org/zh-TW/docs/Web/Guide/HTML/Canvas_tutorial/Compositing
                    // background is always white
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillRect(0, 0, width, height);

                    $img.attr('src', canvas.toDataURL('image/jpeg'));
                };

                canvas.width = width;
                canvas.height = height;

                img.src = $img.data('base');
            },
            readfiles = function(files) {
                var onComplete = function(e, fileEntry) {
                        var $div = $(document.createElement('div')).addClass(LASER_IMG_CLASS).data('index', $('.' + LASER_IMG_CLASS).length),
                            img = new Image(),
                            url = fileEntry.toURL(),
                            $img = $(img).data('base', url),
                            instantRefresh = function(e, data) {
                                refreshObjectParams($div);
                            };

                        $img.addClass(url.substr(-3));

                        $img.one('load', function() {
                            $laser_platform.append($div);

                            $div.freetrans({
                                x: $laser_platform.width() / 2,
                                y: $laser_platform.height() / 2,
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

                        img.src = url;

                        $div.append($img);

                        // set default image
                        $target_image = $div;

                        $('#file-importer').hide();
                        $('#operation-table').show();
                    };

                for (var i = 0; i < files.length; i++) {
                    fileSystem.writeFile(
                        files.item(i),
                        {
                            onComplete: onComplete
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
                var isReady = function() {
                        var request_serial = [],
                            accept_times = 0,
                            index = 0,
                            go_next = false,
                            timer, next_data, request_header;

                        ws.onMessage(function(result) {
                            var data = JSON.parse(result.data),
                                blobs = [],
                                total_length = 0;

                            switch (data.status) {
                            case 'continue':
                                go_next = true;
                                break;
                            case 'accept':
                                go_next = true;
                                accept_times++;

                                if (args.length === accept_times) {
                                    ws.send('go').onMessage(function(result) {
                                        var data = ('string' === typeof result.data ? JSON.parse(result.data) : result.data),
                                            blob_length = 0,
                                            gcode_blob,
                                            control_methods,
                                            opts;

                                        if ('processing' === data.status) {
                                            // TODO: update progress
                                        }
                                        else if ('complete' === data.status) {
                                            total_length = data.length;
                                        }
                                        else if ('object' === typeof data) {
                                            blobs.push(data);
                                            gcode_blob = new Blob(blobs);

                                            if (total_length === gcode_blob.size) {
                                                control_methods = control(printer.serial, opts);
                                                control_methods.upload(gcode_blob.size, gcode_blob);
                                            }
                                        }
                                    });
                                }

                                break;
                            }
                        });

                        args.forEach(function(obj) {
                            request_header = [
                                obj.width,
                                obj.height,
                                obj.top_left.x,
                                obj.top_left.y,
                                obj.bottom_right.x,
                                obj.bottom_right.y,
                                obj.rotate,
                                $threshold.val()
                            ];

                            request_serial.push(request_header.join(','));
                            request_serial = request_serial.concat(obj.data);
                        });

                        timer = setInterval(function() {
                            if (0 === index || true === go_next) {
                                next_data = request_serial[index];

                                if ('string' === typeof next_data) {
                                    go_next = false;
                                }

                                ws.send(next_data);
                                index++;
                            }

                            if (index >= request_serial.length) {
                                clearInterval(timer);
                            }
                        }, 0);
                    },
                    ws = new WebSocket({
                        method: 'bitmap-laser-parser',
                        onMessage: function(result) {
                            var data = JSON.parse(result.data);

                            if ('ok' === data.status) {
                                isReady();
                            }
                        }
                    }).send('0,1,wood');

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
            printer = null;


        // TODO: should have ui to select print at the very beginning
        discover(function(printers) {
            var opts = {
                onSuccess: function(data) {
                    printer = printers[0];
                },
                onError: function(data) {
                    // TODO: do something
                }
            };

            touch(opts).send(printers[0].serial, 'flux');
        });

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
                args = [];

            $ft_controls.each(function(k, el) {
                var $el = $(el),
                    image = new Image(),
                    width = $el.width(),
                    height = $el.height(),
                    top_left = getCenter($el.find('.ft-scaler-top.ft-scaler-left')),
                    bottom_right = getCenter($el.find('.ft-scaler-bottom.ft-scaler-right')),
                    pos = $el.position(),
                    sub_data = {
                        width: width,
                        height: height,
                        top_left: {
                            x: convertToRealCoordinate(top_left.x, 'x'),
                            y: convertToRealCoordinate(top_left.y, 'y')
                        },
                        bottom_right: {
                            x: convertToRealCoordinate(bottom_right.x, 'x'),
                            y: convertToRealCoordinate(bottom_right.y, 'y')
                        },
                        rotate: (Math.PI * getAngle(el) / 180) * -1,
                        data: []
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
                    image_blobs = grayScale(ctx.getImageData(0, 0, width, height).data);

                    for (var i = 0; i < image_blobs.length; i += CHUNK_PKG_SIZE) {
                        sub_data.data.push(convertToTypedArray(image_blobs.slice(i, i + CHUNK_PKG_SIZE), Uint8Array));
                    }

                    args.push(sub_data);
                };
            });

            // sending data
            sendingToLaser(args);
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
            if (DELECT_KEY_CODE === e.keyCode) {
                deleteImage();
            }
        });
    };
});