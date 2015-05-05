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
                    var lang = this.state.lang;

                    return (
                        <div className="form horizontal-form row-fluid clearfix">
                            <div className="col span3 printer-list">
                                <button className="btn">+{lang.settings.printer.new_printer}</button>
                                <button className="btn btn-link">FLUX 3D Printer Iron</button>
                            </div>
                            <div className="col span9">
                                <div className="row-fluid">
                                    <label className="col span3">{lang.settings.printer.name}</label>
                                    <h2 className="col span9">FLUX 3D Printer Iron</h2>
                                </div>
                                <div className="row-fluid">
                                    <label className="col span3">{lang.settings.printer.current_password}</label>
                                    <div className="col span9">
                                        <button className="btn">{lang.settings.printer.set_password}</button>
                                        <span>{lang.settings.printer.security_notice}</span>
                                    </div>
                                </div>
                                <div className="row-fluid">
                                    <label className="col span3">{lang.settings.printer.connected_wi_fi}</label>
                                    <div className="col span9">
                                        <p>
                                            <span>Flux Studi</span>
                                            <button className="btn btn-link">{lang.settings.printer.advanced} &gt;</button>
                                        </p>
                                        <button className="btn">{lang.settings.printer.join_other_network}</button>
                                        <button className="btn span12">{lang.settings.printer.disconnect_with_this_printer}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },

                getInitialState: function() {
                    return args.state;
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