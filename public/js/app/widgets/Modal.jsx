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
                disabledEscapeOnBackground: false,
                className: {}
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
            var cx = React.addons.classSet,
                backgroundClass;

            this.props.className['modal-window'] = true;
            backgroundClass = cx(this.props.className);

            return (
                <div className={backgroundClass}>
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
            shortcuts.off(['esc']);
        }
    });
});