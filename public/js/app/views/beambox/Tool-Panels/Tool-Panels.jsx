define([
    'react',
    'reactPropTypes',
    'plugins/classnames/index',
    'app/actions/beambox/constant',
    'helpers/i18n',
    'jsx!views/beambox/Tool-Panels/RowColumn',
    'jsx!views/beambox/Tool-Panels/Interval',
], function(
    React,
    PropTypes,
    ClassNames,
    Constant,
    i18n,
    RowColumnPanel,
    IntervalPanel
) {
    const LANG = i18n.lang.beambox.tool_panels;

    let _mm2pixel = function(pixel_input) {
        const dpmm = Constant.dpmm;
        return Number(pixel_input*dpmm);
    };

    const validPanelsMap = {
        'unknown':  [],
        'gridArray': ['rowColumn', 'distance', 'button']
    };

    class ToolPanel extends React.Component {

        constructor(props) {
            super(props);
            this._setArrayRowColumn = this._setArrayRowColumn.bind(this);
            this._setDistance = this._setDistance.bind(this);
        }

        _setArrayRowColumn(rowcolumn) {
            this.props.data.rowcolumn = rowcolumn;
            let rc = rowcolumn;
            this.setState({rowcolumn: rc});
        };

        _setDistance(distance) {
            this.props.data.distance = distance;
            let d = distance;
            this.setState({distance: d});
        };

        _renderPanels() {
            const data = this.props.data;
            const validPanels = validPanelsMap[this.props.type] || validPanelsMap['unknown'];
            let panelsToBeRender = [];

            for (let i = 0; i < validPanels.length; ++i){
                const panelName = validPanels[i];
                let panel;
                switch (panelName) {
                    case 'rowColumn':
                        panel = <RowColumnPanel
                            key={panelName} {...data.rowcolumn}
                            onValueChange={this._setArrayRowColumn}
                            />;
                        break;
                    case 'distance':
                        panel = <IntervalPanel
                            key={panelName} {...data.distance}
                            onValueChange={this._setDistance}
                            />;
                        break;
                    //case 'button':          panel = <div; break;
                }
                panelsToBeRender.push(panel);
            };
            return panelsToBeRender;
        }

        _renderTitle() {
            const type = this.props.type;
            const titleMap = {
                'gridArray': LANG.grid_array,
            }
            const title = titleMap[type];
            return(
                <div className="tool-panel">
                    <label className="controls accordion">
                    <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
                        <p className="caption">
                            <span className="value">{title}</span>
                        </p>
                    </label>
                </div>
            )
        }

        _renderButtons() {
            let _onCancel = () => {
                this.props.unmount();
                svgCanvas.setMode('select');
                $('.tool-btn').removeClass('active');
                $('#left-Cursor').addClass('active');
            };
            let _onYes = () => {this.props.unmount()};
            const type = this.props.type;

            if (type === 'gridArray') {
                _onYes = () => {
                    let data = this.props.data;
                    let distance = {};
                    distance.dx = _mm2pixel(data.distance.dx);
                    distance.dy = _mm2pixel(data.distance.dy);
                    svgCanvas.gridArraySelectedElement(distance, data.rowcolumn);
                    this.props.unmount();
                    svgCanvas.setMode('select');
                    $('.tool-btn').removeClass('active');
                    $('#left-Cursor').addClass('active');
                }
            }
            return (
                <div className="tool-block">
                        <div className="btn-h-group">
                            <button className="btn btn-default" onClick={_onCancel}>{LANG.cancel}</button>
                            <button className="btn btn-default" onClick={_onYes.bind(this)}>{LANG.confirm}</button>
                        </div>
                </div>
            );
        }

        _findPositionStyle() {
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
                const top = _between(thePoint.top, 100, $('#svg_editor').height()-$('#beamboxObjPanel').height());
                return {
                    left: left,
                    top: top
                };
            })();

            const positionStyle = {
                position: 'absolute',
                zIndex: 10,
                bottom: 10,
                left: $('.left-toolbar').width(),
            };
            return positionStyle;
        }

        render() {
            const positionStyle = this._findPositionStyle();
            const classes = ClassNames('tool-panels');
            return (
                <div id="beamboxToolPanel" className={classes} style={positionStyle}>
                    {this._renderTitle()}
                    {this._renderPanels()}
                    {this._renderButtons()}
                </div>
            );
        }

    };

    ToolPanel.propTypes = {
        type: PropTypes.oneOf(Object.keys(validPanelsMap)).isRequired,
        data: PropTypes.object.isRequired,
    };

    return ToolPanel;
});

