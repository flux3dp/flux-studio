define([
    'react',
    'app/actions/initialize-machine',
    'helpers/api/usb-config',
    'jsx!widgets/Alert',
    'jsx!widgets/Modal'
], function(React, initializeMachine, usbConfig, Alert, Modal) {
    'use strict';

    return function(args) {

        args = args || {};

        return React.createClass({
            // UI events
            _onStartingSetUp: function(e) {
                var self = this,
                    lang = this.state.lang,
                    usb = usbConfig(),
                    toggleBlocker = function(open) {
                        self.setState({
                            openBlocker: open
                        });
                    },
                    goNext = function(printer) {
                        // temporary store for setup
                        initializeMachine.settingPrinter.set(printer);
                        location.hash = '#initialize/wifi/set-printer';
                    };

                toggleBlocker(true);

                usb.list({
                    onSuccess: function(response) {
                        toggleBlocker(false);
                        goNext(response);
                    },
                    onError: function(response) {
                        toggleBlocker(false);
                        self.setState({
                            openAlert: true,
                            alertContent: {
                                caption: lang.initialize.errors.keep_connect.caption,
                                message: lang.initialize.errors.keep_connect.content
                            }
                        });
                    }
                });
            },

            // Lifecycle
            getInitialState: function() {
                return {
                    lang: args.state.lang,
                    openBlocker: false,
                    openAlert: false,
                    alertContent: {}
                };
            },

            _renderAlert: function(lang) {
                var self = this,
                    buttons = [{
                        label: lang.initialize.confirm,
                        onClick: function() {
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

            _renderBlocker: function() {
                var content = (
                    <div className="spinner-flip"/>
                );

                return (
                    true === this.state.openBlocker ?
                    <Modal content={content} disabledEscapeOnBackground={false}/> :
                    ''
                );
            },

            render : function() {
                var lang = this.state.lang,
                    blocker = this._renderBlocker(),
                    alert = this._renderAlert(lang),
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
                                    <button className="btn btn-action btn-large" onClick={this._onStartingSetUp} autoFocus={true}>
                                        {lang.initialize.next}
                                    </button>
                                    <a href="#initialize/wifi/setup-complete/with-usb" className="btn btn-link btn-large">
                                        {lang.initialize.skip}
                                    </a>
                                </div>
                            </div>
                            {alert}
                            {blocker}
                        </div>
                    );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            }
        });
    };
});