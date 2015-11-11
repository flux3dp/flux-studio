define([
    'jquery',
    'react',
    'helpers/local-storage',
    'jsx!widgets/Modal',
    'jsx!widgets/List',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Alert',
    'helpers/api/usb-config',
    'helpers/api/config'
], function($, React, localStorage, Modal, ListView, ButtonGroup, Alert, usbConfig, config) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({
            // Private methods
            _completeSettingUp: function(e) {
                config().write('printer-is-ready', true, {
                    onFinished: function() {
                        location.hash = '#studio/print/';
                    }
                });
            },

            // UI events
            _confirmWifi: function(e) {
                e.preventDefault();

                var SettingWifi = localStorage.get('setting-wifi');

                if (true === SettingWifi.password) {
                    location.hash = '#initialize/wifi/set-password';
                }
                else {
                    this._completeSettingUp(e);
                }
            },

            _selectWifi: function(e) {
                var $li = $(e.target).parents('label'),
                    meta = $li.data('meta');

                this.setState({
                    selectedWifi: true
                });

                localStorage.set('setting-wifi', meta);
            },

            _handleWithUSBFlashDrive: function(e) {
                this.setState({
                    openAlert: true,
                    alertContent: {
                        message: '稍後，您可以使用隨身碟，將資料上傳至機器'
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
                    alertContent: {}
                };
            },

            _renderWifiItem: function(wifi) {
                var lockClassName = 'fa ' + (true === wifi.password ? 'fa-lock' : 'fa-unlock-alt'),
                    meta = JSON.stringify(wifi);

                return (
                    <label data-meta={meta}>
                        <input type="radio" name="wifi-spot" value={wifi.ssid} defaultChecked={false}/>
                        <div className="row-fluid">
                            <span className="wifi-ssid">{wifi.ssid}</span>
                            <span className={lockClassName}></span>
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
                var buttons = [{
                        label: '確認',
                        onClick: this._completeSettingUp
                    }],
                    content = (
                        <Alert message={this.state.alertContent.message} buttons={buttons}/>
                    );

                return (
                    true === this.state.openAlert ?
                    <Modal content={content}/> :
                    ''
                );
            },

            render: function() {
                var lang = this.state.lang,
                    items = this._renderWifiOptions(lang),
                    buttons = [{
                        label: '建立FLUX終端連線',
                        onClick: function(e) {
                            location.hash = 'initialize/wifi/configuring-flux';
                        }
                    },
                    {
                        label: '透過隨身碟操作',
                        onClick: this._handleWithUSBFlashDrive
                    },
                    {
                        label: '連線',
                        className: (true === this.state.selectedWifi ? '' : 'btn-disabled'),
                        onClick: this._confirmWifi
                    }],
                    alert = this._renderAlert(lang),
                    content = (
                        <div className="wifi initialization absolute-center text-center">
                            <h1>{lang.welcome_headline}</h1>
                            <div>
                                <h2>{lang.wifi.select.choose_wifi}</h2>
                                {items}
                                <ButtonGroup className="footer" buttons={buttons}/>
                            </div>
                            {alert}
                        </div>
                    );

                return (
                    <Modal content={content}/>
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