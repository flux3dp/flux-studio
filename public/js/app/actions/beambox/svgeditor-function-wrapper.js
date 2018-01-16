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

        fetchThumbnail: async function() {
            function cloneAndModifySvg($svg) {
                const $clonedSvg = $svg.clone(false);

                $clonedSvg.find('text').remove();
                $clonedSvg.find('#selectorParentGroup').remove();
                $clonedSvg.find('#canvasBackground image#background_image').remove();
                $clonedSvg.find('#canvasBackground #previewBoundary').remove();
                $clonedSvg.find('#svgcontent *').css({
                    "fill": '#ffffff',
                    "fill-opacity": "0",
                    "stroke": "#000",
                    "stroke-width": "3px",
                    "stroke-opacity": "1.0",
                    "stroke-dasharray": "0"
                });
                return $clonedSvg;
            }

            async function DOM2Image($svg){
                return await new Promise((resolve, reject)=>{
                    const img  = new Image();
                    img.onload = () => resolve(img);

                    const $modifiedSvg = cloneAndModifySvg($svg);
                    const svgString = new XMLSerializer().serializeToString($modifiedSvg.get(0));
                    img.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgString);
                });
            }

            function cropAndDrawOnCanvas(img) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                //cropping
                const ratio = img.width / $('#svgroot').width();
                const W = ratio * $('#svgroot').width();
                const H = ratio * $('#svgroot').height();
                const w = ratio * $('#canvasBackground').attr('width');
                const h = ratio * $('#canvasBackground').attr('height');
                const x = - (W - w) / 2;
                const y = - (H - h) / 2;

                canvas.width = w;
                canvas.height = h;

                ctx.drawImage(img, x, y, img.width, img.height);
                return canvas;
            }

            const $svg = cloneAndModifySvg($('#svgroot'));
            const img = await DOM2Image($svg);
            const canvas = cropAndDrawOnCanvas(img);

            return await new Promise((resolve, reject)=>{
                canvas.toBlob(function (blob) {
                    resolve([canvas.toDataURL(), URL.createObjectURL(blob)]);
                });
            });
        }
    };

    return funcs;
});
