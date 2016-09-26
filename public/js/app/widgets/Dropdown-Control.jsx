define([
    'react',
    'plugins/classnames/index'
], function(React, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: React.PropTypes.string.isRequired,
            label: React.PropTypes.string,
            options: React.PropTypes.array,
            default: React.PropTypes.string,
            onChange: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            return {
                selectedValue: this.props.default
            };
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            var newPropIsDifferent = nextProps.default !== this.state.sliderValue,
                newStateIsDifferent = this.state.selectedValue !== nextState.selectedValue;

            return newPropIsDifferent || newStateIsDifferent;
        },

        _fireChange: function(newValue) {
            this.props.onChange(this.props.id, newValue);
        },

        _handleChange: function(e) {
            var value = e.target.value;
            this.setState({ selectedValue: value }, function() {
                this._fireChange(value);
            });
        },

        componentWillReceiveProps: function(nextProps) {
            if(nextProps.options.length !== this.props.options.length) {
                this.forceUpdate();
            }
        },

        render: function() {
            var self = this,
                _options;

            _options = this.props.options.map(function(option) {
                var isSelected = option === self.props.default ? 'selected' : '';
                return (<option value={option} selected={isSelected}>{option}</option>);
            });

            return (
                <div className="controls">
                    <div className="label pull-left">{this.props.label}</div>
                    <div className="control">
                        <div className="dropdown-container">
                            <select onChange={this._handleChange}>
                                {_options}
                            </select>
                        </div>
                    </div>
                </div>
            );
        }

    });
});
