define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'jsx!widgets/Modal',
    'helpers/api/config',
    'helpers/api/usb-config'
], function($, React, i18n, SelectView, Modal, config, usbConfig) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            HomeView;

        HomeView = React.createClass({
            // UI events
            _onSkipSettingUp: function(e) {
                config().write('printer-is-ready', true, {
                    onFinished: function() {
                        location.hash = '#studio/print/';
                        console.log(location.hash);
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
                    };

                self.setProps({
                    usbConfig: usb
                });

                toggleBlocker(true);

                usb.list({
                    onSuccess: function(response) {
                        toggleBlocker(false);
                        location.hash = '#initialize/wifi/ask/' + response.serial;
                    },
                    onError: function(response) {
                        toggleBlocker(false);

                        // TODO: when this function is fired that means no machine available.
                    }
                });
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
            },

            componentWillUnmount: function () {
                if ('undefined' !== typeof this.props.usbConfig) {
                    this.props.usbConfig.connection.close();
                }
            }
        });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code],
                selected: lang_code === i18n.getActiveLang()
            });
        }

        return HomeView;
    };
});