define([
    'jquery',
    'react',
    'app/actions/initialize-machine',
    'jsx!widgets/Modal',
    'jsx!widgets/List',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Alert',
    'helpers/api/usb-config',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/alert-actions',
    'app/stores/alert-store'
], function(
    $,
    React,
    initializeMachine,
    Modal,
    ListView,
    ButtonGroup,
    Alert,
    usbConfig,
    ProgressActions,
    ProgressConstants,
    AlertActions,
    AlertStore
) {
    'use strict';
    var actionMap = {
        BACK_TO_SET_PASSWARD      : 'BACK_TO_SET_PASSWARD',
        AP_MODE                   : 'AP_MODE',
        SET_WIFI_WITHOUT_PASSWORD : 'SET_WIFI_WITHOUT_PASSWORD'
    };

    return function(args) {
        args = args || {};

        return React.createClass({

            scanWifi: true,
            action: '',
            deferred: $.Deferred(),

            // Lifecycle
            getInitialState: function() {
                return {
                    lang: args.state.lang,
                    wifiOptions: [],
                    selectedWifi: false,
                    openAlert: false,
                    openPassword: false,
                    alertContent: {}
                };
            },

            componentDidMount : function() {
                var self = this,
                    usb = usbConfig(),
                    wifiOptions = [],
                    settingWifi = initializeMachine.settingWifi.get(),
                    getWifi = function() {
                        wifiOptions = [];

                        usb.getWifiNetwork({
                            onSuccess: function(response) {
                                var item;

                                response.items = response.items.sort(function(a, b) {
                                    var aSSid = a.ssid.toUpperCase(),
                                        bSsid = b.ssid.toUpperCase();

                                    if (aSSid === bSsid) {
                                        return 0;
                                    }
                                    else if (aSSid > bSsid) {
                                        return 1;
                                    }
                                    else {
                                        return -1;
                                    }
                                });

                                response.items.forEach(function(el) {
                                    item = self._renderWifiItem(el);
                                    wifiOptions.push({
                                        value: el.ssid,
                                        label: {item}
                                    });

                                    if (settingWifi.ssid === el.ssid) {
                                        self.setState({
                                            selectedWifi: true
                                        });
                                    }

                                    self.setState({
                                        wifiOptions: wifiOptions
                                    });
                                });

                                if (true === self.scanWifi) {
                                    self.deferred.notify();
                                }
                                else {
                                    ProgressActions.open(ProgressConstants.NONSTOP);
                                    self.deferred.resolve({
                                        action: self.action
                                    });
                                }
                            },
                            onError: function(response) {
                                self.deferred.reject(response);
                            }
                        });
                    };

                self.deferred.progress(function() {
                    getWifi();
                }).
                done(self._afterStopWifiScanning).
                fail(function(response) {
                    AlertActions.showPopupError(
                        'wifi-scan-error',
                        response.error
                    );
                });

                getWifi();

                AlertStore.onCancel(self._onCancel);
            },

            // Private methods
            _onCancel: function(id) {
                if ('#initialize/wifi/set-printer' === location.hash) {
                    var usb = usbConfig();
                    usb.close();
                    location.hash = 'initialize/wifi/connect-machine';
                }
            },

            _afterStopWifiScanning: function(args) {
                var self = this,
                    lang = self.state.lang,
                    settingDevice = initializeMachine.settingPrinter.get(),
                    usb = usbConfig();

                self.deferred.done(function() {
                    ProgressActions.close();

                    switch (args.action) {
                    case actionMap.BACK_TO_SET_PASSWARD:
                        self._backToSetPassword();
                        break;
                    case actionMap.AP_MODE:
                        self._setApMode();
                        break;
                    case actionMap.SET_WIFI_WITHOUT_PASSWORD:
                        self._setWifiWithPassword();
                        break;
                    }

                });
            },

            _backToSetPassword: function() {
                location.hash = '#initialize/wifi/set-password';
            },

            _setApMode: function() {
                var self = this,
                    lang = self.state.lang,
                    settingDevice = initializeMachine.settingPrinter.get(),
                    usb = usbConfig();

                usb.setAPMode(
                    settingDevice.name,
                    {
                        onSuccess: function(response) {
                            location.hash = 'initialize/wifi/setup-complete/station-mode';
                        },
                        onError: function(response) {
                            AlertActions.showPopupError('ap-mode-fail', lang.initialize.errors.select_wifi.ap_mode_fail);
                        }
                    }
                );
            },

            _setWifiWithPassword: function() {
                location.hash = '#initialize/wifi/setup-complete/with-wifi';
            },

            _handleSetPassword: function(e) {
                e.preventDefault();

                var self = this,
                    wifi = initializeMachine.settingWifi.get();

                wifi.plain_password = self.refs.password.getDOMNode().value;

                initializeMachine.settingWifi.set(wifi);
                self.scanWifi = false;
                self.action = actionMap.BACK_TO_SET_PASSWARD;

                if ('undefined' === typeof self.deferred) {
                    this._setWifiWithPassword();
                }
            },

            // UI events
            _confirmWifi: function(e) {
                e.preventDefault();

                var settingWifi = initializeMachine.settingWifi.get();

                if (true === settingWifi.password) {
                    this.setState({
                        openPassword: true
                    });
                }
                else {
                    self.scanWifi = false;
                        self.action = actionMap.SET_WIFI_WITHOUT_PASSWORD;

                    if ('undefined' === typeof self.deferred) {
                        this._();
                    }
                }
            },

            _selectWifi: function(e) {
                var $li = $(e.target).parents('label'),
                    meta = $li.data('meta');

                this.setState({
                    selectedWifi: true
                });

                initializeMachine.settingWifi.set(meta);
            },

            _setAsStationMode: function(e) {
                this.scanWifi = false;
                this.action = actionMap.AP_MODE;
                if ('undefined' === typeof self.deferred) {
                    this._setApMode();
                }
            },

            _renderPasswordForm: function(lang) {
                var self = this,
                    settingWifi = initializeMachine.settingWifi.get(),
                    buttons = [{
                        label: lang.initialize.connect,
                        className: 'btn-action btn-large',
                        type: 'submit',
                        dataAttrs: {
                            'ga-event': 'set-password-to-connect-to-wifi'
                        },
                        onClick: self._handleSetPassword
                    },
                    {
                        label: lang.initialize.cancel,
                        className: 'btn-link btn-large',
                        dataAttrs: {
                            'ga-event': 'cancel-connect-to-wifi'
                        },
                        onClick: function(e) {
                            e.preventDefault();

                            self.setState({
                                openPassword: false
                            });
                        }
                    }],
                    content = (
                        <form className="form form-wifi-password" onSubmit={self._handleSetPassword}>
                            <div className="notice">
                                <p>“{settingWifi.ssid}”</p>
                                <p>{lang.initialize.requires_wifi_password}</p>
                            </div>
                            <input
                                ref="password"
                                type="password"
                                className="password-input"
                                placeholder=""
                                defaultValue=""
                                autoFocus={true}
                            />
                            <ButtonGroup className="btn-v-group" buttons={buttons}/>
                        </form>
                    );

                return (
                    true === this.state.openPassword ?
                    <Modal content={content}/> :
                    ''
                );
            },

            _renderWifiItem: function(wifi) {
                var settingWifi = initializeMachine.settingWifi.get(),
                    lockClassName = 'fa ' + (true === wifi.password ? 'fa-lock' : ''),
                    meta = JSON.stringify(wifi);

                return (
                    <label data-meta={meta}>
                        <input type="radio" name="wifi-spot" value={wifi.ssid} defaultChecked={settingWifi.ssid === wifi.ssid}/>
                        <div className="row-fluid">
                            <span className="wifi-ssid">{wifi.ssid}</span>
                            <span className={lockClassName}></span>
                            <span className="wifi-signal-strength fa fa-wifi"></span>
                        </div>
                    </label>
                );
            },

            _renderWifiOptions: function(lang) {
                return (
                    0 < this.state.wifiOptions.length ?
                    <ListView
                        ref="wifiList"
                        className="pure-list wifi-list clearfix"
                        ondblclick={this._confirmWifi}
                        onClick={this._selectWifi}
                        items={this.state.wifiOptions}
                    /> :
                    <div className="wifi-list">
                        <div className="spinner-roller absolute-center"/>
                    </div>
                );
            },

            render: function() {
                var lang = this.state.lang,
                    wrapperClassName = {
                        'initialization': true
                    },
                    items = this._renderWifiOptions(lang),
                    buttons = [{
                        label: lang.initialize.next,
                        className: 'btn-action btn-large' + (true === this.state.selectedWifi ? '' : ' btn-disabled'),
                        dataAttrs: {
                            'ga-event': 'pickup-a-wifi'
                        },
                        onClick: this._confirmWifi
                    },
                    {
                        label: lang.initialize.set_machine_generic.set_station_mode,
                        className: 'btn-action btn-large btn-set-station-mode',
                        dataAttrs: {
                            'ga-event': 'set-as-station-mode'
                        },
                        onClick: this._setAsStationMode
                    },
                    {
                        label: lang.initialize.skip,
                        className: 'btn-link btn-large',
                        type: 'link',
                        dataAttrs: {
                            'ga-event': 'use-device-with-usb'
                        },
                        href: '#initialize/wifi/setup-complete/with-usb'
                    }],
                    passwordForm = this._renderPasswordForm(lang),
                    content = (
                        <div className="select-wifi text-center">
                            <img className="brand-image" src="/img/menu/main_logo.svg"/>
                            <div>
                                <h1 className="headline">{lang.initialize.wifi_setup}</h1>
                                <p className="notice">{lang.initialize.select_preferred_wifi}</p>
                                {items}
                                <ButtonGroup className="btn-v-group" buttons={buttons}/>
                            </div>
                            {passwordForm}
                        </div>
                    );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            }
        });
    };
});