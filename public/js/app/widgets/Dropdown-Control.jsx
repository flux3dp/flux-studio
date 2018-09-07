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
            options: PropTypes.array,
            default: PropTypes.string,
            onChange: PropTypes.func.isRequired
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

        _fireChange: function(newValue, selectedIndex) {
            if (this.props.id) {
                this.props.onChange(this.props.id, newValue, selectedIndex);
            } else {
                this.props.onChange(newValue, selectedIndex);
            }
        },

        _handleChange: function(e) {
            let { value, selectedIndex } = e.target;
            this.setState({ selectedValue: value }, function() {
                this._fireChange(value, selectedIndex);
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
                if (typeof option === 'object') {
                    return (<option value={option.value}>{option.label}</option>);
                } else {
                    return (<option value={option}>{option}</option>);
                }
            });

            return (
                <div className="controls">
                    <div className="label pull-left">{this.props.label}</div>
                    <div className="control">
                        <div className="dropdown-container">
                            <select id={this.props.id} onChange={this._handleChange} defaultValue={self.props.default}>
                                {_options}
                            </select>
                        </div>
                    </div>
                </div>
            );
        }

    });
});
