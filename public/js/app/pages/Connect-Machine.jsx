define([
    'react',
    'app/actions/initialize-machine',
    'helpers/api/discover',
    'helpers/api/usb-config',
    'helpers/api/upnp-config',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'helpers/device-master'
], function(
    React,
    initializeMachine,
    discover,
    usbConfig,
    upnpConfig,
    Modal,
    PrinterSelector,
    AlertActions,
    ProgressActions,
    ProgressConstants,
    DeviceMaster
) {
    'use strict';

    return function(args) {
        var upnpMethods,

        args = args || {};

        return React.createClass({

            componentWillMount: function() {
            },

            componentWillUnmount: () => {
                if ('undefined' !== typeof upnpMethods) {
                    upnpMethods.connection.close();
                }
            },

            // UI events
            _selectMachineType: function(type) {
                this.setState({
                    machine_type: type
                });
            },

            _setSettingPrinter: function(printer) {
                // temporary store for setup
                initializeMachine.settingPrinter.set(printer);
                location.hash = '#initialize/wifi/set-printer';
            },

            _onUsbStartingSetUp: function(e) {
                var self = this,
                    lang = this.state.lang,
                    usb = usbConfig({forceReconnect: true});

                self._toggleBlocker(true);

                usb.list({
                    onSuccess: function(response) {
                        response = response || {};
                        self._toggleBlocker(false);
                        response.from = 'USB';
                        self._setSettingPrinter(response);
                    },
                    onError: function(response) {
                        self._toggleBlocker(false);
                        if(self.state.machine_type === 'beambox') {
                            AlertActions.showPopupError('connection-fail',
                                lang.initialize.errors.keep_connect.content_beambox,
                                lang.initialize.errors.keep_connect.caption
                            );
                        } else {
                            AlertActions.showPopupError('connection-fail',
                                lang.initialize.errors.keep_connect.content_delta,
                                lang.initialize.errors.keep_connect.caption
                            );
                        }
                    }
                });
            },

            _onWifiStartingSetUp: function(e) {
                var self = this,
                    discoverMethods,
                    timer;

                discoverMethods = discover('upnp-config', (printers) => {
                    clearTimeout(timer);

                    // if (1 < printers.length) {
                    if (Object.keys(printers).length > 1) {
                        self._toggleBlocker(false);
                        self.setState({
                            showPrinters: true
                        });
                    }
                    else {
                        self._onGettingPrinter(printers[0]);
                    }

                    discoverMethods.removeListener('upnp-config');
                });

                timer = setTimeout(function() {
                    clearTimeout(timer);
                    self._toggleBlocker(false);
                    const machine_type = self.state.machine_type;
                    location.hash = '#initialize/wifi/not-found' + '/?machine_type=' + machine_type;
                }, 1000);

                self._toggleBlocker(true);
            },

            _toggleBlocker: function(open) {
                if (true === open) {
                    ProgressActions.open(ProgressConstants.NONSTOP);
                }
                else {
                    ProgressActions.close();
                }
            },

            _onGettingPrinter: function(currentPrinter) {
                var self = this,
                    lastError;

                self._toggleBlocker(true);

                currentPrinter = currentPrinter || {};
                currentPrinter.from = 'WIFI';
                currentPrinter.apName = currentPrinter.name;
                upnpMethods = upnpConfig(currentPrinter.uuid);

                upnpMethods.ready(function() {
                    self._toggleBlocker(false);

                    if ('undefined' !== typeof lastError) {
                        upnpMethods.addKey();
                    }

                    self._setSettingPrinter(currentPrinter);
                })
                .always(() => {
                    self._toggleBlocker(false);
                })
                .progress(function(response) {
                    switch (response.status) {
                    case 'error':
                        lastError = response;
                        self._toggleBlocker(false);
                        break;
                    case 'waiting':
                        currentPrinter.plaintext_password = response.plaintext_password;
                        self._toggleBlocker(true);
                        break;
                    }
                });
            },

            _closePrinterList: function() {
                this.setState({
                    showPrinters: false
                });
            },

            // Lifecycle
            getInitialState: function() {
                var self = this;
                setInterval(function() {
                    self.setState({usbConnected: (DeviceMaster.getAvailableUsbChannel() >= 0)});
                }, 1000);
                // get machine type from url
                const re = /\?machine_type=([\w\d]+)/;
                const machine_type = re.exec(location.hash)?re.exec(location.hash)[1]:false;
                console.log('machine_type: ', machine_type);
                return {
                    lang: args.state.lang,
                    showPrinters: false,
                    usbConnected: false,
                    machine_type: machine_type // beambox or delta
                };
            },

            _renderPrinters: function(lang) {
                var content = (
                    <PrinterSelector
                        uniqleId="connect-via-wifi"
                        className="absolute-center"
                        lang={lang}
                        forceAuth={true}
                        bypassDefaultPrinter={true}
                        bypassCheck={true}
                        onGettingPrinter={this._onGettingPrinter}
                    />
                );

                return (
                    true === this.state.showPrinters ?
                    <Modal onClose={this._closePrinterList} content={content}/> :
                    ''
                );
            },

            _renderSelectMachineStep: function() {
                const lang = this.state.lang;                
                return (
                    <div className="select-machine-type">
                        <h1 className="main-title">{lang.initialize.select_machine_type}</h1>
                        <div className="btn-h-group">
                            <button
                                className="btn btn-action btn-large"
                                onClick={()=>this._selectMachineType("beambox")}
                            >
                                <p className="subtitle">Beambox</p>
                            </button>
                            <button
                                className="btn btn-action btn-large"
                                onClick={()=>this._selectMachineType("delta")}
                            >
                                <p className="subtitle">FLUX Delta</p>
                            </button>
                        </div>
                    </div>
                );
            },
            
            _renderConnectionStep : function() {
                const lang = this.state.lang;
                const usbButtonClass = React.addons.classSet({
                    'btn': true,
                    'btn-action': true,
                    'btn-large': true,
                    'usb-disabled': !this.state.usbConnected
                });
                return (
                    <div className="btn-h-group">
                        <button
                            className="btn btn-action btn-large"
                            data-ga-event="next-via-wifi"
                            onClick={this._onWifiStartingSetUp}
                        >
                            <h1 className="headline">{lang.initialize.connect_flux}</h1>
                            <p className="subtitle">{lang.initialize.via_wifi}</p>
                            <img className="scene" src="img/via-wifi.png"/>
                        </button>
                        <button
                            className={usbButtonClass}
                            data-ga-event="next-via-usb"
                            onClick={this._onUsbStartingSetUp}
                        >
                            <h1 className="headline">{lang.initialize.connect_flux}</h1>
                            <p className="subtitle">{lang.initialize.via_usb}</p>
                            <img className="scene" src="img/wifi-plug-02.png"/>
                        </button>
                    </div>
                );
            },

            render: function() {
                const lang = this.state.lang;
                const wrapperClassName = {
                    'initialization': true
                };
                const printersSelection = this._renderPrinters(lang);
                const innerContent = (!this.state.machine_type)?this._renderSelectMachineStep():this._renderConnectionStep();
                const content = (
                    <div className="connect-machine text-center">
                        <img className="brand-image" src="img/menu/main_logo.svg"/>
                        <div className="connecting-means">
                            {innerContent}
                            <a href="#initialize/wifi/setup-complete/with-usb" data-ga-event="skip" className="btn btn-link btn-large">
                                {lang.initialize.no_machine}
                            </a>
                        </div>
                        {printersSelection}
                    </div>
                );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            },

        });
    };
});
