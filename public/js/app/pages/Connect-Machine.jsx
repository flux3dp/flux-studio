define([
    'react',
    'app/actions/initialize-machine',
    'helpers/api/usb-config',
    'jsx!widgets/Modal',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/constants/progress-constants'
], function(
    React,
    initializeMachine,
    usbConfig,
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
            _onStartingSetUp: function(e) {
                var self = this,
                    lang = this.state.lang,
                    usb = usbConfig(),
                    goNext = function(printer) {
                        // temporary store for setup
                        initializeMachine.settingPrinter.set(printer);
                        location.hash = '#initialize/wifi/set-printer';
                    };

                self._toggleBlocker(true);

                usb.list({
                    onSuccess: function(response) {
                        self._toggleBlocker(false);
                        goNext(response);
                    },
                    onError: function(response) {
                        self._toggleBlocker(false);
                        AlertActions.showPopupError('connection-fail', 
                            lang.initialize.errors.keep_connect.content, 
                            lang.initialize.errors.keep_connect.caption);
                    }
                });
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
                            <div>
                                <h1 className="headline">{lang.initialize.connect_flux}</h1>
                                <img className="scene" src="/img/wifi-plug-01.png"/>
                                <div className="btn-v-group">
                                    <button className="btn btn-action btn-large" data-ga-event="next" onClick={this._onStartingSetUp} autoFocus={true}>
                                        {lang.initialize.next}
                                    </button>
                                    <a href="#initialize/wifi/setup-complete/with-usb" data-ga-event="skip" className="btn btn-link btn-large">
                                        {lang.initialize.no_machine}
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