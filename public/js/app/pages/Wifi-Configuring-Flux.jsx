define([
    'react',
    'jsx!widgets/Modal',
    'helpers/api/usb-config'
], function(React, Modal, usbConfig) {
    'use strict';

    return function(args) {

        args = args || {};

        return React.createClass({

            _onSettingUpAsAPMode: function(e) {
                var usb = usbConfig();

                usb.setAPMode({
                    onSuccess: function(response) {
                        location.hash = '#initialize/wifi/configured-flux';
                    },
                    onError: function(response) {
                        // TODO: show error message
                    }
                });
            },

            getInitialState: function() {
                return {
                    lang: args.state.lang
                };
            },

            render : function() {
                var lang = this.state.lang,
                    content = (
                        <div className="wifi initialization absolute-center text-center">
                            <h1>{lang.welcome_headline}</h1>
                            <img className="wifi-symbol" src="/img/img-flux-ap.png" />
                            <div className="wifi-form">
                                <h2>{lang.wifi.configuring_flux.caption}</h2>
                                <p>{lang.wifi.configuring_flux.description}</p>
                                <div>
                                    <button onClick={this._onSettingUpAsAPMode}
                                        className="btn btn-action btn-large">
                                        {lang.wifi.configuring_flux.next}
                                    </button>
                                </div>
                                <div>
                                    <a href="#initialize/wifi/select">{lang.wifi.configuring_flux.footer}</a>
                                </div>
                            </div>
                        </div>
                    );

                return (
                    <Modal content={content}/>
                );
            }
        });
    };
});