// render by svg-editor. not Beambox
define([
    'jquery',
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/i18n',
    'jsx!views/beambox/Object-Panels/Position',
    'jsx!views/beambox/Object-Panels/Rotation',
    'jsx!views/beambox/Object-Panels/Size',
    'jsx!views/beambox/Object-Panels/EllipsePosition',
    'jsx!views/beambox/Object-Panels/EllipseRadius',
    'jsx!views/beambox/Object-Panels/Line',
    'jsx!views/beambox/Object-Panels/Threshold',
], function($, 
    React, 
    FnWrapper, 
    i18n, 
    PositionPanel, 
    RotationPanel, 
    SizePanel, 
    EllipsePositionPanel, 
    EllipseRadiusPanel,
    LinePanel,
    ThresholdPanel 
) {
    'use strict';

    const lang = i18n.lang;
    const validPanels = {
        'unknown':  [],
        'rect':     ['position', ,'rotation', 'size'],
        'ellipse':  ['ellipsePosition', 'ellipseRadius'],
        'line':     ['line', 'rotation'],
        'image':    ['position', 'rotation', 'size', 'threshold'],
        'text':     ['rotation'],
        'g':        ['position', 'rotation']
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
            const reactPanels = {
                position: <PositionPanel x={data.position.x} y={data.position.y}/>,
                rotation: <RotationPanel angle={data.rotation.angle} />,
                size: <SizePanel width={data.size.width} height={data.size.height} type={type}/>,
                ellipsePosition: <EllipsePositionPanel cx={data.ellipsePosition.cx} cy={data.ellipsePosition.cy}/>,
                ellipseRadius: <EllipseRadiusPanel rx={data.ellipseRadius.rx} ry={data.ellipseRadius.ry}/>,
                line: <LinePanel x1={data.line.x1} y1={data.line.y1} x2={data.line.x2} y2={data.line.y2}/>,
                threshold: <ThresholdPanel shading={data.image.shading} threshold={data.image.threshold} $me={$me}/>
            };

            const validPanels = this._getValidPanels(this.props.type);
            let panelsToBeRender = [];
            validPanels.forEach(function(panelName) {
                panelsToBeRender.push(reactPanels[panelName]);
            });
            return panelsToBeRender;
        },
        render: function() {
            const positionStyle = {
                position: 'absolute',
                top: $('#selectorGrip_resize_se').offset().top,
                left: $('#selectorGrip_resize_se').offset().left
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