define([
    'react',
    'plugins/classnames/index'
], function(React, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: React.PropTypes.string.isRequired,
            label: React.PropTypes.string,
            default: React.PropTypes.bool,
            onChange: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            return {
                checked: this.props.default
            };
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            var newPropIsDifferent = nextProps.default !== this.state.checked,
                newStateIsDifferent = this.state.checked !== nextState.checked;

            return newPropIsDifferent || newStateIsDifferent;
        },

        _fireChange: function(newValue) {
            this.props.onChange(this.props.id, newValue);
        },

        _handleToggle: function(e) {
            var isChecked = e.target.checked;
            this.setState({ checked: isChecked }, function() {
                this._fireChange(isChecked);
            });
        },

        render: function() {
            return (
                <div className="controls" name={this.props.id}>
                    <div className="label pull-left">{this.props.label}</div>
                    <div className="control">
                        <div className="switch-container">

                            <div className="switch-status">{this.state.checked ? 'ON' : 'OFF'}</div>

                            <div className="onoffswitch" name={this.props.name || ''}>

                                <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={this.props.id}
                                    onChange={this._handleToggle}
                                    checked={this.state.checked} />

                                <label className="onoffswitch-label" htmlFor={this.props.id}>
                                    <span className="onoffswitch-inner"></span>
                                    <span className="onoffswitch-switch"></span>
                                </label>

                            </div>

                        </div>
                    </div>
                </div>
            );
        }

    });
});
