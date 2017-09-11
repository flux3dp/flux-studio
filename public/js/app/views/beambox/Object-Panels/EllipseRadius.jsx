define([
    'jquery',
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
], function($, React, FnWrapper, UnitInput, i18n) {
    'use strict';

    const lang = i18n.lang;

    return React.createClass({
        propTypes: {
            rx: React.PropTypes.number.isRequired,
            ry: React.PropTypes.number.isRequired
        },

        getInitialState: function() {
            return {
                rx: this.props.rx,
                ry: this.props.ry
            };
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                rx: nextProps.rx,
                ry: nextProps.ry
            });
        },

        _update_rx_handler: function(val) {
            FnWrapper.update_ellipse_rx(val);
            this.setState({rx: val});
        },
        _update_ry_handler: function(val) {
            FnWrapper.update_ellipse_ry(val);
            this.setState({ry: val});            
        },
        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                    <input type="checkbox" className="accordion-switcher"/>
                    <p className="caption">
                        長短軸
                        <span className="value">{this.state.rx} , {this.state.ry}mm</span>
                    </p>
                    <label className="accordion-body">
                        <div className="control">
                            <span className="text-center header">rx</span>
                            <UnitInput
                                min={0}
                                max={4000}
                                unit="mm"
                                defaultValue={this.state.rx}
                                getValue={this._update_rx_handler}
                            />
                        </div>
                        <div className="control">
                            <span className="text-center header">ry</span>
                            <UnitInput
                                min={0}
                                max={4000}
                                unit="mm"
                                defaultValue={this.state.ry}
                                getValue={this._update_ry_handler}
                            />
                        </div>
                    </label>
                </label>
            </div>
            );
        }
        
    });

});