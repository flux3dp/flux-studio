define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!views/settings/Setting-Menuless-Top-Nav',
    'css!cssHome/pages/settings'
], function($, React, i18n, TopNav) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                render : function() {
                    var lang = args.state.lang;

                    return (
                        <div className="detect-wifi">
                            <TopNav lang={lang} hideBack={true}/>
                            <div className="center">
                                <img src="/img/img-wifi.png" />
                                <div className="font1 line1">{lang.wifi.home.line1}</div>
                                <div className="font2 line2">{lang.wifi.home.line2}</div>
                                <div className="line3">
                                    <a className="btn btn-default-dark">{lang.wifi.home.select}</a>
                                </div>
                                <div className="line4">
                                    <a>{lang.wifi.home.no_available_wifi}</a>
                                </div>
                            </div>
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