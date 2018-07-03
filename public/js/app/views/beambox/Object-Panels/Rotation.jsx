define([
    'jquery',
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
], function($, React, PropTypes, FnWrapper, UnitInput, i18n) {
    'use strict';

    const LANG = i18n.lang.beambox.object_panels;
    
    return React.createClass({
        propTypes: {
            angle: PropTypes.number.isRequired
        },

        getInitialState: function() {
            return {
                angle: this.props.angle
            };
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                angle: nextProps.angle
            });
        },

        _update_angle_handler: function(angle) {
            FnWrapper.update_angle(angle);
            this.setState({angle: angle});
        },
        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {LANG.rotation}
                            <span className="value">{this.state.angle}°</span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <UnitInput
                                    min={-180}
                                    max={180}
                                    defaultUnitType="angle"
                                    defaultUnit="°"
                                    defaultValue={this.state.angle}
                                    getValue={this._update_angle_handler}
                                />
                            </div>
                        </label>
                    </label>
                </div>
            );
        }
        
    });
});