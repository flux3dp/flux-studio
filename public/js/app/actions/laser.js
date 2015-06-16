define([
    'jquery',
    'helpers/file-system',
    'helpers/websocket',
    'freetrans'
], function($, fileSystem, WebSocket) {
    'use strict';

    return function(args) {

        var DIAMETER = 170,    // 170mm
            CHUNK_PKG_SIZE = 4096,
            $uploader = $('.file-importer'),
            $uploader_file_control = $uploader.find('[type="file"]'),
            $laser_platform = $('.laser-object'),
            PLATFORM_DIAMETER_PIXEL = $laser_platform.height(),
            $angle = $('[name="object-angle"]'),
            $pos_x = $('[name="object-pos-x"]'),
            $pos_y = $('[name="object-pos-y"]'),
            $size_w = $('[name="object-size-w"]'),
            $size_h = $('[name="object-size-h"]'),
            readfiles = function(files) {
                var onComplete = function(e, fileEntry) {
                        var $div = $(document.createElement('div')).addClass('img-container').data('index', $('.img-container').length),
                            $img = $(document.createElement('img')).attr('src', fileEntry.toURL()),
                            instantRefresh = function(e, data) {
                                refreshObjectParams($div);
                            };

                        $img.one('load', function() {
                            $div.freetrans({
                                x: $laser_platform.width() / 2,
                                y: $laser_platform.height() / 2,
                                onRotate: instantRefresh,
                                onMove: instantRefresh,
                                onScale: instantRefresh
                            });
                        });

                        $div.append($img);

                        $laser_platform.append($div);

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
                            var data = JSON.parse(result.data);

                            switch (data.status) {
                            case 'continue':
                                go_next = true;
                                break;
                            case 'accept':
                                go_next = true;
                                accept_times++;

                                if (args.length === accept_times) {
                                    ws.send('go').onMessage(function(result) {
                                        console.log('fantastic work', result);
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
                                obj.rotate
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
            $target_image = null; // changing when image clicked

        $('#btn-start').on('click', function(e) {
            var $ft_controls = $laser_platform.find('.ft-controls'),
                convertToGrayScale = function(data) {
                    var binary = [];

                    for (var i = 0; i < data.length; i += 4) {
                        // refers to http://en.wikipedia.org/wiki/Grayscale
                        var grayscale = parseInt(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114, 10);

                        binary.push(grayscale);
                    }

                    return binary;
                },
                convertIntoUint8Array = function(arr) {
                    var dataView = new Uint8Array(arr.length);

                    arr.forEach(function(value, i) {
                        dataView[i] = value;
                    });

                    return dataView;
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
                args = [];

            $ft_controls.each(function(k, el) {
                var $el = $(el),
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
                            x: convertToRealCoordinate(bottom_right.x + width, 'x'),
                            y: convertToRealCoordinate(bottom_right.y + height, 'y')
                        },
                        rotate: (Math.PI * getAngle(el) / 180) * -1,
                        data: []
                    },

                    canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    image_blobs = [];

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(
                    $el.parent().find('.ft-widget img')[0],
                    0,
                    0,
                    width,
                    height
                );
                image_blobs = convertToGrayScale(ctx.getImageData(0, 0, width, height).data);

                for (var i = 0; i < image_blobs.length; i += CHUNK_PKG_SIZE) {
                    sub_data.data.push(convertIntoUint8Array(image_blobs.slice(i, i + CHUNK_PKG_SIZE)));
                }

                args.push(sub_data);
            });

            // sending data
            sendingToLaser(args);
        });

        $laser_platform.on('mousedown', function(e) {
            var $self = $(e.target);

            if (true === $self.hasClass('ft-controls')) {
                $('.image-active').removeClass('image-active');
                $target_image = $self.parent().find('.img-container');
                $target_image.find('img').addClass('image-active');

                refreshObjectParams($target_image);
            }
        });

        $angle.on('focus', function(e) {
            var $self = $(e.currentTarget);

            $self.one('blur', function(e) {
                $self.off('change keyup');
            });

            $self.on('change keyup', function(e) {
                $target_image.freetrans({
                    angle: $self.val()
                });
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
    };
});