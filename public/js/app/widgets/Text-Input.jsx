define([
    'react'
], function(React) {
    'use strict';

    return React.createClass({
        // Public
        value: function() {
            return this.refs.textInput.getDOMNode().value;
        },

        // Lifecycle
        render: function() {
            return (
                <input
                    ref="textInput"
                    className="ui ui-control-text-input"
                    type="text"
                    defaultValue={this.props.displayValue}
                />
            );
        },

        getDefaultProps: function() {
            return {
                defaultValue: React.PropTypes.string
            };
        }
    });
});