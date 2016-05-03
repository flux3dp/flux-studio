define([
    'react',
    'app/actions/initialize-machine',
    'helpers/api/discover',
    'helpers/api/usb-config',
    'helpers/api/upnp-config',
    'jsx!widgets/Modal',
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
                    currentPrinter,
                    upnpMethods,
                    discoverMethods = discover('upnp-config', (printers) => {
                        clearTimeout(timer);

                        currentPrinter = printers[0];
                        currentPrinter.from = 'WIFI';
                        upnpMethods = upnpConfig(currentPrinter.uuid);

                        self._setSettingPrinter(currentPrinter);

                        discoverMethods.removeListener('upnp-config');
                    }),
                    timer = setTimeout(function() {
                        location.hash = '#initialize/wifi/not-found';
                        clearTimeout(timer);
                    }, 1000);
            },

            _toggleBlocker: function(open) {
                if (true === open) {
                    ProgressActions.open(ProgressConstants.NONSTOP);
                }
                else {
                    ProgressActions.close();
                }
            },

            // Lifecycle
            getInitialState: function() {
                return {
                    lang: args.state.lang
                };
            },

            render : function() {
                var lang = this.state.lang,
                    wrapperClassName = {
                        'initialization': true
                    },
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
                        </div>
                    );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            }
        });
    };
});