define([
    'app/actions/beambox/constant',
], function(
    Constant
){
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
            $('#workarea').css('cursor', 'text');
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
        update_rect_rx: function(val) {
            _update_attr_changer('rect_rx', _mm2pixel(val));
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
        update_font_family: function(val) {
            _update_attr_changer('font_family', val);
        },
        update_font_size: function(val) {
            _update_attr_changer('font_size', val);
        },
        update_font_italic: function(val) {
            svgCanvas.setItalic(val);
            window.updateContextPanel();
        },
        update_font_weight: function(val) {
            svgCanvas.setFontWeight(val);
            window.updateContextPanel();
        },
        update_letter_spacing: function(val) {
            svgCanvas.setLetterSpacing(val);
            window.updateContextPanel();
        },
        update_font_is_fill: function(val) {
            svgCanvas.setFontIsFill(val);
            window.updateContextPanel();
        },
        write_image_data_shading: function(elem, val) {
            elem.attr('data-shading', val);
        },
        write_image_data_threshold: function(elem, val) {
            elem.attr('data-threshold', val);
        },

        // others
        reset_select_mode: function() {
            // simulate user click on empty area of canvas.
            svgCanvas.textActions.clear();
            svgCanvas.setMode('select');
            $(svgroot).trigger({
                type: 'mousedown',
                pageX: 0,
                pageY: 0
            });
            $(svgroot).trigger({
                type: 'mouseup',
                pageX: 0,
                pageY: 0
            });
        }
    };

    return funcs;
});
