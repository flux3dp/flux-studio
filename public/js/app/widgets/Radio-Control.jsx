define([
    'react',
    'plugins/classnames/index'
], function(React, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: React.PropTypes.string,
            label: React.PropTypes.string,
            default: React.PropTypes.string,
            options: React.PropTypes.array.isRequired,
            onChange: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            return {
                selected: this.props.default,
                default: this.props.options[0].id
            };
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            var newPropIsDifferent = nextProps.default !== this.state.selected,
                newStateIsDifferent = this.state.selected !== nextState.selected;

            return newPropIsDifferent || newStateIsDifferent;
        },

        _handleChange: function(newValue, disable) {
            if(disable !== true) {
                this.setState({ selected: newValue });
                this.props.onChange(this.props.id, newValue);
            }
        },

        render: function() {
            var _options = this.props.options.map(function(option) {
                var radioClass = ClassNames(
                    {'selected': this.state.selected === option.id}
                );
                return (
                    <div className="radio" onClick={this._handleChange.bind(null, option.id, option.disable)}>
                        <div className={radioClass}></div>
                        <span>{option.name}</span>
                    </div>
                );
            }.bind(this));

            return (
                <div className="controls">
                    <div className="label">{this.props.label}</div>
                    <div className="control">
                        {_options}
                    </div>
                </div>
            );
        }

    });
});
