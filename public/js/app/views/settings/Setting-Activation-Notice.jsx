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
                        <div className="activation-notice">
                            <TopNav lang={lang} hideBack={true}/>
                            <div className="notice-info">
                                <img src="/img/img-mail.png" />
                                <div className="info-content">
                                    <div className="font1 title">{lang.settings.activate_info.almost_there}</div>
                                    <div className="font2 description">{lang.settings.activate_info.description}</div>
                                    <div>
                                        <a className="btn btn-default-dark btn-long">{lang.settings.activate_info.got_it}</a>
                                    </div>
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