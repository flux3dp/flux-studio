define([
    'react',
    'reactDOM',
    'reactPropTypes'
], function(React, ReactDOM, PropTypes) {
    'use strict';

    return React.createClass({
        // Public
        value: function() {
            return ReactDOM.findDOMNode(this.refs.textInput).value;
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
                defaultValue: PropTypes.string
            };
        }
    });
});