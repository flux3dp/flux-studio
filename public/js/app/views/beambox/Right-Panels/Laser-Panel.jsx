define([
    'jquery',
    'react',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
], function($, React, UnitInput, i18n) {
    'use strict';

    // const LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            layerName:       React.PropTypes.string.isRequired,
            speed:      React.PropTypes.number.isRequired,
            strength:   React.PropTypes.number.isRequired,
            funcs:      React.PropTypes.func.isRequired
        },
        
        getInitialState: function() {
            return {
                speed: this.props.speed,
                strength: this.props.strength
            };
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({
                speed: nextProps.speed,
                strength: nextProps.strength
            });
        },

        _handleSpeedChange: function(val) {
            this.setState({speed: val}, function(){
                this.props.funcs.writeSpeed(this.props.layerName, val);
            });
        },
        _handleStrengthChange: function(val) {
            this.setState({strength: val}, function(){
                this.props.funcs.writeStrength(this.props.layerName, val);
            });
        },
        
        render: function() {
            return (
                <div>
                    <h4>Laser Config: {this.props.layerName}</h4>
                    <div>
                        <span className='title'>Strength</span>
                        <UnitInput
                            min={1}
                            max={100}
                            unit="%"
                            defaultValue={this.state.strength}
                            getValue={this._handleStrengthChange}
                            decimal={1}
                            />
                    </div>
                    <div>
                        <span className='title'>Speed</span>
                        <UnitInput
                            min={3}
                            max={300}
                            unit="mm/s"
                            defaultValue={this.state.speed}
                            getValue={this._handleSpeedChange}
                            decimal={1}
                        />
                    </div>
                </div>
            );
        }
        
    });

     
});