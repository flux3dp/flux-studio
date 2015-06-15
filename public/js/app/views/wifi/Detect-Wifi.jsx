define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/local-storage'
], function($, React, i18n, localStorage) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                lang:           React.PropTypes.object,
                _onStartDetect: React.PropTypes.func,
                _onCancel:      React.PropTypes.func
            };
        },
        _handleStart: function() {
            this.props.onStartDetect();
        },
        _handleCancel: function() {
            this.props.onCancel();
        },
        render : function() {
            var lang = this.props.lang;

            return (
                <div className="wifi text-center">
                    <img className="wifi-symbol" src="/img/img-wifi.png"/>
                    <div className="wifi-form">
                        <h2>{lang.wifi.home.line1}</h2>
                        <p>{lang.wifi.home.line2}</p>
                        <div>
                            <a id="btn-start" className="btn btn-large" onClick={this._handleStart}>{lang.wifi.home.select}</a>
                        </div>
                        <div>
                            <a id="btn-cancel" onClick={this._handleCacel}>{lang.wifi.home.no_available_wifi}</a>
                        </div>
                    </div>
                </div>
            )
        }

    });
});