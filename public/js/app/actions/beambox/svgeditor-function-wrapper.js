define([
    'app/actions/beambox/constant',
    'helpers/image-data',
    'lib/cropper'
], function(
    Constant,
    ImageData,
    Cropper
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

    let _flipImage = function(horizon=1, vertical=1) {
        const image = window.svgCanvas.getSelectedElems()[0];
        const flipCanvas = document.createElement('canvas');
        const flipContext = flipCanvas.getContext('2d');
        flipCanvas.width = $(image).attr('width');
        flipCanvas.height = $(image).attr('height');
        flipContext.translate(horizon < 0 ? flipCanvas.width : 0, vertical < 0 ? flipCanvas.height : 0);
        flipContext.scale(horizon, vertical);
        flipContext.drawImage(image, 0, 0, flipCanvas.width, flipCanvas.height);
        $(image).attr('xlink:href', flipCanvas.toDataURL());
    };

    const funcs =  {
        clearSelection: function() {
            svgCanvas.clearSelection();
        },
        isAnyElementSelected: function() {
            if (!window.svgCanvas) {
                return false;
            }
            const selectedElements = window.svgCanvas.getSelectedElems();

            return ((selectedElements.length > 0) && (selectedElements[0] !== null));
        },
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

        insertSvg: function(svgString, cropData, preCrop) {
            const newElement = svgCanvas.importSvgString(svgString, 'image-trace');
            const {
                x,
                y,
                width,
                height
            } = cropData;
            const {
                offsetX,
                offsetY,
            } = preCrop;

            svgCanvas.ungroupSelectedElement();
            svgCanvas.ungroupSelectedElement();
            svgCanvas.groupSelectedElements();
            svgCanvas.alignSelectedElements('m', 'page');
            svgCanvas.alignSelectedElements('c', 'page');
            // highlight imported element, otherwise we get strange empty selectbox
            try {
                svgCanvas.selectOnly([newElement]);
                svgCanvas.setSvgElemPosition('x', offsetX + x);
                svgCanvas.setSvgElemPosition('y', offsetY + y);
                svgCanvas.zoomSvgElem(72/254);
            } catch(e) {
                console.warn('Reading empty SVG');
            }
            // svgCanvas.ungroupSelectedElement(); //for flatten symbols (convertToGroup)
            $('#svg_editor').addClass('color');
            $('#dialog_box').hide();
        },
        insertImage: function(insertedImageSrc, cropData, preCrop, threshold) {

            // let's insert the new image until we know its dimensions
            const insertNewImage = function (img, cropData, preCrop, threshold) {
                const {
                    x,
                    y,
                    width,
                    height
                } = cropData;
                const {
                    offsetX,
                    offsetY,
                } = preCrop;
                const newImage = svgCanvas.addSvgElementFromJson({
                    element: 'image',
                    attr: {
                        x: offsetX + x,
                        y: offsetY + y,
                        width: width,
                        height: height,
                        id: svgCanvas.getNextId(),
                        style: 'pointer-events:inherit',
                        preserveAspectRatio: 'none',
                        'data-threshold': parseInt(threshold),
                        'data-shading': false,
                        origImage: img.src
                    }
                });

                ImageData(
                    newImage.getAttribute('origImage'), {
                        height,
                        width,
                        grayscale: {
                            is_rgba: true,
                            is_shading: false,
                            threshold: parseInt(threshold),
                            is_svg: false
                        },
                        onComplete: function (result) {
                            svgCanvas.setHref(newImage, result.canvas.toDataURL());
                        }
                    }
                );

                svgCanvas.selectOnly([newImage]);

                window.updateContextPanel();
                $('#dialog_box').hide();
            };

            // create dummy img so we know the default dimensions
            const img = new Image();

            img.src = insertedImageSrc;
            img.style.opacity = 0;
            img.onload = function () {
                if (!svgCanvas.setCurrentLayer('Traced Image')) {
                    svgCanvas.createLayer('Traced Image');
                }
                insertNewImage(img, cropData, preCrop, threshold);
            };
        },

        //align toolbox
        alignLeft: function() {
            svgCanvas.alignSelectedElements('l', 'page');
        },
        alignCenter: function(){
            svgCanvas.alignSelectedElements('c', 'page');
        },
        alignRight: function() {
            svgCanvas.alignSelectedElements('r', 'page');
        },
        alignTop: function() {
            svgCanvas.alignSelectedElements('t', 'page');
        },
        alignMiddle: function() {
            svgCanvas.alignSelectedElements('m', 'page');
        },
        alignBottom: function() {
            svgCanvas.alignSelectedElements('b', 'page');
        },
        // distribute toolbox
        distHori: function() {
            svgCanvas.distHori();
        },
        distVert: function() {
            svgCanvas.distHori();
        },
        distEven: function() {
            svgCanvas.distEven();
        },
        flipHorizontal: function() {
            _flipImage(-1, 1);
        },
        flipVertical: function() {
            _flipImage(1, -1);
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
        saveFile: function() {
            const output = svgCanvas.getSvgString();
            const defaultFileName = svgCanvas.getLatestImportFileName() || 'untitled';
            saveAs(new Blob([output], {type: 'text/plain'}), defaultFileName + '.bvg');
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
