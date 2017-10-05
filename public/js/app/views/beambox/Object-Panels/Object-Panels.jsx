// render by svg-editor. not Beambox
define([
    'react',
    'jsx!views/beambox/Object-Panels/Position',
    'jsx!views/beambox/Object-Panels/Rotation',
    'jsx!views/beambox/Object-Panels/Size',
    'jsx!views/beambox/Object-Panels/EllipsePosition',
    'jsx!views/beambox/Object-Panels/EllipseRadius',
    'jsx!views/beambox/Object-Panels/Line',
    'jsx!views/beambox/Object-Panels/Threshold',
], function(
    React,
    PositionPanel, 
    RotationPanel, 
    SizePanel, 
    EllipsePositionPanel, 
    EllipseRadiusPanel,
    LinePanel,
    ThresholdPanel 
) {
    'use strict';

    const validPanels = {
        'unknown':  [],
        'rect':     ['position', ,'rotation', 'size'],
        'ellipse':  ['ellipsePosition', 'ellipseRadius'],
        'line':     ['line', 'rotation'],
        'image':    ['position', 'rotation', 'size', 'threshold'],
        'text':     ['rotation'],
        'g':        ['rotation'],
        'use':      ['position', 'rotation', 'size']
    };

    let ObjectPanel = React.createClass({
        propTypes: {
            type: React.PropTypes.oneOf(Object.keys(validPanels)).isRequired,
            data: React.PropTypes.object.isRequired,
            $me: React.PropTypes.object.isRequired
        },
                  
        _getValidPanels: function(type) {
            return validPanels[type]||validPanels['unknown'];
        },
        _renderPanels: function() {
            const data = this.props.data;
            const type = this.props.type;
            const $me = this.props.$me;

            const validPanels = this._getValidPanels(this.props.type);
            let panelsToBeRender = [];
            validPanels.forEach(function(panelName) {
                let panel;
                switch (panelName) {
                    case 'position':        panel = <PositionPanel key={panelName} x={data.position.x} y={data.position.y}/>;       break;
                    case 'rotation':        panel = <RotationPanel key={panelName} angle={data.rotation.angle} />;                  break;
                    case 'size':            panel = <SizePanel key={panelName} width={data.size.width} height={data.size.height} type={type}/>;         break;
                    case 'ellipsePosition': panel = <EllipsePositionPanel key={panelName} cx={data.ellipsePosition.cx} cy={data.ellipsePosition.cy}/>;  break;
                    case 'ellipseRadius':   panel = <EllipseRadiusPanel key={panelName} rx={data.ellipseRadius.rx} ry={data.ellipseRadius.ry}/>;        break;
                    case 'line':            panel = <LinePanel key={panelName} x1={data.line.x1} y1={data.line.y1} x2={data.line.x2} y2={data.line.y2}/>;       break;
                    case 'threshold':       panel = <ThresholdPanel key={panelName} shading={data.image.shading} threshold={data.image.threshold} $me={$me}/>;  break;
                }
                panelsToBeRender.push(panel);
            });
            return panelsToBeRender;
        },
        render: function() {
            function _between(input, min, max) {
                input = Math.min(input, max);
                input = Math.max(input, min);
                return input;
            }

            let left = $('#selectorGrip_resize_e').offset().left;
            left = _between(left, 0, $(window).width()-240);
            let top = $('#selectorGrip_resize_e').offset().top;
            top = _between(top, 100, $(window).height()-80);
            
            const positionStyle = {
                position: 'absolute',
                top: top,
                left: left
            };

            return (
                <div className='object-panels' style={positionStyle}>
                    {this._renderPanels()}
                </div>
            );
        }
        
    });

    return ObjectPanel;
});