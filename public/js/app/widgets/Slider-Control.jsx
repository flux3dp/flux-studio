define([
    'react',
    'reactPropTypes',
    'plugins/classnames/index'
], function(React, PropTypes, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: PropTypes.string.isRequired,
            label: PropTypes.string,
            min: PropTypes.number.isRequired,
            max: PropTypes.number.isRequired,
            step: PropTypes.number.isRequired,
            default: PropTypes.number,
            onChange: PropTypes.func.isRequired
        },

        getInitialState: function() {
            return {
                sliderValue: this.props.default,
                lastValidValue: this.props.default
            };
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            var newPropIsDifferent = nextProps.default !== this.state.sliderValue,
                newStateIsDifferent = this.state.sliderValue !== nextState.sliderValue;

            return newPropIsDifferent || newStateIsDifferent;
        },

        _fireChange: function(newValue) {
            this.props.onChange(this.props.id, newValue);
        },

        _validateValue: function(e) {
            if(!this._isValidValue(this.state.sliderValue)) {
                this.setState({
                    sliderValue: this.state.lastValidValue,
                });
                this._fireChange(this.state.lastValidValue);
            }
        },

        _isValidValue: function(value) {
            var min = this.props.min,
                max = this.props.max;

            return min <= value && value <= max;
        },

        _handleSliderChange: function(key, e) {
            var value = e.target.value;
            this.setState({
                sliderValue: value,
                lastValidValue: value
            }, function() {
                this._fireChange(value);
            });
        },

        _handleEditValue: function(e) {
            var newValue = e.target.value;

            if(this._isValidValue(newValue)) {
                this.setState({ lastValidValue: newValue });
                this._fireChange(newValue);
            }

            this.setState({ sliderValue: newValue });
        },

        render: function() {
            return (
                <div className="controls">
                    <div className="label pull-left">{this.props.label}</div>
                    <div className="control pull-right">

                        <div className="slider-container">
                            <input className="slider" type="range"
                                min={this.props.min}
                                max={this.props.max}
                                step={this.props.step}
                                value={this.state.sliderValue}
                                onChange={this._handleSliderChange.bind(null, this.props.id)} />
                        </div>

                        <input id={this.props.id} type="text" value={this.state.sliderValue}
                            onChange={this._handleEditValue}
                            onFocus={this._handleEditValue}
                            onBlur={this._validateValue} />
                    </div>
                </div>
            );
        }

    });
});
