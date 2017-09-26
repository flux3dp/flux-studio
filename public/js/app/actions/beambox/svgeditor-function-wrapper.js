define([
    'app/actions/beambox/constant'
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
            const cw = c.width = svgCanvas.contentW;
            const ch = c.height = svgCanvas.contentH;
            
            function drawBoard(){
                const context = c.getContext("2d");
                const gridW = 50;
                const gridH = 50;

                context.globalCompositeOperation='destination-over';

                for (var x = 0; x <= cw; x += gridW) {
                    context.moveTo(x, 0);
                    context.lineTo(x, ch);
                }
            
                for (var x = 0; x <= ch; x += gridH) {
                    context.moveTo(0, x);
                    context.lineTo(cw, x);
                }
            
                context.strokeStyle = "#E0E0DF";
                context.lineWidth = 1;
                context.stroke();
            }

            const d = $.Deferred();

            canvg(c, str, {renderCallback: function(){
                drawBoard();
                d.resolve(c.toDataURL());
                
            }});
            return d.promise();
        }
    };

    return funcs;
});
