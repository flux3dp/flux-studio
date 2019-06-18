/*globals svgEditor, svgCanvas, svgedit, $*/
/*jslint vars: true, eqeq: true, todo: true */
/*
 * ext-polygon.js
 *
 *
 * Copyright(c) 2010 CloudCanvas, Inc.
 * All rights reserved
 *
 */
svgEditor.addExtension('polygon', function (S) {
    'use strict';
    var selectedElement,
        editingitex = false,
        started,
        newPoly,
        polygonSides = 5;

    window.polygonAddSides = () => {
        polygonSides++;
        polygonExt.renderPolygon();
    };

    window.polygonDecreaseSides = () => {
        polygonSides--;
        if (polygonSides < 3) {
            polygonSides = 3;
        }
        polygonExt.renderPolygon();
    };

    function showPanel(on) {
        var fc_rules = $('#fc_rules');
        if (!fc_rules.length) {
            fc_rules = $('<style id="fc_rules"></style>').appendTo('head');
        }
        fc_rules.text(!on ? '' : ' #tool_topath { display: none !important; }');
        $('#polygon_panel').toggle(on);
    }

    function setAttr(attr, val) {
        svgCanvas.changeSelectedAttribute(attr, val);
        S.call('changed', selectedElement);
    }

    function cot(n) {
        return 1 / Math.tan(n);
    }

    function sec(n) {
        return 1 / Math.cos(n);
    }

    let polygonExt = {
        name: 'polygon',
        svgicons: svgEditor.curConfig.extPath + 'polygon-icons.svg',
        buttons: [{
            id: 'tool_polygon',
            type: 'mode',
            title: 'Polygon Tool',
            position: 11,
            parent: 'tool_polygon',
            events: {
                'mouseup': function () {
                    console.log('Click polygon');
                    svgCanvas.setMode('polygon');
                    showPanel(true);
                }
            }
        }],

        context_tools: [{
            type: 'input',
            panel: 'polygon_panel',
            title: 'Number of Sides',
            id: 'polySides',
            label: 'sides',
            size: 3,
            defval: 5,
            events: {
                change: function () {
                    setAttr('sides', this.value);
                }
            }
        }],

        callback: function () {

            $('#polygon_panel').hide();

            var endChanges = function () {};

            // TODO: Needs to be done after orig icon loads
            setTimeout(function () {
                // Create source save/cancel buttons
                var save = $('#tool_source_save').clone().hide().attr('id', 'polygon_save').unbind().appendTo('#tool_source_back').click(function () {

                    if (!editingitex) {
                        return;
                    }
                    // Todo: Uncomment the setItexString() function above and handle ajaxEndpoint?
                    if (!setItexString($('#svg_source_textarea').val())) {
                        $.confirm('Errors found. Revert to original?', function (ok) {
                            if (!ok) {
                                return false;
                            }
                            endChanges();
                        });
                    } else {
                        endChanges();
                    }
                    // setSelectMode();
                });

                var cancel = $('#tool_source_cancel').clone().hide().attr('id', 'polygon_cancel').unbind().appendTo('#tool_source_back').click(function () {
                    endChanges();
                });

            }, 3000);
        },
        mouseDown: function (opts) {
            // var e = opts.event;
            var sRgb = svgCanvas.getColor('stroke');
            // ccSRgbEl = sRgb.substring(1, rgb.length);
            var sWidth = svgCanvas.getStrokeWidth();

            if (svgCanvas.getMode() == 'polygon') {
                started = true;
                newPoly = S.addSvgElementFromJson({
                    'element': 'polygon',
                    'attr': {
                        'cx': opts.start_x,
                        'cy': opts.start_y,
                        'id': S.getNextId(),
                        'shape': 'regularPoly',
                        'sides': polygonSides,
                        'orient': 'x',
                        'edge': 0,
                        'fill': 'none',
                        'stroke': 'black',
                        'strokeWidth': 1
                    }
                });

                return {
                    started: true
                };
            }
        },
        renderPolygon: function() {
            let c = $(newPoly).attr(['cx', 'cy', 'edge', 'angle_offset']);
            let edg = Number(c.edge),
                cx = c.cx,
                cy = c.cy,
                angle_offset = Number(c.angle_offset),
                sides = polygonSides;
            let inradius = (edg / 2) * cot(Math.PI / sides);
            let circumradius = inradius * sec(Math.PI / sides);
            let points = [];
            for (let s = 0; sides >= s; s++) {
                var angle = 2.0 * Math.PI * s / sides + angle_offset;
                x = (circumradius * Math.cos(angle)) + cx;
                y = (circumradius * Math.sin(angle)) + cy;

                points.push(x + ',' + y);
            }
            newPoly.setAttributeNS(null, 'points', points.join(' '));
        },
        mouseMove: function (opts) {
            if (!started) {
                return;
            }
            if (svgCanvas.getMode() === 'polygon') {
                let zoom = svgCanvas.getZoom(),
                    x = opts.mouse_x / zoom,
                    y = opts.mouse_y / zoom;
                let c = $(newPoly).attr(['cx', 'cy']);
                let cx = c.cx,
                    cy = c.cy,
                    edg = (Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))) / 1.5,
                    sides = polygonSides,
                    angle_offset = Math.atan2(y - cy, x - cx);
                newPoly.setAttributeNS(null, 'edge', edg);
                newPoly.setAttributeNS(null, 'angle_offset', angle_offset);
                polygonExt.renderPolygon();
                return {
                    started: true
                };
            }

        },

        mouseUp: function (opts) {
            if (svgCanvas.getMode() == 'polygon') {
                var attrs = $(newPoly).attr('edge');
                var keep = (attrs.edge != 0);
                svgCanvas.setMode('select');
                // svgCanvas.addToSelection([newPoly], true);
                return {
                    keep: keep,
                    element: newPoly
                };
            }

        },
        selectedChanged: function (opts) {
            // Use this to update the current selected elements
            selectedElement = opts.elems;

            var i = selectedElement.length;

            while (i--) {
                var elem = selectedElement[i];
                if (elem && elem.getAttributeNS(null, 'shape') === 'regularPoly') {
                    if (opts.selectedElement && !opts.multiselected) {
                        $('#polySides').val(elem.getAttribute('sides'));

                        showPanel(true);
                    } else {
                        showPanel(false);
                    }
                } else {
                    showPanel(false);
                }
            }
        },
        elementChanged: function (opts) {
            // var elem = opts.elems[0];
        }
    };

    return polygonExt;
});
