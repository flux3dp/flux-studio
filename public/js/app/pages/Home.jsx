define([
    'react',
    'helpers/i18n',
    'helpers/local-storage',
    'jsx!widgets/Select',
    'jsx!widgets/Modal',
    'helpers/api/config',
    'helpers/api/usb-config'
], function(React, i18n, localStorage, SelectView, Modal, config, usbConfig) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({
            // UI events
            _onSkipSettingUp: function(e) {
                var goNext = function() {
                    location.hash = '#studio/print/';
                };

                config().write('printer-is-ready', true, {
                    onFinished: function() {
                        goNext();
                    }
                });
            },

            _onStartingSetUp: function(e) {
                var self = this,
                    usb = usbConfig(),
                    toggleBlocker = function(open) {
                        self.setState({
                            openBlocker: open
                        });
                    },
                    goNext = function(printer) {
                        // temporary store for setup
                        localStorage.set('setting-printer', printer);
                        location.hash = '#initialize/wifi/ask';
                    };

                toggleBlocker(true);

                usb.list({
                    onSuccess: function(response) {
                        toggleBlocker(false);
                        goNext(response);
                    },
                    onError: function(response) {
                        toggleBlocker(false);
                        // TODO: when this function is fired that means no machine available.
                    }
                });
            },

            _getLanguageOptions: function() {
                var options = [];

                for (var lang_code in args.props.supported_langs) {
                    options.push({
                        value: lang_code,
                        label: args.props.supported_langs[lang_code],
                        selected: lang_code === i18n.getActiveLang()
                    });
                }

                return options;
            },

            // renders
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
                    options = this._getLanguageOptions(),
                    content = (
                        <div className="welcome initialization text-center">
                            <h1>{lang.welcome_headline}</h1>
                            <img className="brand-image" src="/img/wel-flux-logo.png"/>
                            <div>
                                <h2>{lang.welcome.header1}</h2>
                                <p>{lang.welcome.header2}</p>
                                <div>
                                    <SelectView id="select-lang" options={options}/>
                                </div>
                                <div>
                                    <button className="btn btn-action btn-large" onClick={this._onStartingSetUp}>{lang.welcome.start}</button>
                                </div>
                                <div>
                                    <button className="btn btn-link" onClick={this._onSkipSettingUp}>{lang.welcome.skip}</button>
                                </div>
                            </div>
                            {blocker}
                        </div>
                    );

                return (
                    <Modal content={content}/>
                );
            },

            getInitialState: function() {
                return {
                    lang: args.state.lang,
                    openBlocker: false
                };
            }
        });
    };
});