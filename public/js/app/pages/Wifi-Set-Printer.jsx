define([
    'react',
    'helpers/local-storage',
    'jsx!widgets/Modal',
    'helpers/api/usb-config'
], function(React, localStorage, Modal, usbConfig) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({

            getInitialState: function() {
                return {
                    validPrinterName    : true,
                    validPrinterPassword: true
                }
            },

            _handleSetPrinter: function(e) {
                e.preventDefault();

                var name        = this.refs.name.getDOMNode().value,
                    password    = this.refs.password.getDOMNode().value,
                    usb         = usbConfig(),
                    printer     = localStorage.get('setting-printer'),
                    onError     = function(response) {
                        // TODO: show error message
                    },
                    setPassword = function(password) {
                        setMachine.password(password, {
                            onSuccess: function(response) {
                                printer.name = name;
                                localStorage.set('setting-printer', printer);
                                location.hash = '#initialize/wifi/select';
                            }
                        });
                    },
                    setMachine,
                    isValid;

                this.setState({
                    validPrinterName    : name !== '',
                });

                isValid = (name !== '');

                if (true === isValid) {
                    setMachine = usb.setMachine({
                        onError: onError
                    });

                    setMachine.name(name, {
                        onSuccess: function(response) {
                            setPassword(password);
                        }
                    });
                }
            },

            render : function() {
                var lang = args.state.lang,
                    cx = React.addons.classSet,
                    printerNameClass,
                    printerPasswordClass,
                    content;

                printerNameClass = cx({
                    'required'  : true,
                    'error'     : !this.state.validPrinterName
                });

                printerPasswordClass = cx({
                    'required'  : true,
                    'error'     : !this.state.validPrinterPassword
                });

                content = (
                    <div className="wifi initialization absolute-center text-center">
                        <h1>{lang.welcome_headline}</h1>
                        <form>
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
                                        autoFocus={true}
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
                                <button className="btn btn-action btn-large" id="btn-next" onClick={this._handleSetPrinter}>
                                    {lang.wifi.set_printer.next}</button>
                            </div>
                        </form>
                    </div>
                );

                return (
                    <Modal content={content}/>
                );
            }
        });
    };
});