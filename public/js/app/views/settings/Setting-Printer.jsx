define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'helpers/display',
    'helpers/local-storage',
    'css!cssHome/pages/settings'
], function($, React, i18n, SelectView, display, localStorage) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                getInitialState: function() {
                    var printers = localStorage.get('printers');

                    args.state.printers = printers;
                    args.state.first_printer = printers[0];

                    return {
                        displayPassword: false
                    }
                },
                _handleDisplayPasswordSection: function() {
                    this.setState({
                        displayPassword: true
                    });
                },
                _handleSetPassword: function() {
                    this.setState({
                        displayPassword: false
                    });
                },
                render : function() {
                    var PrintersGroup = args.state.printers.map(function(printer, i) {
                            return (
                                <li><button className="btn btn-link print-item" data-name={printer.name}>{printer.name}</button></li>
                            );
                        }, this),
                        lang = args.state.lang,
                        passwordConsole,
                        passwordSection;

                    passwordConsole =
                        <div className="row-fluid">
                            <label className="col span3">{lang.settings.printer.current_password}</label>
                            <div className="col span9">
                                <button className="btn" onClick={this._handleDisplayPasswordSection}>{lang.settings.printer.set_password}</button>
                                <span>{lang.settings.printer.security_notice}</span>
                            </div>
                        </div>;

                    passwordSection =
                        <div>
                            <div className="row-fluid">
                                <label className="col span3">{lang.settings.printer.your_password}</label>
                                <div className="col span9">
                                    <input type="password" />
                                </div>
                            </div>
                            <div className="row-fluid">
                                <label className="col span3">{lang.settings.printer.confirm_password}</label>
                                <div className="col span9">
                                    <input type="password" />
                                </div>
                            </div>
                            <div className="row-fluid">
                                <label className="col span3">&nbsp;</label>
                                <div className="col span9">
                                    <button className="btn" onClick={this._handleSetPassword}>{lang.settings.printer.save_password}</button>
                                </div>
                            </div>
                        </div>;

                    if(!this.state.displayPassword) {
                        passwordSection = <div></div>
                    } else {
                        passwordConsole = <div></div>
                    }

                    return (
                        <div className="form horizontal-form row-fluid clearfix">
                            <div className="col span3 printer-list">
                                <a href="#initialize/wifi/ask" id="btn-new-printer" className="btn">+{lang.settings.printer.new_printer}</a>
                                <ul>
                                    {PrintersGroup}
                                </ul>
                            </div>
                            <div className="col span9">
                                <div className="row-fluid">
                                    <label className="col span3">{lang.settings.printer.name}</label>
                                    <h2 className="col span9">{args.state.first_printer.name}</h2>
                                </div>

                                {passwordConsole}

                                {passwordSection}

                                <div className="row-fluid">
                                    <label className="col span3">{lang.settings.printer.connected_wi_fi}</label>
                                    <div className="col span9">
                                        <p>
                                            <span>Flux Studi</span>
                                            <button className="btn btn-link">{lang.settings.printer.advanced} &gt;</button>
                                        </p>
                                        <button className="btn">{lang.settings.printer.join_other_network}</button>
                                        <button className="btn btn-warning span12">{lang.settings.printer.disconnect_with_this_printer}</button>
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