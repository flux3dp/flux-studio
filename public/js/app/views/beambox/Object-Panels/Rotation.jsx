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
            angle: React.PropTypes.number.isRequired
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
                            {lang.laser.object_params.rotate.text}
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