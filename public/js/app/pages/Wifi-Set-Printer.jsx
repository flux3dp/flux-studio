define([
    'react',
    'app/actions/initialize-machine',
    'helpers/api/usb-config',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert'
], function(React, initializeMachine, usbConfig, Modal, Alert) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({

            getInitialState: function() {
                return {
                    lang: args.state.lang,
                    validPrinterName    : true,
                    validPrinterPassword: true,
                    settingPrinter: initializeMachine.settingPrinter.get(),
                    openAlert: false,
                    alertContent: {}
                }
            },

            _handleSetPrinter: function(e) {
                e.preventDefault();

                var self        = this,
                    name        = self.refs.name.getDOMNode().value,
                    password    = self.refs.password.getDOMNode().value,
                    usb         = usbConfig(),
                    onError     = function(response) {
                        // TODO: show error message
                    },
                    setPassword = function(password) {
                        setMachine.password(password, {
                            onSuccess: function(response) {
                                self.state.settingPrinter.name = name;
                                initializeMachine.settingPrinter.set(self.state.settingPrinter);
                                location.hash = '#initialize/wifi/select';
                            }
                        });
                    },
                    startSetting = function() {
                        setMachine = usb.setMachine({
                            onError: onError
                        });

                        setMachine.name(name, {
                            onSuccess: function(response) {
                                if ('' !== password) {
                                    setPassword(password);
                                }
                            }
                        });
                    },
                    setMachine,
                    isValid;

                self.setState({
                    validPrinterName: name !== '',
                });

                isValid = (name !== '');

                if (true === isValid) {

                    if (true === self.state.settingPrinter.password && '' !== password) {
                        self.setState({
                            openAlert: true,
                            alertContent: {
                                caption: '',
                                message: self.state.lang.initialize.change_password,
                                onClick: function(e) {
                                    startSetting();
                                }
                            }
                        });
                    }
                    else {
                        startSetting();
                    }

                }
            },

            _renderAlert: function(lang) {
                var self = this,
                    buttons = [{
                        label: lang.initialize.confirm,
                        className: 'btn-action',
                        onClick: self.state.alertContent.onClick
                    },
                    {
                        label: lang.initialize.cancel,
                        onClick: function(e) {
                            self.setState({
                                openAlert: false
                            });
                        }
                    }],
                    content = (
                        <Alert caption={this.state.alertContent.caption} message={this.state.alertContent.message} buttons={buttons}/>
                    );

                return (
                    true === this.state.openAlert ?
                    <Modal content={content}/> :
                    ''
                );
            },

            render : function() {
                var lang = this.state.lang,
                    wrapperClassName = {
                        'initialization': true
                    },
                    alert = this._renderAlert(lang),
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
                    <div className="set-machine-generic text-center">
                        <img className="brand-image" src="/img/menu/main_logo.svg"/>

                        <form className="form h-form">
                            <h1 className="headline">{lang.initialize.name_your_flux}</h1>
                            <p>{lang.initialize.why_need_name}</p>

                            <div className="controls">
                                <p className="control">
                                    <label for="printer-name">
                                        {lang.initialize.set_machine_generic.printer_name}
                                    </label>
                                    <input ref="name" id="printer-name" type="text" className={printerNameClass}
                                    autoFocus={true}
                                    defaultValue={this.state.settingPrinter.name}
                                    placeholder={lang.initialize.set_machine_generic.printer_name_placeholder}/>
                                </p>
                                <p className="control">
                                    <label for="printer-password">
                                        {lang.initialize.set_machine_generic.password}
                                    </label>
                                    <input ref="password" for="printer-password" type="password" className={printerPasswordClass}
                                    placeholder={lang.initialize.set_machine_generic.password_placeholder}/>
                                </p>
                            </div>
                            <div className="btn-v-group">
                                <button className="btn btn-action btn-large" onClick={this._handleSetPrinter} autoFocus={true}>
                                    {lang.initialize.next}
                                </button>
                                <a href="#initialize/wifi/setup-complete/with-usb" className="btn btn-link btn-large">
                                    {lang.initialize.skip}
                                </a>
                            </div>
                        </form>
                        {alert}
                    </div>
                );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            }
        });
    };
});