define([
    'jquery',
    'react',
    'helpers/shortcuts'
], function($, React, shortcuts) {
    'use strict';

    var lang;

    return React.createClass({

        propTypes: {
            open        : React.PropTypes.bool,
            lang        : React.PropTypes.object,
            type        : React.PropTypes.string,   // 0 (Info), 1 (Warning), 2 (Error)
            hasRetry    : React.PropTypes.bool,
            escapable   : React.PropTypes.bool,
            message     : React.PropTypes.string,
            onRetry     : React.PropTypes.func,
            onClose     : React.PropTypes.func
        },

        getDefaultProps: function() {
            return {
                type: 'INFO',
                escapable: true,
                open: true
            };
        },

        componentWillMount: function() {
            lang = this.props.lang.alert;
        },

        componentDidMount: function() {
            var self = this;
            shortcuts.on(['esc'], function(e) {
                    self.props.onClose(e);
            });
        },

        componentWillUnmount: function() {
            shortcuts.off(['esc']);
        },

        _onClose: function(e) {
            React.unmountComponentAtNode(View);
            this.props.onClose(e);
        },

        _onEscapeOnBackground: function(e) {
            var self = this;

            if (this.props.escapable) {
                self.props.onClose(e);
            }
        },

        _renderTypeTitle: function() {
            var types = {
                'INFO': lang.info,
                'WARNING': lang.warning,
                'ERROR': lang.error
            };

            return(
                <h4>{types[this.props.type]}</h4>
            );
        },

        _renderFooter: function() {
            var retryBtn = typeof(this.props.onRetry) !== 'undefined' ? <a className="btn" onClick={this.props.onRetry}>RETRY</a> : '';
            return (
                <div>
                    <a className="btn" onClick={this.props.onClose}>{this.props.lang.print.cancel}</a>
                    {retryBtn}
                </div>
            );
        },

        render: function() {
            if(!this.props.open) {
                return (<div></div>);
            }

            var typeTitle = this._renderTypeTitle(),
                footer = this._renderFooter();

            return (
                <div className="modal-window">
                    <div className="modal-background" onClick={this._onEscapeOnBackground}/>
                    <div className="modal-body notification">
                        <div className="modal-content">
                            <div className="wrapper">
                                {typeTitle}
                                {this.props.message}
                            </div>
                        </div>
                        <div className="modal-actions button-group">
                            {footer}
                        </div>
                    </div>
                </div>
            );
        }

    });
});
