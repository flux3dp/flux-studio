define([
    'jquery',
    'react',
    'helpers/local-storage',
    'css!cssHome/pages/wifi'
], function($, React, localStorage) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },
            componentDidMount: function() {
            },
            _handleSetPassword: function(e) {
                e.preventDefault();
                var password = this.refs.password.getDOMNode().value;

                // TODO: go to success or failure page
                // TODO: remove fake process
                var Dt = new Date();

                if (0 === Dt.getMilliseconds() % 2) {
                    console.log('success');
                    location.href = '#initialize/wifi/success';
                }
                else {
                    console.log('failure');
                    location.href = '#initialize/wifi/failure';
                }
            },
            render : function() {
                var wifi_settings = localStorage.get('setting-wifi'),
                    lang = this.state.lang;

                return (
                    <div className="wifi initialization absolute-center text-center">
                        <h1>{lang.welcome_headline}</h1>
                        <img className="wifi-symbol" src="/img/img-wifi-lock.png"/>
                        <div className="wifi-form">
                            <h2>
                                {lang.wifi.set_password.line1}
                                {wifi_settings.name}
                                {lang.wifi.set_password.line2}
                            </h2>
                            <div>
                                <input ref="password" type="password" id="text-password"
                                placeholder={lang.wifi.set_password.password_placeholder} defaultValue=""/>
                            </div>
                            <div className="btn-group">
                                <a href="#initialize/wifi/select" className="btn btn-default">{lang.wifi.set_password.back}</a>
                                <button id="btn-access-wifi" onClick={this._handleSetPassword} className="btn">{lang.wifi.set_password.join}</button>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});