define([
    'react',
    'reactClassset',
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
    ReactCx,
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
            usbConnectionTestingTimer,
            args = args || {};

        return React.createClass({
            // Lifecycle

            componentWillMount: function() {
            },

            getInitialState: function() {
                var self = this;
                usbConnectionTestingTimer = setInterval(function() {
                    self.setState({usbConnected: (DeviceMaster.getAvailableUsbChannel() >= 0)});
                }, 1000);
                return {
                    lang: args.state.lang,
                    showPrinters: false,
                    usbConnected: false
                };
            },

            componentWillUnmount: () => {
                if ('undefined' !== typeof upnpMethods) {
                    upnpMethods.connection.close();
                }
                clearInterval(usbConnectionTestingTimer);
            },

            // UI events
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
                        AlertActions.showPopupError('connection-fail',
                            lang.initialize.errors.keep_connect.content,
                            lang.initialize.errors.keep_connect.caption
                        );
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
                    location.hash = '#initialize/wifi/not-found';
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

            _renderConnectionStep : function() {
                const lang = this.state.lang;
                const usbButtonClass = ReactCx.cx({
                    'btn': true,
                    'btn-action': true,
                    'btn-large': true,
                    'usb-disabled': !this.state.usbConnected
                });
                const useWifi = (
                    <button
                        className="btn btn-action btn-large"
                        data-ga-event="next-via-wifi"
                        onClick={this._onWifiStartingSetUp}
                    >
                        <h1 className="headline">{lang.initialize.connect_flux}</h1>
                        <p className="subtitle">{lang.initialize.via_wifi}</p>
                        <img className="scene" src="img/via-wifi.png"/>
                    </button>
                );
                const useUsb = (
                    <button
                        className={usbButtonClass}
                        data-ga-event="next-via-usb"
                        onClick={this._onUsbStartingSetUp}
                    >
                        <h1 className="headline">{lang.initialize.connect_flux}</h1>
                        <p className="subtitle">{lang.initialize.via_usb}</p>
                        <img className="scene" src="img/wifi-plug-01.png"/>
                    </button>
                );
                return (
                    <div className="btn-h-group">
                        {useWifi}
                        {useUsb}
                    </div>
                );
            },

            render: function() {
                const lang = this.state.lang;
                const wrapperClassName = {
                    'initialization': true
                };
                const printersSelection = this._renderPrinters(lang);
                const innerContent = this._renderConnectionStep();
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
