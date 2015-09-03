define([
    'jquery',
    'react',
    'helpers/local-storage',
    'jsx!widgets/Modal',
    'helpers/api/usb-config'
], function($, React, localStorage, Modal, usbConfig) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },

            _getWifi: function() {
                return localStorage.get('setting-wifi');
            },

            _handleSetPassword: function(e) {
                e.preventDefault();

                var wifi = this._getWifi(),
                    usb = usbConfig(),
                    password = this.refs.password.getDOMNode().value;

                usb.setWifiNetwork(wifi, password, {
                    onSuccess: function(response) {
                        location.hash = '#initialize/wifi/success';
                    },
                    onError: function(response) {
                        location.hash = '#initialize/wifi/failure';
                    }
                });

            },

            _renderForm: function(lang, wifi) {
                return (
                    <form className="wifi-form">
                        <h2>
                            {lang.wifi.set_password.line1}
                            {wifi.ssid}
                            {lang.wifi.set_password.line2}
                        </h2>
                        <div>
                            <input ref="password" type="password" data-
                            placeholder={lang.wifi.set_password.password_placeholder} defaultValue="" autoFocus={true}/>
                        </div>
                        <div className="btn-h-group btn-align-center-h-group">
                            <a href="#initialize/wifi/select" className="btn btn-default">{lang.wifi.set_password.back}</a>
                            <button onClick={this._handleSetPassword} className="btn btn-action">{lang.wifi.set_password.join}</button>
                        </div>
                    </form>
                );
            },

            _renderNoSsidSeleted: function(lang) {
                return (
                    <div className="wifi-form">
                        <h2>
                            {lang.wifi.set_password.no_selected}
                        </h2>
                        <div className="btn-h-group btn-align-center-h-group">
                            <a href="#initialize/wifi/select" className="btn btn-default">{lang.wifi.set_password.back}</a>
                        </div>
                    </div>
                );
            },

            render : function() {
                var wifi = this._getWifi(),
                    lang = this.state.lang,
                    form = (
                        '' === wifi.ssid ?
                        this._renderNoSsidSeleted(lang) :
                        this._renderForm(lang, wifi)
                    ),
                    content = (
                        <div className="wifi initialization text-center">
                            <h1>{lang.welcome_headline}</h1>
                            <img className="wifi-symbol" src="/img/img-wifi-lock.png"/>
                            {form}
                        </div>
                    );

                return (
                    <Modal content={content}/>
                );
            }
        });

        return Page;
    };
});