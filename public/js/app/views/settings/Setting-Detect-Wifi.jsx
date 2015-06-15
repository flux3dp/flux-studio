define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!views/settings/Setting-Menuless-Top-Nav',
    'jsx!views/wifi/Detect-Wifi',
    'css!cssHome/pages/settings',
    'css!cssHome/pages/wifi'
], function($, React, i18n, TopNav, DetectWifi) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                componentDidMount: function() {
                    $('#btn-start').addClass('btn-default-dark');
                },
                _handleStartDetect: function() {
                    location.href = '#studio/settings/setting-select-wifi';
                },
                _handleCancel: function() {

                },
                render : function() {
                    var lang = args.state.lang;

                    return (
                        <div className="detect-wifi">
                            <TopNav lang={lang} hideBack={true} />
                            <DetectWifi
                                lang={lang}
                                onStartDetect={this._handleStartDetect}
                                onCancel={this._handleCancel} />
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