define([
    'jquery',
    'react',
    'helpers/shortcuts'
], function($, React, shortcuts) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onOpen: React.PropTypes.func,
                onClose: React.PropTypes.func,
                content: React.PropTypes.element,
                disabledEscapeOnBackground: false
            };
        },

        _onClose: function(e) {
            this.props.onClose(e);
        },

        _onEscapeOnBackground: function(e) {
            var self = this;

            if (false === self.props.disabledEscapeOnBackground) {
                self.props.onClose(e);
            }
        },

        render: function() {
            return (
                <div className="modal-window">
                    <div className="modal-background" onClick={this._onEscapeOnBackground}/>
                    {this.props.content}
                </div>
            );
        },

        componentDidMount: function() {
            var self = this;

            self.props.onOpen(self);

            shortcuts.on(
                ['esc'],
                function(e) {
                    self.props.onClose(e);
                }
            );
        },

        componentWillUnmount: function() {
            shortcuts.disableAll();
        }
    });
});