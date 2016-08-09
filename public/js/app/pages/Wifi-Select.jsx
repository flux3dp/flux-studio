define([
    'jquery',
    'react',
    'app/actions/initialize-machine',
    'jsx!widgets/Modal',
    'jsx!widgets/List',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Alert',
    'helpers/api/usb-config',
    'helpers/api/upnp-config',
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
    upnpConfig,
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
        },
        wifiAPI,
        globalWifiAPI;

    return function(args) {
        args = args || {};

        return React.createClass({

            action: '',
            deferred: $.Deferred(),

            componentWillUnmount: () => {
                if ('undefined' !== typeof globalWifiAPI) {
                    globalWifiAPI.connection.close();
                }
            },

            // Lifecycle
            getInitialState: function() {
                return {
                    lang: args.state.lang,
                    wifiOptions: [],
                    selectedWifi: false,
                    openAlert: false,
                    openPassword: false,
                    openApModeForm: false,
                    apName: initializeMachine.settingPrinter.get().name,
                    apPass: '',
                    alertContent: {},
                    settingPrinter: initializeMachine.settingPrinter.get(),
                    apModeNameIsVaild: true,
                    apModePassIsVaild: true,
                    isFormSubmitted: false
                };
            },

            componentDidMount : function() {
                var self = this,
                    wifiOptions = [],
                    settingWifi = initializeMachine.settingWifi.get(),
                    settingPrinter = self.state.settingPrinter,
                    timer,
                    getWifi = function() {
                        wifiOptions = [];

                        wifiAPI.getWifiNetwork().done(function(response) {
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

                            self.deferred.notify('SCAN_WIFI');
                        }).
                        fail(function(response) {
                            self.deferred.reject(response);
                        });
                    };

                self.deferred.progress(function(nextAction) {

                    switch (nextAction) {
                    case 'SCAN_WIFI':
                        getWifi();
                        break;
                    case 'STOP_SCAN':
                        ProgressActions.open(ProgressConstants.NONSTOP);
                        self._afterStopWifiScanning({
                            action: self.action
                        });
                        break;
                    }

                }).
                fail(function(response) {
                    AlertActions.showPopupError(
                        'wifi-scan-error',
                        response.error
                    );
                });


                if ('WIFI' === settingPrinter.from) {
                    wifiAPI = upnpConfig(settingPrinter.uuid);
                    // defined at top
                    globalWifiAPI = upnpConfig(settingPrinter.uuid);
                }
                else {
                    wifiAPI = usbConfig();
                }

                getWifi();

                AlertStore.onCancel(self._onCancel);
            },

            // Private methods
            _onCancel: function(id) {
                if ('#initialize/wifi/select' === location.hash) {
                    var usb = usbConfig();
                    usb.close();
                    location.hash = 'initialize/wifi/connect-machine';
                }
            },

            _afterStopWifiScanning: function(args) {
                var self = this;

                ProgressActions.close();

                switch (args.action) {
                case actionMap.BACK_TO_SET_PASSWARD:
                    self._goToSetPassword();
                    break;
                case actionMap.AP_MODE:
                    self._setApMode();
                    break;
                case actionMap.SET_WIFI_WITHOUT_PASSWORD:
                    self._setWifiWithoutPassword();
                    break;
                }
            },

            _goToSetPassword: function() {
                var settingPrinter = this.state.settingPrinter,
                    settingWifi = initializeMachine.settingWifi.get();

                if ('WIFI' === this.state.settingPrinter.from) {
                    this._settingWifiViaWifi();
                }
                else {
                    location.hash = '#initialize/wifi/set-password';
                }
            },

            _setApMode: function() {
                var self = this,
                    lang = self.state.lang,
                    settingPrinter = self.state.settingPrinter,
                    apName = self.state.apName,
                    apPass = self.state.apPass;

                settingPrinter.apName = apName;
                initializeMachine.settingPrinter.set(settingPrinter);

                if ('WIFI' === settingPrinter.from) {
                    self._setApModeViaWifi(apName, apPass);
                }
                else {
                    self._setApModeViaUsb(apName, apPass);
                }
            },

            _setApModeViaUsb: function(name, pass) {
                var self = this,
                    lang = self.state.lang,
                    usb = usbConfig();

                usb.setAPMode(
                    name,
                    pass,
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

            _setApModeViaWifi: function(name, pass) {
                var self = this,
                    lang = self.state.lang,
                    settingPrinter = self.state.settingPrinter;

                globalWifiAPI.setAPMode(name, pass).
                done(function(response) {
                    location.hash = 'initialize/wifi/setup-complete/station-mode';
                }).
                fail(function(response) {
                    AlertActions.showPopupError('ap-mode-fail', lang.initialize.errors.select_wifi.ap_mode_fail);
                });
            },

            _settingWifiViaWifi: function() {
                var settingPrinter = this.state.settingPrinter,
                    settingWifi = initializeMachine.settingWifi.get();

                settingPrinter.apName = settingWifi.ssid;
                initializeMachine.settingPrinter.set(settingPrinter);
                ProgressActions.open(ProgressConstants.NONSTOP);

                globalWifiAPI.setWifiNetwork(settingWifi, settingWifi.plain_password).
                always(function() {
                    ProgressActions.close();
                }).
                done(function(response) {
                    console.log('done', response);
                    location.hash = '#initialize/wifi/notice-from-device';
                }).
                fail(function(response) {
                    console.log('fail', response);
                });
            },

            _setWifiWithoutPassword: function() {
                var settingPrinter = self.state.settingPrinter,
                    settingWifi = initializeMachine.settingWifi.get();

                if ('WIFI' === settingPrinter.from) {
                    settingPrinter.apName = settingWifi.ssid;
                    initializeMachine.settingPrinter.set(settingPrinter);
                    this._settingWifiViaWifi();
                }
                else {
                    location.hash = '#initialize/wifi/setup-complete/with-wifi';
                }
            },

            _handleSetPassword: function(e) {
                e.preventDefault();

                var self = this,
                    wifi = initializeMachine.settingWifi.get();

                wifi.plain_password = self.refs.password.getDOMNode().value;

                initializeMachine.settingWifi.set(wifi);
                self._stopScan(actionMap.BACK_TO_SET_PASSWARD);
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
                    this._stopScan(actionMap.SET_WIFI_WITHOUT_PASSWORD);
                }
            },

            _stopScan: function(action) {
                this.action = action;
                this.deferred.notify('STOP_SCAN');
            },

            _startScan: function() {
                this.action = '';
                this.deferred.notify('SCAN_WIFI');
            },

            _selectWifi: function(e) {
                var $li = $(e.target).parents('label'),
                    meta = $li.data('meta');

                this.setState({
                    selectedWifi: true
                });

                initializeMachine.settingWifi.set(meta);
            },

            _checkApModeSetting: function(e) {
                var name = this.refs.ap_mode_name.getDOMNode().value,
                    pass = this.refs.ap_mode_password.getDOMNode().value,
                    apModeNameIsVaild = /^[a-zA-Z0-9]+$/g.test(name),
                    apModePassIsVaild = /^[a-zA-Z0-9]{8,}$/g.test(pass);

                this.setState({
                    apName: name,
                    apPass: pass,
                    apModeNameIsVaild: apModeNameIsVaild,
                    apModePassIsVaild: apModePassIsVaild
                });

                return (true === apModeNameIsVaild && true === apModePassIsVaild);
            },

            _setAsStationMode: function(e) {
                e.preventDefault();

                var name = this.refs.ap_mode_name.getDOMNode().value,
                    pass = this.refs.ap_mode_password.getDOMNode().value;

                if (true === this._checkApModeSetting()) {
                    this.setState({
                        isFormSubmitted: true
                    });
                    this._stopScan(actionMap.AP_MODE);
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

            _renderApModeForm: function(lang) {
                var self = this,
                    closeForm = function(e) {
                        self.setState({
                            openApModeForm: false
                        });
                    },
                    classSet = React.addons.classSet,
                    nameClass = classSet({
                        'error': false === self.state.apModeNameIsVaild
                    }),
                    passClass = classSet({
                        'error': false === self.state.apModePassIsVaild
                    }),
                    submitButtonClass = classSet({
                        'btn btn-action btn-large': true,
                        'btn-disabled': self.state.isFormSubmitted
                    }),
                    content = (
                        <form className="form form-ap-mode" onSubmit={self._setAsStationMode}>
                            <h2>{lang.initialize.set_machine_generic.create_network}</h2>
                            <label className="h-control">
                                <span className="header">
                                    {lang.initialize.set_machine_generic.ap_mode_name}
                                </span>
                                <input
                                    ref="ap_mode_name"
                                    type="text"
                                    className={nameClass}
                                    placeholder=""
                                    defaultValue={self.state.settingPrinter.name}
                                    autoFocus={true}
                                    required={true}
                                    pattern="^[a-zA-Z0-9]+$"
                                    maxLength="32"
                                    title={lang.initialize.set_machine_generic.ap_mode_name_format}
                                    placeholder={lang.initialize.set_machine_generic.ap_mode_name_placeholder}
                                    onKeyUp={self._checkApModeSetting}
                                />
                            </label>
                            <label className="h-control">
                                <span className="header">
                                    {lang.initialize.set_machine_generic.ap_mode_pass}
                                </span>
                                <input
                                    ref="ap_mode_password"
                                    type="password"
                                    className={passClass}
                                    placeholder=""
                                    defaultValue=""
                                    required={true}
                                    pattern="^[a-zA-Z0-9]{8,}$"
                                    title={lang.initialize.set_machine_generic.ap_mode_pass_format}
                                    placeholder={lang.initialize.set_machine_generic.ap_mode_pass_placeholder}
                                    onKeyUp={self._checkApModeSetting}
                                />
                            </label>
                            <div className="button-group btn-v-group">
                                <button className="btn btn-action btn-large" type="submit">{lang.initialize.confirm}</button>
                                <button className="btn btn-action btn-large btn-link" onClick={closeForm}>{lang.initialize.cancel}</button>
                            </div>
                        </form>
                    );

                return (
                    true === this.state.openApModeForm ?
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
                var self = this,
                    lang = self.state.lang,
                    wrapperClassName = {
                        'initialization': true
                    },
                    items = self._renderWifiOptions(lang),
                    buttons = [{
                        label: lang.initialize.next,
                        className: 'btn-action btn-large' + (true === self.state.selectedWifi ? '' : ' btn-disabled'),
                        dataAttrs: {
                            'ga-event': 'pickup-a-wifi'
                        },
                        onClick: self._confirmWifi
                    },
                    {
                        label: lang.initialize.set_machine_generic.set_station_mode,
                        className: 'btn-action btn-large btn-set-station-mode',
                        dataAttrs: {
                            'ga-event': 'set-as-station-mode'
                        },
                        onClick: function(e) {
                            self.setState({
                                openApModeForm: true,
                                isFormSubmitted: false
                            });
                        }
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
                    apModeForm = this._renderApModeForm(lang),
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
                            {apModeForm}
                        </div>
                    );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            }
        });
    };
});