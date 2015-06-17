define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/local-storage',
    'jsx!views/settings/Setting-Menuless-Top-Nav',
    'jsx!views/wifi/Set-Password'
], function($, React, i18n, localStorage, TopNav, SetPassword) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                componentDidMount: function() {
                    $('#btn-join').addClass('btn-default-dark');
                    $('#btn-cancel').addClass('btn-default-light');
                },
                _handleJoin: function() {
                    setTimeout(function() {
                        location.href = '#studio/settings/setting-wifi-connected';
                    }, 2000);
                },
                _handleBack: function() {
                    location.href = '#studio/settings/setting-select-wifi'
                },
                render : function() {
                    var lang = args.state.lang,
                        wifiInfo = localStorage.get('setting-wifi');

                    return (
                        <div className="set-password center">
                            <TopNav lang={lang} hideBack={true}/>
                            <SetPassword
                                lang={lang}
                                wifiName={wifiInfo.name}
                                onJoin={this._handleJoin}
                                onBack={this._handleBack} />
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