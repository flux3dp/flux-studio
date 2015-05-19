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
                render : function() {
                    var lang = this.state.lang,
                        PrintersGroup = this.state.printers.map(function(printer, i) {
                            return (
                                <li><button className="btn btn-link print-item" data-name={printer.name}>{printer.name}</button></li>
                            );
                        }, this);

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
                                    <h2 className="col span9">{this.state.first_printer.name}</h2>
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
                                        <button className="btn btn-warning span12">{lang.settings.printer.disconnect_with_this_printer}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },

                getInitialState: function() {
                    var printers = localStorage.get('printers');

                    args.state.printers = printers;
                    args.state.first_printer = printers[0];

                    return args.state;
                },

                componentDidMount: function() {
                    var self = this;

                    $('#btn-new-printer').on('click', function(e) {
                        $('.popup-window').show();
                    });

                    $('.print-item').on('click', function(e) {
                        var $me = $(e.currentTarget),
                            printer_name = $me.data('name'),
                            choosen_printer = self.state.printers.filter(function(printer) {
                                return printer_name === printer.name;
                            })[0];

                        self.state.first_printer = choosen_printer;
                        console.log(choosen_printer);
                        self.setState(self.state);
                    });
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