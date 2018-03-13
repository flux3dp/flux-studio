define([
    'react',
    'reactPropTypes',
    'plugins/classnames/index',
    'jsx!views/beambox/Object-Panels/Position',
    'jsx!views/beambox/Object-Panels/Rotation',
    'jsx!views/beambox/Object-Panels/Size',
    'jsx!views/beambox/Object-Panels/EllipsePosition',
    'jsx!views/beambox/Object-Panels/EllipseRadius',
    'jsx!views/beambox/Object-Panels/RectRoundedCorner',
    'jsx!views/beambox/Object-Panels/Line',
    'jsx!views/beambox/Object-Panels/ShadingThreshold'
], function(
    React,
    PropTypes,
    ClassNames,
    PositionPanel,
    RotationPanel,
    SizePanel,
    EllipsePositionPanel,
    EllipseRadiusPanel,
    RectRoundedCorner,
    LinePanel,
    ShadingThresholdPanel
) {

    const validPanelsMap = {
        'unknown':  [],
        'rect':     ['position', 'size', 'rotation', 'rectRoundedCorner'],
        'ellipse':  ['ellipsePosition', 'ellipseRadius', 'rotation'],
        'line':     ['line', 'rotation'],
        'image':    ['position', 'size', 'rotation', 'shadingThreshold'],
        'text':     ['rotation'],
        'use':      ['position', 'size', 'rotation']
    };

    let ObjectPanel = React.createClass({
        propTypes: {
            type: PropTypes.oneOf(Object.keys(validPanelsMap)).isRequired,
            data: PropTypes.object.isRequired,
            $me: PropTypes.object.isRequired,
            isEditable: PropTypes.bool.isRequired
        },


        _renderPanels: function() {
            const data = this.props.data;
            const type = this.props.type;
            const $me = this.props.$me;

            const validPanels = validPanelsMap[this.props.type] || validPanelsMap['unknown'];
            let panelsToBeRender = [];
            validPanels.forEach(function(panelName) {
                let panel;
                switch (panelName) {
                    case 'position':            panel = <PositionPanel key={panelName} x={data.position.x} y={data.position.y} type={type}/>; break;
                    case 'rotation':            panel = <RotationPanel key={panelName} angle={data.rotation.angle}/>; break;
                    case 'size':                panel = <SizePanel key={panelName} width={data.size.width} height={data.size.height} type={type}/>; break;
                    case 'ellipsePosition':     panel = <EllipsePositionPanel key={panelName} cx={data.ellipsePosition.cx} cy={data.ellipsePosition.cy}/>; break;
                    case 'ellipseRadius':       panel = <EllipseRadiusPanel key={panelName} rx={data.ellipseRadius.rx} ry={data.ellipseRadius.ry}/>; break;
                    case 'rectRoundedCorner':   panel = <RectRoundedCorner key={panelName} rx={data.rectRoundedCorner.rx}/>; break;
                    case 'line':                panel = <LinePanel key={panelName} x1={data.line.x1} y1={data.line.y1} x2={data.line.x2} y2={data.line.y2}/>; break;
                    case 'shadingThreshold':    panel = <ShadingThresholdPanel key={panelName} shading={data.image.shading} threshold={data.image.threshold} $me={$me}/>; break;

                }
                panelsToBeRender.push(panel);
            });
            return panelsToBeRender;
        },

        _findPositionStyle: function() {
            const angle = (function(){
                const A = $('#selectorGrip_resize_w').offset();
                const B = $('#selectorGrip_resize_e').offset();
                const dX = B.left - A.left;
                const dY = B.top - A.top;
                const radius = Math.atan2(-dY, dX);
                let degree = radius * (180 / Math.PI);
                if (degree < 0) degree += 360;
                return degree;
            })();

            const thePoint = (function () {
                const E = $('#selectorGrip_resize_e').offset();
                const S = $('#selectorGrip_resize_s').offset();
                const W = $('#selectorGrip_resize_w').offset();
                const N = $('#selectorGrip_resize_n').offset();
                function isAngleIn(a, b) {
                    return (a <= angle) && (angle < b);
                }
                if (isAngleIn(45+3,135+3)) return S;
                if (isAngleIn(135+3,225+3)) return W;
                if (isAngleIn(225+3,315+3))return N;
                return E;
            })();

            thePoint.top -= 40;
            thePoint.left += 35;

            // constrain position not exceed window
            const constrainedPosition = (function(){
                function _between(input, min, max) {
                    input = Math.min(input, max);
                    input = Math.max(input, min);
                    return input;
                }
                const left = _between(thePoint.left, 0, $(window).width()-240);
                const top = _between(thePoint.top, 100, $(window).height()-80);
                return {
                    left: left,
                    top: top
                };
            })();

            const positionStyle = {
                position: 'absolute',
                top: constrainedPosition.top,
                left: constrainedPosition.left
            };
            return positionStyle;
        },

        render: function() {
            const positionStyle = this._findPositionStyle();
            const classes = ClassNames('object-panels', {'unselectable': !(this.props.isEditable)});
            return (
                <div className={classes} style={positionStyle}>
                    {this._renderPanels()}
                </div>
            );
        }

    });

    return ObjectPanel;
});
