define([
    'react',
    'app/actions/initialize-machine',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Modal',
    'helpers/api/usb-config',
    'app/actions/alert-actions',
    'app/stores/alert-store'
], function(
    React,
    initializeMachine,
    ButtonGroup,
    Modal,
    usbConfig,
    AlertActions,
    AlertStore
) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({

            // Lifecycle
            getInitialState: function() {
                return {
                    lang: args.state.lang,
                    openAlert: false,
                    alertContent: {}
                };
            },

            // UI events
            _onCancelConnection: function(e) {
                var wifi = initializeMachine.settingWifi.get();

                delete wifi.plain_password;
                initializeMachine.settingWifi.set(wifi);

                location.hash = '#initialize/wifi/select';
            },

            _handleWifiErrorConfirm: function(e) {

            },

            _handleSetPassword: function(e) {
                var self = this,
                    wifi = initializeMachine.settingWifi.get(),
                    usb = usbConfig(),
                    lang = self.state.lang,
                    password = wifi.plain_password,
                    checkTimes = 10,    // check network per second, 10 times in maximum.
                    checkCountdown = function(callback) {
                        if (0 === checkTimes) {
                            console.log("Check count down timeout");
                            genericFailureHandler();
                            callback();
                        }

                        checkTimes--;
                    },
                    genericFailureHandler = function() {
                        AlertStore.onCancel(this._handleWifiErrorConfirm);
                        AlertActions.showPopupError(
                            'wifi-authenticate-fail',
                            lang.initialize.errors.wifi_connection.connecting_fail,
                            lang.initialize.errors.wifi_connection.caption
                        );
                    },
                    checkNetworkStatus = function() {
                        var methods = usb.getMachineNetwork({
                                onSuccess: function(response) {
                                    response.ipaddr = response.ipaddr || [];
                                    response.ssid = response.ssid || '';

                                    if (0 < response.ipaddr.length && '' !== response.ssid) {
                                        methods.stop();
                                        location.hash = '#initialize/wifi/setup-complete';
                                    }
                                    else {
                                        checkCountdown(methods.stop);
                                    }
                                },
                                onError: function(response) {
                                    checkCountdown(methods.stop);
                                }
                            });
                    };

                usb.setWifiNetwork(wifi, password, {
                    onSuccess: function(response) {
                        checkNetworkStatus();
                    },
                    onError: function(response) {
                        console.log("Wifi set failed");
                        genericFailureHandler();
                    }
                });

            },

            render: function() {
                var wrapperClassName = {
                        'initialization': true
                    },
                    lang = this.state.lang,
                    content = (
                        <div className="connecting-wifi text-center">
                            <h1>{lang.initialize.connecting}</h1>
                            <div className="spinner-roller"/>
                            <button className="btn btn-action btn-large" data-ga-event="cancel" onClick={this._onCancelConnection}>{lang.initialize.cancel}</button>
                        </div>
                    );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            },

            componentDidMount: function() {
                this._handleSetPassword();
            },
        });

        return Page;
    };
});