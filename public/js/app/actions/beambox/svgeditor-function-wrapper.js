define([

], function(

){
    'use strict';
    let _update_attr_changer = function(name, val) {
            $('#'+name).val(val);
            $('#'+name).change();
        };
    let _setCrosshairCursor = function() {
        $('#workarea').css('cursor', 'crosshair');
    };

    return {
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
            _update_attr_changer('image_width', val);
        },
        update_image_height: function(val) {
            _update_attr_changer('image_height', val);
        },
        update_rect_width: function(val) {
            _update_attr_changer('rect_width', val);
        },
        update_rect_height: function(val) {
            _update_attr_changer('rect_height', val);
        },
        update_angle: function(val) {
            _update_attr_changer('angle', val);
        },
        update_selected_x: function(val) {
            _update_attr_changer('selected_x', val);
        },
        update_selected_y: function(val) {
            _update_attr_changer('selected_y', val);
        },
        update_ellipse_cx: function(val) {
            _update_attr_changer('ellipse_cx', val);
        },
        update_ellipse_cy: function(val) {
            _update_attr_changer('ellipse_cy', val);
        },
        update_ellipse_rx: function(val) {
            _update_attr_changer('ellipse_rx', val);
        },
        update_ellipse_ry: function(val) {
            _update_attr_changer('ellipse_ry', val);
        },
        update_line_x1: function(val) {
            _update_attr_changer('line_x1', val);
        },
        update_line_y1: function(val) {
            _update_attr_changer('line_y1', val);
        },
        update_line_x2: function(val) {
            _update_attr_changer('line_x2', val);
        },
        update_line_y2: function(val) {
            _update_attr_changer('line_y2', val);
        },

        write_image_data_shading: function(elem, val) {
            elem.attr('data-shading', val);
        },
        write_image_data_threshold: function(elem, val) {
            elem.attr('data-threshold', val);
        },

        getThumbnailDataurl: function() {
            const svgCanvas = window.svgCanvas;

            const str = svgCanvas.getSvgString();
            if (!$('#export_canvas').length) {
                $('<canvas>', {id: 'export_canvas'}).appendTo('body');
            }
            const c = $('#export_canvas')[0];
            c.width = svgCanvas.contentW;
            c.height = svgCanvas.contentH;

            canvg(c, str); //canvg.js

            var dataurl = c.toDataURL();

            return dataurl;
        }


    };
});
