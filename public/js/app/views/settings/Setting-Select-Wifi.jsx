define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/local-storage',
    'jsx!views/settings/Setting-Menuless-Top-Nav',
    'jsx!views/wifi/Select-Wifi',
    'css!cssHome/pages/settings',
    'css!cssHome/pages/wifi'
], function($, React, i18n, localStorage, TopNav, SelectWifi) {
    'use strict';

    return function(args) {
        args = args || {};

        args.props.items = [];
        for (var i = 0; i < 10; i++) {
            // todo
            args.props.items.push({
                id: i,
                name: 'test-' + i,
                serial: i
            });
        }

        var options = [],
            View = React.createClass({
                _handleWifiSelect: function(id, name) {
                    localStorage.set(
                        'setting-wifi',
                        {
                            id: id,
                            name: name,
                        }
                    );
                    location.href = '/#studio/settings/setting-wifi-set-password';
                },
                render: function() {
                    var lang = args.state.lang;

                    return (
                        <div className="select-wifi wifi center">
                            <TopNav lang={lang} hideBack={true}/>
                            <div className="caption font1">{lang.wifi.select.choose_wifi}</div>
                            <SelectWifi lang={lang} onWifiSelect={this._handleWifiSelect} />
                            <div className="footer-message">
                                <a className="font3">{lang.wifi.select.no_wifi_available}</a></div>
                        </div>
                    )
                }

            });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code],
                selected: lang_code === i18n.getActiveLang()
            });
        }

        return View;
    };
});