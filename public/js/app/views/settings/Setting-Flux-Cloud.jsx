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

                render : function() {
                    var lang = args.state.lang;

                    return (
                        <div className="form main cloud">
                            <div className="row-fluid">
                                <div className="span3 label font2">{lang.settings.flux_cloud.email}</div>
                                <div className="span9 controls">user@flux3dp.com</div>
                            </div>
                            <div className="row-fluid">
                                <div className="span3 label font2">{lang.settings.flux_cloud.password}</div>
                                <div className="span9 controls">
                                    <a className="btn btn-default-light font3">{lang.settings.flux_cloud.change_password}</a>
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