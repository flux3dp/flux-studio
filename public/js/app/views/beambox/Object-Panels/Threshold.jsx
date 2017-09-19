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
            shading: React.PropTypes.bool.isRequired,
            threshold: React.PropTypes.number.isRequired,
            $me: React.PropTypes.object.isRequired
        },
        
        getInitialState: function() {
            return {
                shading: this.props.shading,
                threshold: this.props.threshold
            };
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({
                shading: nextProps.shading,
                threshold: nextProps.threshold
            });
        },

        _writeShading: function(val) {
            FnWrapper.write_image_data_shading(this.props.$me, val);
        },
        _writeThreshold: function(val) {
            FnWrapper.write_image_data_threshold(this.props.$me, val);
        },

        _handleShadingChange: function(event) {
            const val = event.target.checked;
            this.setState({shading: val}, function(){
                this._writeShading(val);
            });
        },
        _handleThresholdChange: function(event) {
            const val = event.target.value;
            this.setState({threshold: val}, function(){
                this._writeThreshold(val);
            });        
        },
        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                    <input type="checkbox" className="accordion-switcher"/>
                    <p className="caption">
                        {LANG.laser_config}
                        <span className="value">{LANG.shading} {this.state.shading ? 'On' : 'Off'} , {this.state.threshold}%</span>
                    </p>
                    <label className="accordion-body">
                        <div className="control">
                            <span className="text-center header">{LANG.shading}</span>
                            <input type="checkbox" checked={this.state.shading} onChange={this._handleShadingChange}/>
                        </div>
                        <div className="control">
                            <span className="text-center header">{LANG.threshold}</span>
                            <input type="range" min={0} max={100} value={this.state.threshold} onChange={this._handleThresholdChange} />
                        </div>
                    </label>
                </label>
            </div>
            );
        }
        
    });

});