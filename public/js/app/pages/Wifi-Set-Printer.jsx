define([
    'react',
    'app/actions/initialize-machine',
    'helpers/api/usb-config',
    'jsx!widgets/Modal',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'helpers/api/config'
], function(
    React,
    initializeMachine,
    usbConfig,
    Modal,
    AlertActions,
    AlertStore,
    Config
) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({

            getInitialState: function() {
                return {
                    lang                 : args.state.lang,
                    requirePrinterName   : false,
                    validPrinterName     : true,
                    validPrinterPassword : true,
                    settingPrinter       : initializeMachine.settingPrinter.get()
                }
            },

            _handleSetPrinter: function(e) {
                e.preventDefault();

                var self        = this,
                    name        = self.refs.name.getDOMNode().value,
                    password    = self.refs.password.getDOMNode().value,
                    usb         = usbConfig(),
                    lang        = self.state.lang,
                    onError     = function(response) {
                        AlertActions.showPopupError('set-machine-error', response.error);
                    },
                    goNext = function() {
                        self.state.settingPrinter.name = name;
                        initializeMachine.settingPrinter.set(self.state.settingPrinter);
                        location.hash = '#initialize/wifi/select';
                    },
                    setPassword = function(password) {
                        setMachine.password(password, {
                            onSuccess: function(response) {
                                goNext();
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
                                else {
                                    goNext();
                                }
                                Config().write("configured-printer", name);
                            }
                        });
                        AlertStore.removeYesListener(startSetting);
                        AlertStore.removeNoListener(cancelSetting);
                    },
                    cancelSetting = function(){
                        AlertStore.removeYesListener(startSetting);
                        AlertStore.removeNoListener(cancelSetting);
                    },
                    setMachine,
                    isValid;

                isValid = (name !== '' && false === /[^()\u4e00-\u9fa5a-zA-Z0-9 ’'_-]+/g.test(name));

                self.setState({
                    requirePrinterName: (name !== ''),
                    validPrinterName: isValid
                });

                if (true === isValid) {

                    if (true === self.state.settingPrinter.password && '' !== password) {
                        AlertStore.onYes(startSetting);
                        AlertStore.onNo(cancelSetting);
                        AlertActions.showPopupYesNo(
                            'change-password',
                            lang.initialize.change_password.content,
                            lang.initialize.change_password.confirm
                        );
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
                        dataAttrs: {
                            'ga-event': 'confirm'
                        },
                        onClick: self.state.alertContent.onClick
                    },
                    {
                        label: lang.initialize.cancel,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
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
                    cx = React.addons.classSet,
                    invalidPrinterNameMessage = lang.initialize.invalid_device_name,
                    printerNameClass,
                    invalidPrinterNameClass,
                    printerPasswordClass,
                    content;

                printerNameClass = cx({
                    'error': !this.state.validPrinterName
                });

                printerPasswordClass = cx({
                    'error': !this.state.validPrinterPassword
                });

                invalidPrinterNameClass = cx({
                    'error-message': true,
                    'hide': this.state.validPrinterName
                });

                if (false === this.state.requirePrinterName) {
                    invalidPrinterNameMessage = lang.initialize.require_device_name;
                }

                content = (
                    <div className="set-machine-generic text-center">
                        <img className="brand-image" src="/img/menu/main_logo.svg"/>

                        <form className="form h-form" onSubmit={this._handleSetPrinter}>
                            <h1 className="headline">{lang.initialize.name_your_flux}</h1>

                            <div className="controls">
                                <label className="control" for="printer-name">
                                    <h4 className="input-head">{lang.initialize.set_machine_generic.printer_name}</h4>
                                    <input ref="name" id="printer-name" type="text" className={printerNameClass}
                                        autoFocus={true}
                                        autoComplete="off"
                                        defaultValue={this.state.settingPrinter.name}
                                        placeholder={lang.initialize.set_machine_generic.printer_name_placeholder}
                                    />
                                    <span className={invalidPrinterNameClass}>{invalidPrinterNameMessage}</span>
                                </label>
                                <label className="control" for="printer-password">
                                    <h4 className="input-head">{lang.initialize.set_machine_generic.password}</h4>
                                    <input ref="password" for="printer-password" type="password" className={printerPasswordClass}
                                    placeholder={lang.initialize.set_machine_generic.password_placeholder}/>
                                </label>
                            </div>
                            <div className="btn-v-group">
                                <button type="submit" className="btn btn-action btn-large" data-ga-event="next">
                                    {lang.initialize.next}
                                </button>
                                <a href="#initialize/wifi/setup-complete/with-usb" data-ga-event="skip" className="btn btn-link btn-large">
                                    {lang.initialize.skip}
                                </a>
                            </div>
                        </form>
                    </div>
                );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            }
        });
    };
});