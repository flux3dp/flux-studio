define([
    'helpers/api/config',
    'app/actions/beambox/default-preference',
    'app/actions/beambox/constant',
    'jsx!app/actions/beambox/Object-Panels-Controller',
    'jsx!app/actions/beambox/Laser-Panel-Controller'
], function (
    ConfigHelper,
    DefaultPreference,
    Constant,
    ObjectPanelsController,
    LaserPanelController
) {
    const Config = ConfigHelper();

    const init = () => {
        //init config
        const customPreference = Config.read('beambox-preference');
        const updatedPreference = $.extend({}, DefaultPreference, customPreference);
        Config.write('beambox-preference', updatedPreference);

        ObjectPanelsController.init('object-panels-placeholder');
        LaserPanelController.init('layer-laser-panel-placeholder');
    };

    const displayGuides = () => {
        const guidesLines = (() => {
            const svgdoc = document.getElementById('svgcanvas').ownerDocument;
            const NS = svgedit.NS;
            const linesGroup = svgdoc.createElementNS(NS.SVG, 'svg');
            const lineVertical = svgdoc.createElementNS(NS.SVG, 'line');
            const lineHorizontal = svgdoc.createElementNS(NS.SVG, 'line');

            svgedit.utilities.assignAttributes(linesGroup, {
                'id': 'guidesLines',
                'width': '100%',
                'height': '100%',
                'x': 0,
                'y': 0,
                'viewBox': `0 0 ${Constant.dimension.width} ${Constant.dimension.height}`,
                'style': 'pointer-events: none'
            });

            svgedit.utilities.assignAttributes(lineHorizontal, {
                'id': 'horizontal_guide',
                'x1': 0,
                'x2': Constant.dimension.width,
                'y1': Config.read('beambox-preference')['guide_y0'] * 10,
                'y2': Config.read('beambox-preference')['guide_y0'] * 10,
                'stroke': '#000',
                'stroke-width': '2',
                'stroke-opacity': 0.8,
                'stroke-dasharray': '5, 5',
                'vector-effect': 'non-scaling-stroke',
                fill: 'none',
                style: 'pointer-events:none'
            });

            svgedit.utilities.assignAttributes(lineVertical, {
                'id': 'vertical_guide',
                'x1': Config.read('beambox-preference')['guide_x0'] * 10,
                'x2': Config.read('beambox-preference')['guide_x0'] * 10,
                'y1': 0,
                'y2': Constant.dimension.height,
                'stroke': '#000',
                'stroke-width': '2',
                'stroke-opacity': 0.8,
                'stroke-dasharray': '5, 5',
                'vector-effect': 'non-scaling-stroke',
                fill: 'none',
                style: 'pointer-events:none'
            });

            linesGroup.appendChild(lineHorizontal);
            linesGroup.appendChild(lineVertical);
            return linesGroup;
        })();

        $('#canvasBackground').get(0).appendChild(guidesLines);
    };

    return {
        init: init,
        displayGuides: displayGuides
    };
});
