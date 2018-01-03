define([
    'app/actions/beambox/constant',
], function(
    Constant
){
    'use strict';

    let _mm2pixel = function(mm_input) {
        const dpmm = Constant.dpmm;
        return mm_input*dpmm;
    };

    let _update_attr_changer = function(name, val) {
            $('#'+name).val(val);
            $('#'+name).change();
        };

    let _setCrosshairCursor = function() {
        $('#workarea').css('cursor', 'crosshair');
    };

    const funcs =  {
        cloneSelectedElement: function() {
            window.svgCanvas.cloneSelectedElements(20, 20);
        },
        undo: function() {
            window.svgeditorClickUndo();
        },

        //main panel
        importImage: function() {
            $('#tool_import input').click();
        },

        //left panel
        useSelectTool: function() {
            $('#tool_select').click();
        },
        insertRectangle: function() {
            $('#tool_rect').mouseup();
            _setCrosshairCursor();
        },
        insertEllipse: function() {
            $('#tool_ellipse').mouseup();
            _setCrosshairCursor();
        },
        insertLine: function() {
            $('#tool_line').mouseup();
            _setCrosshairCursor();
        },
        insertText: function() {
            $('#tool_text').click();
        },

        //top panel
        update_image_width: function(val) {
            _update_attr_changer('image_width', _mm2pixel(val));
        },
        update_image_height: function(val) {
            _update_attr_changer('image_height', _mm2pixel(val));
        },
        update_rect_width: function(val) {
            _update_attr_changer('rect_width', _mm2pixel(val));
        },
        update_rect_height: function(val) {
            _update_attr_changer('rect_height', _mm2pixel(val));
        },
        update_angle: function(val) {
            _update_attr_changer('angle', val);
        },
        update_selected_x: function(val) {
            _update_attr_changer('selected_x', _mm2pixel(val));
        },
        update_selected_y: function(val) {
            _update_attr_changer('selected_y', _mm2pixel(val));
        },
        update_ellipse_cx: function(val) {
            _update_attr_changer('ellipse_cx', _mm2pixel(val));
        },
        update_ellipse_cy: function(val) {
            _update_attr_changer('ellipse_cy', _mm2pixel(val));
        },
        update_ellipse_rx: function(val) {
            _update_attr_changer('ellipse_rx', _mm2pixel(val));
        },
        update_ellipse_ry: function(val) {
            _update_attr_changer('ellipse_ry', _mm2pixel(val));
        },
        update_line_x1: function(val) {
            _update_attr_changer('line_x1', _mm2pixel(val));
        },
        update_line_y1: function(val) {
            _update_attr_changer('line_y1', _mm2pixel(val));
        },
        update_line_x2: function(val) {
            _update_attr_changer('line_x2', _mm2pixel(val));
        },
        update_line_y2: function(val) {
            _update_attr_changer('line_y2', _mm2pixel(val));
        },

        write_image_data_shading: function(elem, val) {
            elem.attr('data-shading', val);
        },
        write_image_data_threshold: function(elem, val) {
            elem.attr('data-threshold', val);
        },

        fetchThumbnailDataurl: function() {
            const svgCanvas = window.svgCanvas;

            const str = svgCanvas.getSvgString();
            if (!$('#export_canvas').length) {
                $('<canvas>', {id: 'export_canvas'}).appendTo('body');
            }
            const c = $('#export_canvas')[0];

            function drawBoard(canvas){
                const context = canvas.getContext("2d");
                const gridW = 20;
                const gridH = 20;

                // context.globalCompositeOperation='destination-over';

                for (var x = 0; x <= canvas.width; x += gridW) {
                    context.moveTo(x, 0);
                    context.lineTo(x, canvas.height);
                }

                for (var x = 0; x <= canvas.height; x += gridH) {
                    context.moveTo(0, x);
                    context.lineTo(canvas.width, x);
                }

                //context.strokeStyle = "#E0E0DF";
                context.strokeStyle = "#AAA";
                context.lineWidth = 1;
                context.stroke();
            }

            function grayscale (input) {
                var inputContext = input.getContext("2d");
                var imageData = inputContext.getImageData(0, 0, input.width, input.height);
                var data = imageData.data;
             
                var arraylength = input.width * input.height * 4;
             
                for (var i=arraylength-1; i>0;i-=4)
                {
                    //R= i-3, G = i-2 and B = i-1
                    var gray = 0.299 * data[i-3] + 0.587 * data[i-2] + 0.114 * data[i-1];
                    data[i-3] = gray;
                    data[i-2] = gray;
                    data[i-1] = gray;
             
                }

                var output = document.createElement('canvas');
                output.width = 800;
                output.height = 800;
                var outputContext = output.getContext("2d");
             
                outputContext.putImageData(imageData, 0, 0);
                return output;
            }

            const d = $.Deferred();

            const strWithoutFilter = str.replace('filter="url(#greyscaleFilter)"', '');
            // This is a bit hack.
            // canvg cannot read this filter because it is defined outside of str.
            // so we remove it, and grayscale it again when it transfers into canvas.
            
            canvg(c, strWithoutFilter, {
                scaleWidth: 800,
                scaleHeight: 800,
                renderCallback: function () {
                    let grayscaleCanvas = grayscale(c);
                    drawBoard(grayscaleCanvas);
                    grayscaleCanvas.toBlob(function (blob) {
                        d.resolve(grayscaleCanvas.toDataURL(), URL.createObjectURL(blob));
                });
                //window.open().document.write('<img src="'+ grayscaleCanvas.toDataURL() + '"/>');

            }});
            return d.promise();
        }
    };

    return funcs;
});
