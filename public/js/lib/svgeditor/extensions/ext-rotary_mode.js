/*globals svgEditor, svgedit, svgCanvas, $*/
/*jslint vars: true*/
/*
 * ext-rotary_axis.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Redou Mine
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension('rotary_axis', function () {

    var NS = svgedit.NS,
        svgdoc = document.getElementById('svgcanvas').ownerDocument,
        assignAttributes = svgCanvas.assignAttributes,
        canvBG = $('#canvasBackground'),
        currentYRatio = svgCanvas.getRotaryDisplayCoord();

    var rotaryAxis = svgdoc.createElementNS(NS.SVG, 'svg');
    assignAttributes(rotaryAxis, {
        'id': 'rotaryAxis',
        'width': '100%',
        'height': '100%',
        'x': 0,
        'y': 0,
        'style': 'cursor:ns-resize',
        'overflow': 'visible',
        'display': 'inline'
    });
    canvBG.append(rotaryAxis);

    // grid-box
    var rotaryLine = svgdoc.createElementNS(NS.SVG, 'line');
    assignAttributes(rotaryLine, {
        'id': 'rotaryLine',
        'x1': '0',
        'y1': currentYRatio + '%',
        'x2': '100%',
        'y2': currentYRatio + '%',
        'stroke-width': 5,
        'stroke': 'rgb(0,128,255)',
        'fill': 'none',
        'style': 'cursor:ns-resize',
        'display': svgCanvas.getRotaryMode() ? 'visible' : 'none'
    });
    $('#rotaryAxis').append(rotaryLine);

    function updateLine() {
        assignAttributes(rotaryLine, {
            'y1': currentYRatio + '%',
            'y2': currentYRatio + '%',
            'display': svgCanvas.getRotaryMode() ? 'visible' : 'none'
        });
    }

    return {
        name: 'rotary_axis',
        svgicons: svgEditor.curConfig.extPath + 'grid-icon.xml',

        mouseMove: function (evt) {
            if (svgCanvas.getMode() === 'adjust-rotary-axis') {
                let mouse_y = evt.mouse_y;
                currentYRatio = mouse_y * 100 / $('#svgcontent').attr('height');
                if (currentYRatio > 100 ) currentYRatio = 100;
                if (currentYRatio < 0 ) currentYRatio = 0;
                updateLine();
            }
        },
        checkMouseTarget: function (evt) {
            // includes == indexOf. This comment can be removed 5 years layer...
            if (['rotaryAxis', 'rotaryLine'].includes(evt.mouseTarget.getAttribute('id'))) {
                console.log('setMode to dragging axis');
                svgCanvas.clearSelection();
                svgCanvas.setMode('adjust-rotary-axis');
                return {
                    started: true
                };
            }
        },
        mouseUp: function () {
            if (svgCanvas.getMode() === 'adjust-rotary-axis') {
                svgCanvas.setMode('select');
                svgCanvas.setRotaryDisplayCoord(currentYRatio);
                return {
                    keep: false,
                    element: null
                };
            }
        },
        getRotaryAxisAbsoluteCoord: function() {
            return $('#svgroot').attr('y') * currentYRatio / 100.0;
        },
        updateRotaryAxis: function() {
            updateLine();
        },
        callback: function () {
            updateLine();
        },
        buttons: []
    };
});
