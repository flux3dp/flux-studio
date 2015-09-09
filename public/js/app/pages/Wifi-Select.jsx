define([
    'jquery',
    'react',
    'helpers/local-storage',
    'jsx!widgets/Modal',
    'jsx!widgets/List',
    'helpers/api/usb-config'
], function($, React, localStorage, Modal, ListView, usbConfig) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({
            _selectWifi: function(e) {
                e.preventDefault();

                var $li = $(e.target).parents('label'),
                    meta = $li.data('meta');

                if (true === meta.password) {
                    localStorage.set('setting-wifi', meta);
                    location.hash = '#initialize/wifi/set-password';
                }
            },

            getInitialState: function() {
                return {
                    lang: args.state.lang,
                    wifiOptions: []
                };
            },

            _renderWifiItem: function(wifi) {
                var lockClassName = 'fa ' + (true === wifi.password ? 'fa-lock' : 'fa-unlock-alt'),
                    meta = JSON.stringify(wifi);

                return (
                    <label data-meta={meta}>
                        <input type="radio" name="wifi-spot" value={wifi.ssid}/>
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
                        ondblclick={this._selectWifi}
                        items={this.state.wifiOptions}
                    />
                );
            },

            render: function() {
                var lang = this.state.lang,
                    items = this._renderWifiOptions(lang),
                    content = (
                        <div className="wifi initialization absolute-center text-center">
                            <h1>{lang.welcome_headline}</h1>
                            <div>
                                <h2>{lang.wifi.select.choose_wifi}</h2>

                                {items}

                                <div>
                                    <a href="#initialize/wifi/configuring-flux">{lang.wifi.select.no_wifi_available}</a>
                                </div>
                            </div>
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