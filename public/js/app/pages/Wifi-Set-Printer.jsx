define([
    'jquery',
    'react',
    'helpers/local-storage',
    'css!cssHome/pages/wifi'
], function($, React, localStorage) {
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
                    validPrinterPassword: password !== ''
                });

                isValid = name !== '' && password !== '';

                if (isValid) {
                    localStorage.set('printer-is-ready', true);
                    location.href='#initialize/wifi/setup-complete';
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
                    <div className="wifi initialization absolute-center">
                        <h1>{lang.brand_name}</h1>
                        <div>
                            <h2>{lang.wifi.set_printer.caption}</h2>
                            <div className="form">
                                <p>
                                    <label>
                                        {lang.wifi.set_printer.printer_name}
                                        <input ref="name" type="text" className={printerNameClass}
                                        placeholder={lang.wifi.set_printer.printer_name_placeholder}/>
                                    </label>
                                </p>
                                <p>
                                    <label>
                                        {lang.wifi.set_printer.password}
                                        <input ref="password" type="password" className={printerPasswordClass}
                                        placeholder={lang.wifi.set_printer.password_placeholder}/>
                                    </label>
                                </p>
                                <p>
                                {lang.wifi.set_printer.notice}
                                </p>
                            </div>
                            <div>
                                <a href="#initialize/wifi/setup-complete" className="btn" id="btn-next" onClick={this._handleSetPrinter}>
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