define([
    'jquery',
    'react',
    'reactPropTypes',
    'helpers/i18n'
], function($, React, PropTypes, i18n, localStorage) {
    'use strict';

    return React.createClass({
        PropTypes: {
            onJoin: PropTypes.func,
            onBack: PropTypes.func,
            wifiName: PropTypes.string
        },
        getInitialState: function() {
            return {
                connecting: false
            };
        },
        componentWillReceiveProps: function(nextProps) {
            console.log(nextProps);
        },
        _handleJoin: function() {
            this.setState({connecting: true});
            this.props.onJoin();
        },
        _handleBack: function() {
            this.props.onBack();
        },
        _renderActions: function(lang) {
            return this.state.connecting ? (
                <div>
                    <div><img className="loading" src="img/ring.svg" /></div>
                    <div>{lang.wifi.set_password.connecting}</div>
                </div>
            ) : (
                <div className="btn-h-group">
                    <a id="btn-cancel" className="btn" onClick={this._handleBack}>{lang.wifi.set_password.back}</a>
                    <a id="btn-join" className="btn" onClick={this._handleJoin}>{lang.wifi.set_password.join}</a>
                </div>
            );
        },
        render : function() {
            var lang = this.props.lang,
                actions = this._renderActions(lang);

            return (
                <div className="wifi text-center">
                    <img className="wifi-symbol" src="img/img-wifi-lock.png"/>
                    <div className="wifi-form">
                        <h2>
                            {lang.wifi.set_password.line1}
                            {this.props.wifiName}
                            {lang.wifi.set_password.line2}
                        </h2>
                        <div>
                            <input ref="password" type="password" id="text-password"
                            placeholder={lang.wifi.set_password.password_placeholder} defaultValue=""/>
                        </div>
                        {actions}
                    </div>
                </div>
            );
        }

    });
});
