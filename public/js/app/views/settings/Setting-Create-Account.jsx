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
                        <div className="create-account">
                            <TopNav lang={lang}/>
                            <div className="account-info">
                                <h2>Create new account</h2>
                                <div className="form-group">
                                    <label className="font2">{lang.settings.create_account.create}</label>
                                    <input className="font3" type="text" placeholder="mail@flux.com" />
                                </div>
                                <div className="form-group">
                                    <label className="font2">{lang.settings.create_account.password}</label>
                                    <input className="font3" type="password" placeholder="" />
                                </div>
                                <div className="form-group">
                                    <label className="font2">{lang.settings.create_account.confirm_password}</label>
                                    <input className="font3" type="password" placeholder="" />
                                </div>
                                <div className="actions">
                                    <div><a href="#studio/settings/setting-activation-notice" className="btn btn-default-dark">{lang.settings.create_account.signup}</a></div>
                                    <div><a className="font4" href="#">{lang.settings.create_account.not_now}</a></div>
                                </div>
                            </div>
                        </div>
                    );
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