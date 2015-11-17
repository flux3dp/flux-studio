define([
    'react',
    'plugins/classnames/index'
], function(React, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            label: React.PropTypes.string,
            default: React.PropTypes.string,
            options: React.PropTypes.array.isRequired,
            onChange: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            return {
                selected: this.props.options[0].id,
                default: this.props.options[0].id
            };
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            var newPropIsDifferent = nextProps.default !== this.state.selected,
                newStateIsDifferent = this.state.selected !== nextState.selected;

            return newPropIsDifferent || newStateIsDifferent;
        },

        _handleChange: function(newValue) {
            // this.setState({ selected: newValue });
        },

        render: function() {
            var _options = this.props.options.map(function(option) {
                var radioClass = ClassNames(
                    {'selected': this.state.selected === option.id},
                    {'grey-out': option.id === 'Experiment'}
                );
                return (
                    <div className="radio">
                        <div className={radioClass} onClick={this._handleChange.bind(null, option.id)}></div>
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
