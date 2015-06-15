define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'css!cssHome/pages/settings'
], function($, React, i18n, SelectView) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                getInitialState: function() {
                    return {
                        showPasswordconfiguration: false
                    };
                },
                _renderChangePasswordSection: function(lang) {
                    return (
                        <div className="reset-password">
                            <div className="row-fluid">
                                <div>
                                    <label className="label font3">{lang.settings.printer.your_password}</label>
                                </div>
                                <div className="entry span9">
                                    <input type="password" />
                                </div>
                            </div>
                            <div className="row-fluid">
                                <div>
                                    <label className="label font3">{lang.settings.printer.confirm_password}</label>
                                </div>
                                <div className="entry span9">
                                    <input type="password" />
                                </div>
                            </div>
                            <div className="row-fluid">
                                <div className="entry span9">
                                    <button className="btn btn-default-light pull-right" onClick={this._handleSetPassword}>{lang.settings.printer.save_password}</button>
                                </div>
                            </div>
                        </div>
                    );
                },
                _handleConfigPassword: function() {
                    this.setState({ showPasswordconfiguration: true });
                },
                _handleSetPassword: function() {
                    this.setState({ showPasswordconfiguration: false });
                },
                render : function() {
                    var lang = args.state.lang,
                        passwordSection = this._renderChangePasswordSection(lang);

                    if(!this.state.showPasswordconfiguration) {
                        passwordSection = (<a className="btn btn-default-light font3" onClick={this._handleConfigPassword}>{lang.settings.flux_cloud.change_password}</a>);
                    }

                    return (
                        <div className="form main cloud">
                            <div className="row-fluid">
                                <div className="span3 label font2">{lang.settings.flux_cloud.email}</div>
                                <div className="span9 controls">user@flux3dp.com</div>
                            </div>
                            <div className="row-fluid">
                                <div className="span3 label font2">{lang.settings.flux_cloud.password}</div>
                                <div className="span9 controls">
                                    {passwordSection}
                                </div>
                            </div>
                            <div className="row-fluid">
                                <div className="span3 label font2 connected-printer">{lang.settings.flux_cloud.connected_printer}</div>
                                <div className="span9 font3">
                                    <div className="row-fluid">
                                        <div className="span6 name">user@flux3dp.com</div>
                                        <div className="span6 actions"><a className="fa fa-times"></a></div>
                                    </div>
                                    <div className="row-fluid">
                                        <div className="span6 name">user@flux3dp.com</div>
                                        <div className="span6 actions"><a>connect</a></div>
                                    </div>
                                </div>
                            </div>
                            <div className="row-fluid footer">
                                <a className="btn btn-default-dark btn-long">{lang.settings.done}</a>
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