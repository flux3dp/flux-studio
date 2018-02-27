define([
    'jquery',
    'react',
    'reactPropTypes',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
], function($, React, PropTypes, UnitInput, i18n) {
    'use strict';

    const LANG = i18n.lang.beambox.right_panel.laser_panel;

    return React.createClass({
        propTypes: {
            layerName:  PropTypes.string.isRequired,
            speed:      PropTypes.number.isRequired,
            strength:   PropTypes.number.isRequired,
            repeat:      PropTypes.number.isRequired,
            funcs:      PropTypes.object.isRequired
        },
        
        getInitialState: function() {
            return {
                speed:      this.props.speed,
                strength:   this.props.strength,
                repeat:      this.props.repeat
            };
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({
                speed:      nextProps.speed,
                strength:   nextProps.strength,
                repeat:   nextProps.repeat
            });
        },

        _handleSpeedChange: function(val) {
            this.setState({speed: val});
            this.props.funcs.writeSpeed(this.props.layerName, val);
        },

        _handleStrengthChange: function(val) {
            this.setState({strength: val})
            this.props.funcs.writeStrength(this.props.layerName, val);
        },

        _handleRepeatChange: function(val) {
            this.setState({repeat: val})
            this.props.funcs.writeRepeat(this.props.layerName, val);
        },

        _renderStrength: function() {
            return (
                <div className='panel'>
                    <span className='title'>{LANG.strength}</span>
                    <UnitInput
                        min={1}
                        max={100}
                        unit="%"
                        defaultValue={this.state.strength}
                        getValue={this._handleStrengthChange}
                        decimal={1}
                        />
                </div>
            );
        },
        _renderSpeed: function() {
            return (
                <div className='panel'>
                    <span className='title'>{LANG.speed}</span>
                    <UnitInput
                        min={3}
                        max={300}
                        unit="mm/s"
                        defaultValue={this.state.speed}
                        getValue={this._handleSpeedChange}
                        decimal={1}
                    />
                </div>
            );
        },

        _renderRepeat: function() {
            return (
                <div className='panel'>
                    <span className='title'>{LANG.repeat}</span>
                    <UnitInput
                        min={1}
                        max={100}
                        unit={LANG.times}
                        defaultValue={this.state.repeat}
                        getValue={this._handleRepeatChange}
                        decimal={0}
                    />
                </div>
            );
        },
        
        render: function() {
            const speedPanel = this._renderSpeed();
            const strengthPanel = this._renderStrength();
            const repeatPanel = this._renderRepeat();
            return (
                <div>
                    <div className="layername">
                        {this.props.layerName}
                    </div>
                    <div>
                        {strengthPanel}
                        {speedPanel}
                        {repeatPanel}
                    </div>
                </div>
            );
        }
        
    });

     
});