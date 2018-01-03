define([
    'react',
    'app/actions/initialize-machine',
    'helpers/api/discover',
    'helpers/api/upnp-config',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/alert-actions'
], function(
    React,
    initializeMachine,
    discover,
    upnpConfig,
    i18n,
    Modal,
    ProgressActions,
    ProgressConstants,
    AlertActions
) {
    'use strict';

    return function(args) {
        var upnpMethods;

        args = args || {};

        return React.createClass({

            // Lifecycle
            getInitialState: function() {
                // get machine type from url
                const re = /\?machine_type=([\w\d]+)/;
                const machine_type = re.exec(location.hash)?re.exec(location.hash)[1]:false;
                return {
                    lang: args.state.lang,
                    machine_type: machine_type
                };
            },

            componentWillUnmount: () => {
                if (typeof upnpMethods !== 'undefined') {
                    upnpMethods.connection.close();
                }
            },

            _retrieveDevice: function(e) {
                var self = this,
                    currentPrinter,
                    discoverMethods = discover('upnp-config', (printers) => {
                        clearTimeout(timer);
                        ProgressActions.close();

                        currentPrinter = printers[0] || {};
                        currentPrinter.from = 'WIFI';
                        upnpMethods = upnpConfig(currentPrinter.uuid);

                        discoverMethods.removeListener('upnp-config');

                        // temporary store for setup
                        initializeMachine.settingPrinter.set(currentPrinter);
                        location.hash = '#initialize/wifi/set-printer';
                    }),
                    timer = setTimeout(function() {
                        ProgressActions.close();
                        AlertActions.showPopupError(
                            'retrieve-device-fail',
                            self.state.lang.initialize.errors.not_found
                        );
                        clearTimeout(timer);
                    }, 1000);

                ProgressActions.open(ProgressConstants.NONSTOP);
            },

            render : function() {
                const lang = this.state.lang;
                const localLang = lang.initialize.notice_from_device;
                const wrapperClassName = {
                        'initialization': true
                    };
                const imgSrcs = {
                        en: {
                            delta: 'img/wifi-error-notify-delta-en.png',
                            beambox: 'img/wifi-error-notify-beambox-en.png'
                        },
                        zh: {
                            delta: 'img/wifi-error-notify-delta-zh.png',
                            beambox: 'img/wifi-error-notify-beambox-zh.png'
                        }
                    };
                const machineType = (this.state.machine_type === 'beambox')?'beambox':'delta';
                console.log('this.state.machine_type: ', this.state.machine_type);
                    
                const imgLang = 'en' === i18n.getActiveLang() ? 'en' : 'zh';
                console.log('imgLang: ', imgLang);
                const imgSrc = imgSrcs[imgLang][machineType];
                const content = (
                        <div className="device-not-found text-center">
                            <img className="brand-image" src="img/menu/main_logo.svg"/>
                            <div>
                                <img className="not-found-img" src={imgSrc}/>
                                <div className="button-group btn-v-group">
                                    <button data-ga-event="retry-getting-device-from-wifi" className="btn btn-action btn-large" onClick={this._retrieveDevice}>
                                        {lang.initialize.retry}
                                    </button>
                                    <a href="#initialize/wifi/connect-machine" data-ga-event="back" className="btn btn-link btn-large">
                                        {lang.initialize.back}
                                    </a>
                                </div>
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
