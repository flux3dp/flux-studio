define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!views/settings/Setting-Menuless-Top-Nav',
    'jsx!views/wifi/Wifi-Connected',
    'css!cssHome/pages/settings',
    'css!cssHome/pages/wifi'
], function($, React, i18n, TopNav, WifiConnected) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                componentDidMount: function() {
                    $('#next').addClass('btn-default-dark');
                },
                _handleNext: function() {
                    location.href = '#studio/settings/setting-set-printer';
                },
                render : function() {
                    var lang = args.state.lang;

                    return (
                        <div className="wifi-connected wifi center">
                            <TopNav lang={lang} hideBack={true}/>
                            <WifiConnected lang={lang} onNext={this._handleNext} />
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