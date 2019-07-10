define([
    'jquery',
    'react',
    'reactPropTypes',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
    'app/actions/beambox/constant'
], function($, React, PropTypes, UnitInput, i18n, Constant) {
    'use strict';

    const LANG = i18n.lang.beambox.tool_panels;


    return React.createClass({
        propTypes: {
            dx: PropTypes.number.isRequired,
            dy: PropTypes.number.isRequired,
            onValueChange: PropTypes.func,
        },

        getInitialState: function() {
            return {
                dx: this.props.dx,
                dy: this.props.dy,
                onValueChange: this.props.onValueChange,
            };
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                dx: nextProps.dx,
                dy: nextProps.dy,
                onValueChange: nextProps.onValueChange,
            });
        },

        _update_dx_handler: function(val) {
            this.setState({dx: val});
            let distance = this.state;
            distance.dx = val;
            this.props.onValueChange(distance);
        },

        _update_dy_handler: function(val) {
            this.setState({dy: val});
            let distance = this.state;
            distance.dy = val;
            this.props.onValueChange(distance);       
        },

        getValueCaption: function() {
            const dx = this.state.dx, 
                dy = this.state.dy,
                units = localStorage.getItem('default-units', 'mm') ;
            if (units === 'inches') {
                return `${Number(dx/25.4).toFixed(3)}\", ${Number(dy/25.4).toFixed(3)}\"`;
            } else {
                return `${dx}, ${dy} mm`;
            }
        },
        render: function() {
            return (
                <div className="tool-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
                        <p className="caption">
                            {LANG.array_interval}
                            <span className="value">{this.getValueCaption()}</span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="text-center header">{LANG.dx}</span>
                                <UnitInput
                                    min={0}
                                    max={Constant.dimension.width/Constant.dpmm}
                                    unit="mm"
                                    defaultValue={this.state.dx}
                                    getValue={this._update_dx_handler}
                                />
                            </div>
                            <div className="control">
                                <span className="text-center header">{LANG.dy}</span>
                                <UnitInput
                                    min={0}
                                    max={Constant.dimension.height/Constant.dpmm}
                                    unit="mm"
                                    defaultValue={this.state.dy}
                                    getValue={this._update_dy_handler}
                                />
                            </div>
                        </label>
                    </label>
                </div>
            );
        }
    });
});
