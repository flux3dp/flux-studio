define(
    function () {
        'use strict';

        var DXF_COLORS = {0: 'black', 1: 'red', 3: 'green', 5: 'blue' };

        if (!String.prototype.format1) {
            String.prototype.format1 = function () {
                function toFixed(x) {
                    var e;
                    if (Math.abs(x) < 1.0) {
                        e = parseInt(x.toString().split('e-')[1])
                        if (e) {
                            x *= Math.pow(10, e - 1)
                            var pos = x.toString().indexOf('.') + 1,
                                pre = x.toString().substr(0, pos)

                            x = pre + (new Array(e + 1)).join('0') + x.toString().substring(pos)
                        }
                    } else {
                        e = parseInt(x.toString().split('+')[1])
                        if (e > 20) {
                            e -= 20
                            x /= Math.pow(10, e)
                            x += (new Array(e + 1)).join('0')
                        }
                    }
                    return x
                }
                var args = arguments
                return this.replace(/{(\d+)}/g, function (match, number) {
                    if (args[number] != 'undefined') {
                        var arg = args[number],
                            isArgANumber = !isNaN(parseFloat(arg)) && isFinite(arg)
                        return isArgANumber ? toFixed(arg) : arg;
                    } else {
                        return match
                    }
                });
            }
        }
        return function dxfToSvg(dxfString, opts) {
            "use strict";
            opts = opts || {};
            var offsetY = 0;
            var _maxY = 0;

            if (!opts.getMaxY) {
                offsetY = dxfToSvg(dxfString, { getMaxY: true });
            }

            function maxY(y) {
                if (y > _maxY) _maxY = y;
            }
            
            function dxfObjectToSvgSnippet(dxfObject) {
                function getLineSvg(x1, y1, x2, y2, color) {
                    if (color) {
                        return '<path style="stroke: {4}" d="M{0},{1} {2},{3}"/>\n'.format1(x1, y1, x2, y2, DXF_COLORS[color]);
                    } else {
                        return '<path d="M{0},{1} {2},{3}"/>\n'.format1(x1, y1, x2, y2);
                    }
                }

                function deg2rad(deg) {
                    return deg * (Math.PI / 180);
                }

                switch (dxfObject.type) {
                    case 'LINE':
                        maxY(dxfObject.y);
                        maxY(dxfObject.y1);
                        return getLineSvg(dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1, dxfObject.color);
                    case 'CIRCLE':
                        maxY(dxfObject.y);
                        maxY(dxfObject.y + dxfObject.r);
                        return '<circle cx="{0}" cy="{1}" r="{2}"/>\n'.format1(dxfObject.x, dxfObject.y, dxfObject.r);
                    case 'ARC':
                        var x1 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a0));
                        var y1 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a0));
                        var x2 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a1));
                        var y2 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a1));

                        if (dxfObject.a1 < dxfObject.a0) {
                            dxfObject.a1 += 360;
                        }
                        var largeArcFlag = dxfObject.a1 - dxfObject.a0 > 180 ? 1 : 0;
                        maxY(dxfObject.y1);
                        maxY(dxfObject.y2);
                        return '<path d="M{0},{1} A{2},{3} 0 {4},1 {5},{6}"/>\n'.
                        format1(x1, y1, dxfObject.r, dxfObject.r, largeArcFlag, x2, y2);
                    case 'LWPOLYLINE':
                        var svgSnippet = '';
                        var vertices = dxfObject.vertices;
                        for (var i = 0; i < vertices.length - 1; i++) {
                            var vertice1 = vertices[i];
                            var vertice2 = vertices[i + 1];
                            svgSnippet += getLineSvg(vertice1.x, vertice1.y, vertice2.x, vertice2.y);
                            maxY(vertices1.y);
                            maxY(vertices2.y);
                        }
                        return svgSnippet;
                }
            }

            function getSvgViewbox(svg) {
                var strokeWidth = 1;
                // The SVG has to be added to the DOM to be able to retrieve its bounding box.
                var svgId = "svg" + Math.round(Math.random() * Math.pow(10, 17));
                $(svg.format1('id="' + svgId + '"')).appendTo('body');
    
                var boundingBox = $('#' + svgId)[0].getBBox();
                var viewBoxValue = '{0} {1} {2} {3}'.format1(boundingBox.x - strokeWidth / 2, boundingBox.y - strokeWidth / 2,
                    boundingBox.width + strokeWidth, boundingBox.height + strokeWidth);
                $('#' + svgId).remove();
                return svg.format1('viewBox="' + viewBoxValue + '"');
            }

            var pixelToMillimeterConversionRatio = 3.543299873306695 * 0.8;

            var groupCodes = {
                0: 'entityType',
                2: 'blockName',
                8: 'layerName',
                10: 'x',
                11: 'x1',
                20: 'y',
                21: 'y1',
                40: 'r',
                50: 'a0',
                51: 'a1',
                62: 'color'
            };

            var supportedEntities = [
                'LINE',
                'CIRCLE',
                'ARC',
                'LWPOLYLINE'
            ];

            var counter = 0;
            var code = null;
            var isEntitiesSectionActive = false;
            var object = {};
            var svg = '';

            // Normalize platform-specific newlines.
            dxfString = dxfString.replace(/\r\n/g, '\n');
            dxfString = dxfString.replace(/\r/g, '\n');

            var layers = {'DXF': ''};

            dxfString.split('\n').forEach(function (line) {
                line = line.trim()
                if (counter++ % 2 === 0) {
                    code = parseInt(line);
                } else {
                    var value = line;
                    var groupCode = groupCodes[code];
                    if (groupCode === 'blockName' && value === 'ENTITIES') {
                        isEntitiesSectionActive = true;
                    } else if (isEntitiesSectionActive) {
                        if (groupCode === 'entityType') { // New entity starts.
                            var layer = object.layerName || 'DXF';
                            layers[layer] = layers[layer] || "";

                            if (object.type) {
                                layers[layer] += dxfObjectToSvgSnippet(object);
                            }

                            object = $.inArray(value, supportedEntities) > -1 ? {
                                type: value
                            } : {};

                            if (value === 'ENDSEC') {
                                isEntitiesSectionActive = false;
                            }
                        } else if (object.type && typeof groupCode !== 'undefined') { // Known entity property recognized.
                            if (groupCode == 'layerName') { object[groupCode] = value; }
                            else if (groupCode == 'color') { object[groupCode] = parseInt(value);}
                            else { object[groupCode] = parseFloat(value) * pixelToMillimeterConversionRatio; }

                            if (groupCode.indexOf('y') ==0 && !opts.getMaxY) { object[groupCode] = -object[groupCode] + offsetY + 15; }

                            if (object.type == 'LWPOLYLINE' && groupCode === 'y') {
                                if (!object.vertices) {
                                    object.vertices = [];
                                }
                                object.vertices.push({
                                    x: object.x,
                                    y: object.y
                                });
                            }
                        }
                    }
                }
            });

            if (opts.getMaxY) {
                return _maxY;
            } 

            if (opts.divideLayer) {
                Object.keys(layers).map(function(key) {
                    if (layers[key] == "") return;
                    layers[key] = getSvgViewbox('<svg {0} version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="layer-' + key + '" style="stroke:black; stroke-width: 1; stroke-linecap:round; stroke-linejoin:round; fill:none">\n' + layers[key] +'</g></svg>');
                });
                return layers;
            } else {
                return getSvgViewbox('<svg {0} version="1.1" xmlns="http://www.w3.org/2000/svg">' + Object.keys(layers).map(function(key) {
                    let v = layers[key];
                    return '<g id="layer-' + key + '" style="stroke:black; stroke-width: 1; stroke-linecap:round; stroke-linejoin:round; fill:none">\n' + v +'</g>';
                }).join('\n') + '</svg>');
            }   
        }
    }
);
