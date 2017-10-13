define([
    'jquery',
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
], function($, React, FnWrapper, UnitInput, i18n) {
    'use strict';

    const LANG = i18n.lang.beambox.object_panels;
    
    return React.createClass({
        propTypes: {
            rx: React.PropTypes.number.isRequired,
            ry: React.PropTypes.number.isRequired
        },

        getInitialState: function() {
            return {
                rx: this.props.rx,
                ry: this.props.ry,
                isRatioPreserve: true
            };
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                rx: nextProps.rx,
                ry: nextProps.ry
            });
        },

        _update_rx_handler: function(val) {
            if(this.state.isRatioPreserve) {
                const ry = val * (this.state.ry/this.state.rx);
                FnWrapper.update_ellipse_ry(ry);
                this.setState({ry: ry}); 
            }
            FnWrapper.update_ellipse_rx(val);
            this.setState({rx: val});
        },
        _update_ry_handler: function(val) {
            if(this.state.isRatioPreserve) {
                const rx = val * (this.state.rx/this.state.ry);
                FnWrapper.update_ellipse_rx(rx);
                this.setState({rx: rx}); 
            }
            FnWrapper.update_ellipse_ry(val);
            this.setState({ry: val});            
        },
        _ratio_handler: function(e) {
            this.setState({
                isRatioPreserve: e.target.checked
            });
        },
        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {LANG.ellipse_radius}
                            <span className="value">{this.state.rx} , {this.state.ry} mm</span>
                        </p>
                        <label className="accordion-body  with-lock">
                            <div>
                                <div className="control">
                                    <span className="text-center header">Rx</span>
                                    <UnitInput
                                        min={0}
                                        max={4000}
                                        unit="mm"
                                        defaultValue={this.state.rx}
                                        getValue={this._update_rx_handler}
                                    />
                                </div>
                                <div className="control">
                                    <span className="text-center header">Ry</span>
                                    <UnitInput
                                        min={0}
                                        max={4000}
                                        unit="mm"
                                        defaultValue={this.state.ry}
                                        getValue={this._update_ry_handler}
                                    />
                                </div>
                            </div>
                            <div className='lock'>
                                <input type="checkbox" checked={this.state.isRatioPreserve} id="togglePreserveRatio" onChange={this._ratio_handler} hidden/>
                                <label htmlFor="togglePreserveRatio"><div>┐</div><i className={this.state.isRatioPreserve?"fa fa-lock":"fa fa-unlock-alt"}></i><div>┘</div></label>
                            </div>
                        </label>
                    </label>
                </div>
                );
        }
        
    });

});