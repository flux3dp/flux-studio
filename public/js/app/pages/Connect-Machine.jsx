define([
    'react',
    'app/actions/initialize-machine',
    'helpers/api/discover',
    'helpers/api/usb-config',
    'helpers/api/upnp-config',
    'jsx!widgets/Modal',
    'jsx!views/Print-Selector',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/constants/progress-constants'
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
    ProgressConstants
) {
    'use strict';

    return function(args) {

        args = args || {};

        return React.createClass({
            // UI events
            _setSettingPrinter: function(printer) {
                // temporary store for setup
                initializeMachine.settingPrinter.set(printer);
                location.hash = '#initialize/wifi/set-printer';
            },

            _onUsbStartingSetUp: function(e) {
                var self = this,
                    lang = this.state.lang,
                    usb = usbConfig();

                self._toggleBlocker(true);

                usb.list({
                    onSuccess: function(response) {
                        self._toggleBlocker(false);
                        response.from = 'USB';
                        self._setSettingPrinter(response);
                    },
                    onError: function(response) {
                        self._toggleBlocker(false);
                        AlertActions.showPopupError('connection-fail',
                            lang.initialize.errors.keep_connect.content,
                            lang.initialize.errors.keep_connect.caption);
                    }
                });
            },

            _onWifiStartingSetUp: function(e) {
                var self = this,
                    discoverMethods = discover('upnp-config', (printers) => {
                        clearTimeout(timer);

                        if (1 < printers.length) {
                            self._toggleBlocker(false);
                            self.setState({
                                showPrinters: true
                            });
                        }
                        else {
                            self._onGettingPrinter(printers[0]);
                        }

                        discoverMethods.removeListener('upnp-config');
                    }),
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
                    upnpMethods,
                    lastError;

                self._toggleBlocker(true);

                currentPrinter.from = 'WIFI';
                currentPrinter.apName = currentPrinter.name;
                upnpMethods = upnpConfig(currentPrinter.uuid);

                upnpMethods.ready(function() {
                    self._toggleBlocker(false);

                    if ('undefined' !== typeof lastError) {
                        upnpMethods.addKey();
                    }

                    self._setSettingPrinter(currentPrinter);
                }).progress(function(response) {

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
                return {
                    lang: args.state.lang,
                    showPrinters: false
                };
            },

            _renderPrinters: function(lang) {
                var content = (
                    <PrinterSelector
                        uniqleId="connect-via-wifi"
                        className="absolute-center"
                        lang={lang}
                        forceAuth={true}
                        onGettingPrinter={this._onGettingPrinter}
                    />
                );

                return (
                    true === this.state.showPrinters ?
                    <Modal onClose={this._closePrinterList} content={content}/> :
                    ''
                );
            },

            render : function() {
                var lang = this.state.lang,
                    wrapperClassName = {
                        'initialization': true
                    },
                    printersSelection = this._renderPrinters(lang),
                    content = (
                        <div className="connect-machine text-center">
                            <img className="brand-image" src="/img/menu/main_logo.svg"/>
                            <div className="connecting-means">
                                <div className="btn-h-group">
                                    <button className="btn btn-action btn-large" data-ga-event="next-via-usb" onClick={this._onWifiStartingSetUp}>
                                        <h1 className="headline">{lang.initialize.connect_flux}</h1>
                                        <p className="subtitle">{lang.initialize.via_wifi}</p>
                                        <img className="scene" src="/img/via-wifi.png"/>
                                    </button>
                                    <button className="btn btn-action btn-large" data-ga-event="next-via-wifi" onClick={this._onUsbStartingSetUp}>
                                        <h1 className="headline">{lang.initialize.connect_flux}</h1>
                                        <p className="subtitle">{lang.initialize.via_usb}</p>
                                        <img className="scene" src="/img/wifi-plug-01.png"/>
                                    </button>
                                </div>
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
            }
        });
    };
});