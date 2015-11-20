define([
    'react'
], function(React) {
    'use strict';

    return React.createClass({

        getDefaultProps: function() {
            return {
                textOn: '',
                textOff: '',
                defaultChecked: false,
                defaultValue: '',
                displayText: '',
                className: '',
                // events
                onClick: function() {}
            };
        },

        // UI events
        _onClick: function(e) {
            this.state.checked = !this.state.checked;

            this.setState({
                checked: this.state.checked
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
                defaultClassName = 'ui ui-control-text-toggle',
                className = defaultClassName + ('string' === typeof this.props.className ? ' ' + this.props.className : '');

            return (
                <label className={className}>
                    <span className="caption">{props.displayText}</span>
                    <input
                        refs="toggle"
                        type="checkbox"
                        className={stateStyle}
                        defaultValue={props.defaultValue}
                        checked={this.state.checked}
                        onClick={this._onClick}
                    />
                    <span className="status" data-text-on={props.textOn} data-text-off={props.textOff}></span>
                </label>
            );
        },

        getInitialState: function() {
            return {
                checked: this.props.defaultChecked
            };
        }

    });
});