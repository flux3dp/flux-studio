define([
    'jquery',
    'react',
    'app/actions/initialize-machine',
    'jsx!widgets/Modal',
    'jsx!widgets/List',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Alert',
    'helpers/api/usb-config'
], function($, React, initializeMachine, Modal, ListView, ButtonGroup, Alert, usbConfig) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({
            // Private methods
            _openAlert: function(open, detail) {
                detail = detail || {};

                var self = this;

                return function() {
                    self.setState({
                        openAlert: open,
                        alertContent: detail,
                        openBlocker: false
                    });
                }
            },

            _openBlocker: function(open) {
                var self = this;

                return function() {
                    self.setState({
                        openBlocker: open
                    });
                }
            },

            _handleSetPassword: function(e) {
                e.preventDefault();

                var self = this,
                    wifi = initializeMachine.settingWifi.get();

                wifi.plain_password = self.refs.password.getDOMNode().value;

                initializeMachine.settingWifi.set(wifi);

                location.hash = '#initialize/wifi/set-password';
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
                    location.hash = '#initialize/wifi/setup-complete/with-wifi';
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
                var self = this,
                    lang = self.state.lang,
                    usb = usbConfig();

                self._openBlocker(true)();

                usb.setAPMode({
                    onSuccess: function(response) {
                        location.hash = 'initialize/wifi/setup-complete/station-mode';
                    },
                    onError: function() {
                        self._openAlert(true, {
                            caption: lang.initialize.errors.error,
                            message: lang.initialize.errors.select_wifi.ap_mode_fail,
                            onClick: self._openAlert(false)
                        })();
                    }
                });

            },

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

            _renderPasswordForm: function(lang) {
                var self = this,
                    settingWifi = initializeMachine.settingWifi.get(),
                    buttons = [{
                        label: lang.initialize.connect,
                        className: 'btn-action btn-large',
                        onClick: self._handleSetPassword
                    },
                    {
                        label: lang.initialize.cancel,
                        className: 'btn-link btn-large',
                        onClick: function(e) {
                            e.preventDefault();

                            self.setState({
                                openPassword: false
                            });
                        }
                    }],
                    content = (
                        <form className="form form-wifi-password">
                            <div className="notice">
                                <p>“{settingWifi.ssid}”</p>
                                <p>{lang.initialize.requires_wifi_password}</p>
                            </div>
                            <input
                                ref="password"
                                type="password"
                                className="password-input"
                                placeholder={lang.initialize.set_machine_generic.password_placeholder}
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
                var lockClassName = 'fa ' + (true === wifi.password ? 'fa-lock' : ''),
                    meta = JSON.stringify(wifi);

                return (
                    <label data-meta={meta}>
                        <input type="radio" name="wifi-spot" value={wifi.ssid} defaultChecked={false}/>
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
                    <ListView
                        ref="wifiList"
                        className="pure-list wifi-list clearfix"
                        ondblclick={this._confirmWifi}
                        onClick={this._selectWifi}
                        items={this.state.wifiOptions}
                    />
                );
            },

            _renderAlert: function(lang) {
                var state = this.state,
                    buttons = [{
                        label: lang.initialize.confirm,
                        className: 'btn-action',
                        onClick: state.alertContent.onClick
                    }],
                    content = (
                        <Alert caption={state.alertContent.caption} message={state.alertContent.message} buttons={buttons}/>
                    );

                return (
                    true === state.openAlert ?
                    <Modal content={content}/> :
                    ''
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
                        onClick: this._confirmWifi
                    },
                    {
                        label: lang.initialize.set_machine_generic.set_station_mode,
                        className: 'btn-action btn-large btn-set-station-mode',
                        onClick: this._setAsStationMode
                    },
                    {
                        label: lang.initialize.skip,
                        className: 'btn-link btn-large',
                        type: 'link',
                        href: '#initialize/wifi/setup-complete/with-usb'
                    }],
                    passwordForm = this._renderPasswordForm(lang),
                    alert = this._renderAlert(lang),
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
                            {alert}
                        </div>
                    );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            },

            componentDidMount : function() {

                var self = this,
                    usb = usbConfig(),
                    wifiOptions = [];

                usb.getWifiNetwork({
                    onSuccess: function(response) {
                        var item;

                        response.items.forEach(function(el) {
                            item = self._renderWifiItem(el);
                            wifiOptions.push({
                                value: el.ssid,
                                label: {item}
                            });

                            self.setState({
                                wifiOptions: wifiOptions
                            });
                        });
                    }
                });
            }
        });
    };
});