define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return {
                    validPrinterName    : true,
                    validPrinterPassword: true
                }
            },
            componentDidMount: function() {
            },
            _handleSetPrinter: function(e) {
                e.preventDefault();

                var name        = this.refs.name.getDOMNode().value,
                    password    = this.refs.password.getDOMNode().value,
                    isValid;

                this.setState({
                    validPrinterName    : name !== '',
                });

                isValid = (name !== '');

                if (isValid) {
                    location.href='#initialize/wifi/configuring-flux';
                }
            },
            render : function() {
                var lang = args.state.lang,
                    cx = React.addons.classSet,
                    printerNameClass,
                    printerPasswordClass;

                printerNameClass = cx({
                    'required'  : true,
                    'error'     : !this.state.validPrinterName
                });

                printerPasswordClass = cx({
                    'required'  : true,
                    'error'     : !this.state.validPrinterPassword
                });

                return (
                    <div className="wifi initialization absolute-center text-center">
                        <h1>{lang.welcome_headline}</h1>
                        <div>
                            <h2>{lang.wifi.set_printer.caption}</h2>
                            <div className="wifi-form row-fluid clearfix">
                                <div className="col span5 flux-printer">
                                    <img src="/img/img-flux-printer.png"/>
                                </div>
                                <div className="col span7 text-left">
                                    <p>
                                        <label for="printer-name">
                                            {lang.wifi.set_printer.printer_name}
                                        </label>
                                        <input ref="name" id="printer-name" type="text" className={printerNameClass}
                                        placeholder={lang.wifi.set_printer.printer_name_placeholder}/>
                                    </p>
                                    <p>
                                        <label for="printer-password">
                                            {lang.wifi.set_printer.password}
                                        </label>
                                        <input ref="password" for="printer-password" type="password" className={printerPasswordClass}
                                        placeholder={lang.wifi.set_printer.password_placeholder}/>
                                    </p>
                                    <p className="notice">
                                        {lang.wifi.set_printer.notice}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <a className="btn btn-large" id="btn-next" onClick={this._handleSetPrinter}>
                                    {lang.wifi.set_printer.next}</a>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});