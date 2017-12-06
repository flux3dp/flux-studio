define([
    'jquery',
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
    'app/actions/beambox/constant'
], function($, React, FnWrapper, UnitInput, i18n, Constant) {
    'use strict';

    const LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired,
            type: React.PropTypes.oneOf('rect', 'image', 'use').isRequired
        },

        getInitialState: function() {
            return {
                x: this.props.x,
                y: this.props.y
            };
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                x: nextProps.x,
                y: nextProps.y
            });
        },

        _update_x_handler: function(x) {
            if(this.props.type === 'use') {
                svgCanvas.setSvgElemPosition('x', x * Constant.dpmm);
            } else {
                FnWrapper.update_selected_x(x);
            }
            this.setState({x: x});
        },
        _update_y_handler: function(y) {
            if(this.props.type === 'use') {
                svgCanvas.setSvgElemPosition('y', y * Constant.dpmm);
            } else {
                FnWrapper.update_selected_y(y);
            }
            this.setState({y: y});            
        },
        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                    <input type="checkbox" className="accordion-switcher" defaultChecked={true}/>
                    <p className="caption">
                        {LANG.position}
                        <span className="value">{this.state.x}, {this.state.y} mm</span>
                    </p>
                    <label className="accordion-body">
                        <div className="control">
                            <span className="text-center header">X</span>
                            <UnitInput
                                unit="mm"
                                defaultValue={this.state.x}
                                getValue={this._update_x_handler}
                            />
                        </div>
                        <div className="control">
                            <span className="text-center header">Y</span>
                            <UnitInput
                                unit="mm"
                                defaultValue={this.state.y}
                                getValue={this._update_y_handler}
                            />
                        </div>
                    </label>
                </label>
            </div>
            );
        }
        
    });

});