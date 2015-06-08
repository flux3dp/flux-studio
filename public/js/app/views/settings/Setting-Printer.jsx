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
                    printers = [
                        {name: 'FLUX 3D Printer Li'},
                        {name: 'FLUX 3D Printer Si'},
                        {name: 'FLUX 3D Printer Cu'},
                    ]

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
                    var printerList = args.state.printers.map(function(printer, i) {
                            return (
                                <li><span className="print-item" data-name={printer.name}>{printer.name}</span></li>
                            );
                        }, this),
                        lang = args.state.lang,
                        printer,
                        passwordConsole,
                        passwordSection,
                        wifiSection;

                    printer = (
                        <div className="row-fluid printer-name">
                            <label className="label">{lang.settings.printer.name}</label>
                            <div className="name">{args.state.first_printer.name}</div>
                        </div>
                    );

                    passwordConsole = (
                        <div className="row-fluid set-password">
                            <label className="label">{lang.settings.printer.current_password}</label>
                            <div className="password">
                                <table>
                                    <tr>
                                        <td>
                                            <button className="btn btn-default-light font3" onClick={this._handleDisplayPasswordSection}>{lang.settings.printer.set_password}</button></td>
                                        <td>
                                            <span>{lang.settings.printer.security_notice}</span></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    );

                    passwordSection = (
                        <div className="reset-password">
                            <div className="row-fluid">
                                <label className="label">{lang.settings.printer.your_password}</label>
                                <div className="entry">
                                    <input type="password" />
                                </div>
                            </div>
                            <div className="row-fluid">
                                <label className="label">{lang.settings.printer.confirm_password}</label>
                                <div className="entry">
                                    <input type="password" />
                                </div>
                            </div>
                            <div className="row-fluid">
                                <div className="">
                                    <button className="btn btn-default-light" onClick={this._handleSetPassword}>{lang.settings.printer.save_password}</button>
                                </div>
                            </div>
                        </div>
                    );

                    wifiSection = (
                        <div className="row-fluid wifi">
                            <label className="">{lang.settings.printer.connected_wi_fi}</label>
                            <div>
                                <div className="join-network">
                                    <span className="name">Flux Studio</span>
                                    <a className="pull-right">{lang.settings.printer.advanced} &gt;</a>
                                </div>
                                <div>
                                    <button className="btn btn-default-light">{lang.settings.printer.join_other_network}</button>
                                </div>
                                <div className="remove-printer">
                                    <a>{lang.settings.printer.disconnect_with_this_printer}</a>
                                </div>
                            </div>
                        </div>
                    );

                    if(!this.state.displayPassword) {
                        passwordSection = <div></div>
                    } else {
                        passwordConsole = <div></div>
                    }

                    return (
                        <div className="form horizontal-form printer row-fluid clearfix">
                            <div className="col span3 printer-list">
                                <a href="#initialize/wifi/ask" id="btn-new-printer" className="add-printer">
                                <i className="fa fa-plus"></i>
                                {lang.settings.printer.new_printer}</a>
                                <ul>
                                    {printerList}
                                </ul>
                            </div>
                            <div className="col span6">
                                {printer}

                                {passwordConsole}

                                {passwordSection}

                                {wifiSection}
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