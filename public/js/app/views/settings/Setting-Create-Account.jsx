define([
    'jquery',
    'react',
    'helpers/i18n',
    'css!cssHome/pages/settings'
], function($, React, i18n) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                render : function() {
                    var lang = args.state.lang;

                    return (
                        <div className="create-account">
                            <div className="top-nav">
                                <div className="back">
                                    <img src="http://placehold.it/40x40" />
                                </div>
                                <div className="cancel">
                                    <a className="btn btn-default-light">{lang.settings.cancel}</a>
                                </div>
                            </div>
                            <div className="account-info">
                                <h2>Create new account</h2>
                                <div className="form-group">
                                    <label className="font2">{lang.settings.create_account.create}</label>
                                    <input type="text" placeholder="mail@flux.com" />
                                </div>
                                <div className="form-group">
                                    <label className="font2">{lang.settings.create_account.password}</label>
                                    <input type="text" placeholder="" />
                                </div>
                                <div className="form-group">
                                    <label className="font2">{lang.settings.create_account.confirm_password}</label>
                                    <input type="text" placeholder="" />
                                </div>
                                <div className="actions">
                                    <div><a className="btn btn-default-dark">{lang.settings.create_account.signup}</a></div>
                                    <div><a className="font4" href="#">{lang.settings.create_account.not_now}</a></div>
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