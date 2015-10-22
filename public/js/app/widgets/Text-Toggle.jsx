define([
    'react'
], function(React) {
    'use strict';

    return React.createClass({
        // UI events
        _onClick: function(e) {
            var checked = !this.state.checked;

            this.setState({
                checked: checked
            });

            this.props.onClick(e);
        },

        // Public function
        isChecked: function() {
            return this.state.checked;
        },

        // Lifecycle
        render: function() {
            var props = this.props,
                lang = props.lang,
                stateStyle = (true === this.state.checked ? 'on' : 'off'),
                checkBox = (
                    <label className="ui ui-control-text-toggle">
                        <span>{props.displayText}</span>
                        <input
                            refs="toggle"
                            type="checkbox"
                            className={stateStyle}
                            defaultValue={props.defaultValue}
                            checked={this.state.checked}
                            onClick={this._onClick}
                        />
                        <span data-text-on={props.textOn} data-text-off={props.textOff}></span>
                    </label>
                );

            return (
                <div className={props.className}>
                    {checkBox}
                </div>
            );
        },

        getDefaultProps: function() {
            return {
                textOn: '',
                textOff: '',
                checked: false,
                defaultValue: '',
                displayText: '',
                className: '',
                // events
                onClick: React.PropTypes.func
            };
        },

        getInitialState: function() {
            return {
                checked: this.props.checked
            };
        }

    });
});