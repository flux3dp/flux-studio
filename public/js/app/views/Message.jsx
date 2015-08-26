define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    return React.createClass({
        render : function() {
            var lang = this.props.lang;
            return (
                <div className="select-printer">
                    <div>{this.props.message}</div>
                    <a className="btn btn-default" onClick={this.props.onClose}>{lang.settings.close}</a>
                    <a className="btn btn-default" onClick={this.props.onRetry}>{lang.device.retry}</a>
                </div>
            );
        }
    });
});
