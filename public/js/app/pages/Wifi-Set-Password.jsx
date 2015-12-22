define([
    'jquery',
    'react',
    'app/actions/initialize-machine',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'helpers/api/usb-config'
], function($, React, initializeMachine, ButtonGroup, Modal, Alert, usbConfig) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({

            // UI events
            _onCancelConnection: function(e) {
                var wifi = initializeMachine.settingWifi.get();

                delete wifi.plain_password;
                initializeMachine.settingWifi.set(wifi);

                location.hash = '#initialize/wifi/select';
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
                            genericFailureHandler();
                            callback();
                        }

                        checkTimes--;
                    },
                    genericFailureHandler = function() {
                        self._openAlert(true)();

                        self.setState({
                            alertContent: {
                                caption: lang.initialize.errors.error,
                                message: lang.initialize.errors.wifi_connection.connecting_fail
                            }
                        });
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
                        genericFailureHandler();
                    }
                });

            },

            _openAlert: function(open) {
                var self = this;

                return function() {
                    self.setState({
                        openAlert: open
                    });
                }
            },

            // Lifecycle
            getInitialState: function() {
                return {
                    lang: args.state.lang,
                    openAlert: false,
                    alertContent: {}
                };
            },

            _renderAlert: function(lang) {
                var self = this,
                    buttons = [{
                        label: lang.initialize.confirm,
                        dataAttrs: {
                            'ga-event': 'confirm'
                        },
                        onClick: function(e) {
                            self._openAlert(false)();
                            location.hash = '#initialize/wifi/select';
                        }
                    }],
                    content = (
                        <Alert caption={this.state.alertContent.caption} message={this.state.alertContent.message} buttons={buttons}/>
                    );

                return (
                    true === this.state.openAlert ?
                    <Modal content={content}/> :
                    ''
                );
            },

            render: function() {
                var wrapperClassName = {
                        'initialization': true
                    },
                    lang = this.state.lang,
                    alert = this._renderAlert(lang),
                    content = (
                        <div className="connecting-wifi text-center">
                            <h1>{lang.initialize.connecting}</h1>
                            <div className="spinner-roller"/>
                            <button className="btn btn-action btn-large" data-ga-event="cancel" onClick={this._onCancelConnection}>{lang.initialize.cancel}</button>
                            {alert}
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