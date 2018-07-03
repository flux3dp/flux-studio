define([
    'react',
    'reactPropTypes',
    'plugins/classnames/index'
], function(React, PropTypes, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: PropTypes.string,
            label: PropTypes.string,
            default: PropTypes.string,
            options: PropTypes.array.isRequired,
            onChange: PropTypes.func.isRequired
        },

        getInitialState: function() {
            return {
                selected: this.props.default,
                default: this.props.options[0].id
            };
        },

        componentWillReceiveProps(nextProps) {
            let _new = nextProps.default,
                _old = this.state.selected;

            if(_new !== _old) {
                this.setState({ selected: nextProps.default });
            }
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
                    <div key={option.id} className={`radio ${option.id}`} onClick={this._handleChange.bind(null, option.id, option.disable)}>
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
